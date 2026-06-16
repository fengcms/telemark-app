export type UserRole = 1 | 2 | 3;

export type User = {
  id: number;
  username: string;
  realName: string;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type CustomerStatus = 0 | 1 | 2 | 3 | 4;
export type CustomerType = 0 | 1;
export type CallResult = 1 | 2 | 3 | 4;

export type Customer = {
  id: number;
  phone: string;
  name: string;
  company: string;
  type: CustomerType;
  status: CustomerStatus;
  remark: string | null;
  ownerId: number;
  batchId: number;
  createdAt: string;
  updatedAt: string;
};

export type PageResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
};

export type MySummary = {
  totalCalls: number;
  connectedCalls: number;
  totalDuration: number;
  firstCallTime: string | null;
  lastCallTime: string | null;
};

export type CallReportPayload = {
  customerId: number;
  duration: number;
  callResult: CallResult;
  callRemark?: string;
  clientRequestId: string;
  startedAt?: string;
  endedAt?: string;
};

export type CallReportResponse = {
  ok: true;
  customerId: number;
  userId: number;
  date: string;
  idempotent: boolean;
};

export type ActiveCall = {
  customer: Customer;
  startedAt: string;
};

export type PendingCallReport = CallReportPayload & {
  queuedAt: string;
  customerName?: string;
  phone?: string;
};
