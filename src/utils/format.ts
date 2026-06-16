export function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;

  if (minutes === 0) {
    return `${rest}秒`;
  }

  return `${minutes}分${rest.toString().padStart(2, '0')}秒`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '操作失败，请稍后重试';
}
