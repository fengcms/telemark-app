import { reportCall } from '@/api/endpoints';
import type {
  CallReportPayload,
  CustomerType,
  PendingCallReport,
} from '@/types';

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

export function getReportsMissingRemarks() {
  return getPendingReports().filter(
    (report) =>
      (report.callResult === 1 && !report.callRemark?.trim()) ||
      report.customerType === undefined,
  );
}

export function updatePendingReportRequiredInfo({
  customerTypes,
  remarks,
}: {
  customerTypes: Record<string, CustomerType>;
  remarks: Record<string, string>;
}) {
  const reports = getPendingReports();

  savePendingReports(
    reports.map((report) => {
      const remark = remarks[report.clientRequestId]?.trim();
      const customerType = customerTypes[report.clientRequestId];

      const nextReport = {
        ...report,
      };

      if (remark) {
        nextReport.callRemark = remark;
      }

      if (customerType !== undefined) {
        nextReport.customerType = customerType;
      }

      return nextReport;
    }),
  );
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
    const callRemark = pending.callRemark?.trim();

    if (
      (pending.callResult === 1 && !callRemark) ||
      pending.customerType === undefined
    ) {
      failed.push(pending);
      continue;
    }

    try {
      await reportCall({
        customerId: pending.customerId,
        duration: pending.duration,
        callResult: pending.callResult,
        callRemark: pending.callResult === 1 ? callRemark : undefined,
        customerType: pending.customerType,
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
