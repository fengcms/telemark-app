import {
  clearStoredSession,
  getStoredSession,
  updateStoredAccessToken,
} from '@/store/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

type ApiOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken() {
  const session = getStoredSession();
  if (!session?.refreshToken) {
    throw new ApiError(403, '登录已过期，请重新登录');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    clearStoredSession();
    throw new ApiError(
      response.status,
      data?.message ?? '登录已过期，请重新登录',
    );
  }

  updateStoredAccessToken(data.accessToken);
  return data.accessToken as string;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false && session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    options.auth !== false &&
    options.retryOnUnauthorized !== false
  ) {
    const accessToken = await refreshAccessToken();
    headers.set('Authorization', `Bearer ${accessToken}`);

    return apiRequest<T>(path, {
      ...options,
      headers,
      retryOnUnauthorized: false,
    });
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? '请求失败');
  }

  return data as T;
}

export function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }

  const text = query.toString();
  return text ? `?${text}` : '';
}
