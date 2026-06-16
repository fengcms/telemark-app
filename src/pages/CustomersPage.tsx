import { App as CapacitorApp } from '@capacitor/app';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyCustomers, getMySummary, reportCall } from '@/api/endpoints';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import {
  FeedbackSheet,
  type FeedbackSubmitValue,
} from '@/components/FeedbackSheet';
import { useAuth } from '@/hooks/useAuth';
import {
  createManualCallEntry,
  getLatestCallForNumber,
  requestCallLogPermission,
} from '@/mobile/callLog';
import { queueCallReport } from '@/offline/callQueue';
import type { ActiveCall, Customer } from '@/types';
import { formatDuration, getErrorMessage } from '@/utils/format';

export function CustomersPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [phoneLike, setPhoneLike] = useState('');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [feedbackCustomer, setFeedbackCustomer] = useState<Customer | null>(
    null,
  );
  const [duration, setDuration] = useState(0);
  const [startedAt, setStartedAt] = useState<string | undefined>();
  const [endedAt, setEndedAt] = useState<string | undefined>();
  const [message, setMessage] = useState('');

  const customersQuery = useQuery({
    queryKey: ['customers', phoneLike],
    queryFn: () => getMyCustomers({ phoneLike, pagesize: 50 }),
  });

  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: getMySummary,
  });

  const reportMutation = useMutation({
    mutationFn: reportCall,
    onSuccess: async () => {
      setMessage('通话结果已提交');
      closeFeedback();
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['history'] });
      await queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: (error, payload) => {
      queueCallReport(payload, {
        customerName: feedbackCustomer?.name,
        phone: feedbackCustomer?.phone,
      });
      setMessage(`网络不可用，已离线保存：${getErrorMessage(error)}`);
      closeFeedback();
    },
  });

  const customers = customersQuery.data?.list ?? [];
  const summary = summaryQuery.data;

  const connectionRate = useMemo(() => {
    if (!summary?.totalCalls) {
      return '0%';
    }

    return `${Math.round((summary.connectedCalls / summary.totalCalls) * 100)}%`;
  }, [summary]);

  function closeFeedback() {
    setFeedbackCustomer(null);
    setActiveCall(null);
    setDuration(0);
    setStartedAt(undefined);
    setEndedAt(undefined);
  }

  async function handleCall(customer: Customer) {
    const nextStartedAt = new Date().toISOString();
    setMessage('');
    setActiveCall({ customer, startedAt: nextStartedAt });
    await requestCallLogPermission();
    window.location.href = `tel:${customer.phone}`;
  }

  const openFeedbackFromCall = useCallback(async (call: ActiveCall) => {
    const nativeEntry = await getLatestCallForNumber(
      call.customer.phone,
      call.startedAt,
    );
    const fallback = createManualCallEntry(call.startedAt);
    const entry = nativeEntry ?? fallback;

    setFeedbackCustomer(call.customer);
    setStartedAt(entry.startedAt);
    setEndedAt(entry.endedAt);
    setDuration(entry.duration);
  }, []);

  function handleSubmit(value: FeedbackSubmitValue) {
    if (!feedbackCustomer) {
      return;
    }

    reportMutation.mutate({
      customerId: feedbackCustomer.id,
      duration: value.duration,
      callResult: value.callResult,
      callRemark: value.callRemark,
      clientRequestId: crypto.randomUUID(),
      startedAt,
      endedAt,
    });
  }

  useEffect(() => {
    const setup = async () => {
      const handle = await CapacitorApp.addListener(
        'appStateChange',
        ({ isActive }) => {
          if (isActive && activeCall) {
            void openFeedbackFromCall(activeCall);
          }
        },
      );

      return handle;
    };

    let cleanup: (() => void) | undefined;
    void setup().then((handle) => {
      cleanup = () => {
        void handle.remove();
      };
    });

    return () => cleanup?.();
  }, [activeCall, openFeedbackFromCall]);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <header className="page-header">
          <div>
            <p>今日待拨</p>
            <h1>客户外呼</h1>
            <span className="header-subtitle">
              {session?.user.realName ?? session?.user.username}，保持节奏
            </span>
          </div>
          <button
            aria-label="刷新"
            className="icon-button hero-action"
            onClick={() => customersQuery.refetch()}
            type="button"
          >
            <RefreshCcw aria-hidden size={22} />
          </button>
        </header>

        <div className="summary-strip">
          <div>
            <strong>{summary?.totalCalls ?? 0}</strong>
            <span>已拨</span>
          </div>
          <div>
            <strong>{summary?.connectedCalls ?? 0}</strong>
            <span>接通</span>
          </div>
          <div>
            <strong>{connectionRate}</strong>
            <span>接通率</span>
          </div>
          <div>
            <strong>{formatDuration(summary?.totalDuration ?? 0)}</strong>
            <span>通话</span>
          </div>
        </div>
      </section>

      <label className="search-box">
        <Search aria-hidden size={18} />
        <input
          inputMode="tel"
          onChange={(event) => setPhoneLike(event.target.value)}
          placeholder="按手机号搜索"
          value={phoneLike}
        />
      </label>

      {message ? <p className="notice">{message}</p> : null}

      <section className="card-list">
        {customersQuery.isLoading ? (
          <EmptyState title="正在加载客户..." />
        ) : null}
        {customersQuery.isError ? (
          <EmptyState title={getErrorMessage(customersQuery.error)} />
        ) : null}
        {!customersQuery.isLoading && customers.length === 0 ? (
          <EmptyState title="暂无待拨客户">今天的队列已经清爽了。</EmptyState>
        ) : null}
        {customers.map((customer) => (
          <CustomerCard
            customer={customer}
            key={customer.id}
            onCall={handleCall}
          />
        ))}
      </section>

      <FeedbackSheet
        customer={feedbackCustomer}
        defaultDuration={duration}
        onClose={closeFeedback}
        onSubmit={handleSubmit}
        open={Boolean(feedbackCustomer)}
        submitting={reportMutation.isPending}
      />
    </div>
  );
}
