import { App as CapacitorApp } from '@capacitor/app';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { RefreshCcw, Search } from 'lucide-react';
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type SearchMode = 'phoneLike' | 'nameLike' | 'companyLike';

const PAGE_SIZE = 10;
const searchModes: Array<{ value: SearchMode; label: string }> = [
  { value: 'phoneLike', label: '手机匹配' },
  { value: 'nameLike', label: '姓名匹配' },
  { value: 'companyLike', label: '公司匹配' },
];

export function CustomersPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('phoneLike');
  const [pullDistance, setPullDistance] = useState(0);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [feedbackCustomer, setFeedbackCustomer] = useState<Customer | null>(
    null,
  );
  const [duration, setDuration] = useState(0);
  const [startedAt, setStartedAt] = useState<string | undefined>();
  const [endedAt, setEndedAt] = useState<string | undefined>();
  const [message, setMessage] = useState('');

  const customerSearch = useMemo(
    () => ({
      nameLike: searchMode === 'nameLike' ? submittedSearch : undefined,
      phoneLike: searchMode === 'phoneLike' ? submittedSearch : undefined,
      companyLike: searchMode === 'companyLike' ? submittedSearch : undefined,
    }),
    [searchMode, submittedSearch],
  );

  const customersQuery = useInfiniteQuery({
    queryKey: ['customers', customerSearch],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyCustomers({
        ...customerSearch,
        page: pageParam,
        pagesize: PAGE_SIZE,
        sort: '-id',
      }),
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.page + 1) * lastPage.pageSize;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
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

  const customers =
    customersQuery.data?.pages.flatMap((page) => page.list) ?? [];
  const summary = summaryQuery.data;
  const isPulling = pullDistance > 0 || customersQuery.isRefetching;

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

  function handleSearch() {
    setSubmittedSearch(searchText.trim());
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

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        customersQuery.hasNextPage &&
        !customersQuery.isFetchingNextPage
      ) {
        void customersQuery.fetchNextPage();
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    customersQuery.hasNextPage,
    customersQuery.isFetchingNextPage,
    customersQuery.fetchNextPage,
  ]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (window.scrollY <= 0) {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    }
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (touchStartY.current === null || window.scrollY > 0) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? 0;
    const distance = Math.max(0, Math.min(96, currentY - touchStartY.current));
    setPullDistance(distance);
  }

  function handleTouchEnd() {
    const shouldRefresh = pullDistance >= 56;
    touchStartY.current = null;
    setPullDistance(0);

    if (shouldRefresh) {
      void customersQuery.refetch();
      void summaryQuery.refetch();
    }
  }

  return (
    <div
      className="page-stack"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {isPulling ? (
        <p
          className="sync-line pull-sync-line"
          style={{ transform: `translateY(${Math.min(pullDistance, 56)}px)` }}
        >
          <RefreshCcw
            aria-hidden
            className={customersQuery.isRefetching ? 'spin' : ''}
            size={18}
          />
          {customersQuery.isRefetching
            ? '正在同步最新公海库...'
            : '下拉刷新客户库'}
        </p>
      ) : null}

      <section className="call-dashboard">
        <div className="greeting-block">
          <h1>上午好，{session?.user.realName ?? session?.user.username}</h1>
          <p>今天又是充满活力的一天，加油！</p>
        </div>

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

      <div className="search-row">
        <label className="search-box">
          <Search aria-hidden size={24} />
          <input
            inputMode={searchMode === 'phoneLike' ? 'tel' : 'text'}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="搜索姓名、手机、公司..."
            value={searchText}
          />
        </label>
        <button
          aria-label="搜索"
          className="filter-button search-submit-button"
          onClick={handleSearch}
          type="button"
        >
          <Search aria-hidden size={26} />
        </button>
      </div>

      <div className="sort-pills">
        {searchModes.map((mode) => (
          <button
            className={searchMode === mode.value ? 'active' : ''}
            key={mode.value}
            onClick={() => setSearchMode(mode.value)}
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>

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
        <div className="load-more-sentinel" ref={loadMoreRef}>
          {customersQuery.isFetchingNextPage ? '加载更多客户...' : null}
          {!customersQuery.hasNextPage && customers.length > 0
            ? '没有更多客户了'
            : null}
          {customersQuery.isFetchNextPageError ? (
            <button
              onClick={() => customersQuery.fetchNextPage()}
              type="button"
            >
              加载失败，点击重试
            </button>
          ) : null}
        </div>
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
