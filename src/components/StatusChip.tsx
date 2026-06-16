import type { CustomerStatus, CustomerType } from '@/types';

const statusText: Record<CustomerStatus, string> = {
  0: '未拨打',
  1: '已接听',
  2: '无人接听',
  3: '拒接',
  4: '空号停机',
};

export function StatusChip({ status }: { status: CustomerStatus }) {
  return <span className={`chip status-${status}`}>{statusText[status]}</span>;
}

export function TypeChip({ type }: { type: CustomerType }) {
  return (
    <span className={`chip type-${type}`}>
      {type === 1 ? '意向客户' : '普通线索'}
    </span>
  );
}
