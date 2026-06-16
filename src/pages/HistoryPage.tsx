import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { getCustomerHistory } from '@/api/endpoints';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import type { CustomerStatus, CustomerType } from '@/types';
import { getErrorMessage } from '@/utils/format';

export function HistoryPage() {
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

      <div className="history-tabs">
        {[
          ['all', '全部'],
          [1, '已接听'],
          [2, '无人接听'],
          [3, '拒接'],
          [4, '空号'],
        ].map(([value, label]) => (
          <button
            className={status === value ? 'active' : ''}
            key={String(value)}
            onClick={() => setStatus(value as CustomerStatus | 'all')}
            type="button"
          >
            {label}
          </button>
        ))}
        <button
          className={type === 1 ? 'active' : ''}
          onClick={() => setType(type === 1 ? 'all' : 1)}
          type="button"
        >
          意向客户
        </button>
      </div>

      <section className="card-list">
        {historyQuery.isLoading ? <EmptyState title="正在加载历史..." /> : null}
        {historyQuery.isError ? (
          <EmptyState title={getErrorMessage(historyQuery.error)} />
        ) : null}
        {!historyQuery.isLoading && customers.length === 0 ? (
          <EmptyState title="暂无历史客户">
            完成一次外呼后，这里会自动更新。
          </EmptyState>
        ) : null}
        {customers.map((customer) => (
          <CustomerCard customer={customer} history key={customer.id} />
        ))}
      </section>
    </div>
  );
}
