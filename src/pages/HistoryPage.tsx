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
      <header className="page-header">
        <div>
          <p>已拨客户</p>
          <h1>历史记录</h1>
        </div>
      </header>

      <label className="search-box">
        <Search aria-hidden size={18} />
        <input
          inputMode="tel"
          onChange={(event) => setPhoneLike(event.target.value)}
          placeholder="按手机号搜索"
          value={phoneLike}
        />
      </label>

      <div className="filter-row">
        <select
          onChange={(event) =>
            setStatus(event.target.value as CustomerStatus | 'all')
          }
          value={status}
        >
          <option value="all">全部状态</option>
          <option value={1}>已接听</option>
          <option value={2}>无人接听</option>
          <option value={3}>拒接</option>
          <option value={4}>空号停机</option>
        </select>
        <select
          onChange={(event) =>
            setType(event.target.value as CustomerType | 'all')
          }
          value={type}
        >
          <option value="all">全部类型</option>
          <option value={0}>普通线索</option>
          <option value={1}>意向客户</option>
        </select>
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
