import { apiRequest, toQuery } from '@/api/client';
import type {
  AuthSession,
  CallReportPayload,
  CallReportResponse,
  Customer,
  CustomerStatus,
  CustomerType,
  MySummary,
  PageResponse,
} from '@/types';

export type CustomerQuery = {
  page?: number;
  pagesize?: number;
  sort?: string;
  nameLike?: string;
  phoneLike?: string;
  companyLike?: string;
};

export type HistoryQuery = CustomerQuery & {
  status?: CustomerStatus | 'all';
  type?: CustomerType | 'all';
};

export function login(username: string, password: string) {
  return apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ username, password }),
  });
}

export function logout(refreshToken: string) {
  return apiRequest<{ ok: true }>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function changePassword(oldPassword: string, newPassword: string) {
  return apiRequest<{ ok: true }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export function getMyCustomers(query: CustomerQuery = {}) {
  return apiRequest<PageResponse<Customer>>(
    `/api/my-customers${toQuery({
      page: query.page ?? 0,
      pagesize: query.pagesize ?? 50,
      sort: query.sort ?? '-id',
      'name-like': query.nameLike?.trim(),
      'phone-like': query.phoneLike?.trim(),
      'company-like': query.companyLike?.trim(),
    })}`,
  );
}

export function getCustomerHistory(query: HistoryQuery = {}) {
  return apiRequest<PageResponse<Customer>>(
    `/api/my-customers/history${toQuery({
      page: query.page ?? 0,
      pagesize: query.pagesize ?? 50,
      sort: query.sort ?? '-updatedAt',
      status: query.status === 'all' ? undefined : query.status,
      type: query.type === 'all' ? undefined : query.type,
      'name-like': query.nameLike?.trim(),
      'phone-like': query.phoneLike?.trim(),
      'company-like': query.companyLike?.trim(),
    })}`,
  );
}

export function reportCall(payload: CallReportPayload) {
  return apiRequest<CallReportResponse>('/api/calls/report', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMySummary() {
  return apiRequest<MySummary>('/api/my-summary');
}
