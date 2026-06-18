import type { CustomerStatus, CustomerType } from '@/types';

const statusText: Record<CustomerStatus, string> = {
  0: '未拨打',
  1: '已接听',
  2: '无人接听',
  3: '拒接',
  4: '空号停机',
};

export const typeText: Record<CustomerType, string> = {
  [-1]: '废线索',
  0: '普通线索',
  1: '意向客户',
  2: '高意向客户',
};

export function StatusChip({ status }: { status: CustomerStatus }) {
  return <span className={`chip status-${status}`}>{statusText[status]}</span>;
}

export function TypeChip({ type }: { type: CustomerType }) {
  return <span className={`chip type-${type}`}>{typeText[type]}</span>;
}
