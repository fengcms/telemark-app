import { reportCall } from '@/api/endpoints';
import type { CallReportPayload, PendingCallReport } from '@/types';

const QUEUE_KEY = 'telemark.call-report.queue';

export function getPendingReports() {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as PendingCallReport[];
  } catch {
    localStorage.removeItem(QUEUE_KEY);
    return [];
  }
}

function savePendingReports(reports: PendingCallReport[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(reports));
}

export function queueCallReport(
  payload: CallReportPayload,
  meta: Pick<PendingCallReport, 'customerName' | 'phone'> = {},
) {
  const reports = getPendingReports();
  const exists = reports.some(
    (report) => report.clientRequestId === payload.clientRequestId,
  );

  if (!exists) {
    savePendingReports([
      ...reports,
      {
        ...payload,
        ...meta,
        queuedAt: new Date().toISOString(),
      },
    ]);
  }
}

export async function flushPendingReports() {
  const reports = getPendingReports();
  const failed: PendingCallReport[] = [];
  let sent = 0;

  for (const pending of reports) {
    try {
      await reportCall({
        customerId: pending.customerId,
        duration: pending.duration,
        callResult: pending.callResult,
        callRemark: pending.callRemark,
        clientRequestId: pending.clientRequestId,
        startedAt: pending.startedAt,
        endedAt: pending.endedAt,
      });
      sent += 1;
    } catch {
      failed.push(pending);
    }
  }

  savePendingReports(failed);
  return { sent, failed: failed.length };
}
