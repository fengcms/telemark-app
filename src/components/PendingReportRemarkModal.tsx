import { Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { CallResult, PendingCallReport } from '@/types';
import { formatDateTime, formatDuration } from '@/utils/format';

const resultLabels: Record<CallResult, string> = {
  1: '已接听',
  2: '无人接听',
  3: '拒接',
  4: '空号停机',
};

export function PendingReportRemarkModal({
  onClose,
  onSave,
  reports,
}: {
  onClose: () => void;
  onSave: (remarks: Record<string, string>) => void;
  reports: PendingCallReport[];
}) {
  const [remarks, setRemarks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      reports.map((report) => [
        report.clientRequestId,
        report.callRemark?.trim() ?? '',
      ]),
    ),
  );

  useBodyScrollLock(true);

  const canSave = useMemo(
    () =>
      reports.every((report) => remarks[report.clientRequestId]?.trim().length),
    [remarks, reports],
  );

  function handleSave() {
    if (!canSave) {
      return;
    }

    onSave(remarks);
  }

  return (
    <div className="modal-backdrop">
      <section
        aria-modal
        className="app-modal pending-remark-modal"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p>离线补传</p>
            <h2>补充通话备注</h2>
          </div>
          <button
            aria-label="关闭"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={22} />
          </button>
        </header>

        <p className="pending-remark-copy">
          有 {reports.length}{' '}
          条待补传通话记录缺少备注。补充完整后，系统会继续上传。
        </p>

        <div className="pending-remark-list">
          {reports.map((report) => (
            <article
              className="pending-remark-item"
              key={report.clientRequestId}
            >
              <header>
                <strong>
                  {report.customerName || report.phone || '未知客户'}
                </strong>
                <span>{resultLabels[report.callResult]}</span>
              </header>
              <p>
                {report.phone ? `${report.phone} · ` : ''}
                {formatDuration(report.duration)} ·{' '}
                {formatDateTime(report.endedAt ?? report.startedAt ?? null)}
              </p>
              <label className="field">
                <span>备注记录</span>
                <textarea
                  onChange={(event) =>
                    setRemarks((current) => ({
                      ...current,
                      [report.clientRequestId]: event.target.value,
                    }))
                  }
                  placeholder="请补充客户情况、跟进结果或下次联系安排"
                  rows={3}
                  value={remarks[report.clientRequestId] ?? ''}
                />
              </label>
            </article>
          ))}
        </div>

        <button
          className="primary-button"
          disabled={!canSave}
          onClick={handleSave}
          type="button"
        >
          <Save aria-hidden size={20} />
          保存并补传
        </button>
      </section>
    </div>
  );
}
