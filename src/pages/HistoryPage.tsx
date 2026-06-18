import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { getCustomerHistory } from '@/api/endpoints';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackSheet } from '@/components/FeedbackSheet';
import { typeText } from '@/components/StatusChip';
import { useCallFeedback } from '@/hooks/useCallFeedback';
import type { CustomerStatus, CustomerType } from '@/types';
import { getErrorMessage } from '@/utils/format';

const statusFilters: Array<[CustomerStatus | 'all', string]> = [
  ['all', '全部'],
  [1, '已接听'],
  [2, '无人接听'],
  [3, '拒接'],
  [4, '空号'],
];

const typeFilters: Array<CustomerType | 'all'> = ['all', -1, 0, 1, 2];

export function HistoryPage() {
  const callFeedback = useCallFeedback();
  const [phoneLike, setPhoneLike] = useState('');
  const [status, setStatus] = useState<CustomerStatus | 'all'>('all');
  const [type, setType] = useState<CustomerType | 'all'>('all');

  const historyQuery = useQuery({
    queryKey: ['history', phoneLike, status, type],
    queryFn: () =>
      getCustomerHistory({ phoneLike, status, type, pagesize: 50 }),
  });

  const customers = historyQuery.data?.list ?? [];

  return (
    <>
      <div className="page-stack">
        <label className="search-box">
          <Search aria-hidden size={26} />
          <input
            inputMode="tel"
            onChange={(event) => setPhoneLike(event.target.value)}
            placeholder="搜索客户姓名、电话或备注..."
            value={phoneLike}
          />
        </label>

        <div className="history-filter-group">
          <div className="history-tabs">
            {statusFilters.map(([value, label]) => (
              <button
                className={status === value ? 'active' : ''}
                key={String(value)}
                onClick={() => setStatus(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="history-tabs">
            {typeFilters.map((value) => (
              <button
                className={type === value ? 'active' : ''}
                key={String(value)}
                onClick={() => setType(value)}
                type="button"
              >
                {value === 'all' ? '全部类型' : typeText[value]}
              </button>
            ))}
          </div>
        </div>

        {callFeedback.message ? (
          <p className="notice">{callFeedback.message}</p>
        ) : null}

        <section className="card-list">
          {historyQuery.isLoading ? (
            <EmptyState title="正在加载历史..." />
          ) : null}
          {historyQuery.isError ? (
            <EmptyState title={getErrorMessage(historyQuery.error)} />
          ) : null}
          {!historyQuery.isLoading && customers.length === 0 ? (
            <EmptyState title="暂无历史客户">
              完成一次外呼后，这里会自动更新。
            </EmptyState>
          ) : null}
          {customers.map((customer) => (
            <CustomerCard
              customer={customer}
              history
              key={customer.id}
              onCall={callFeedback.handleCall}
            />
          ))}
        </section>
      </div>

      <FeedbackSheet {...callFeedback.feedbackSheetProps} />
    </>
  );
}
