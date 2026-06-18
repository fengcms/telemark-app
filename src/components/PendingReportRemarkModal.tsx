import { Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { typeText } from '@/components/StatusChip';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { CallResult, CustomerType, PendingCallReport } from '@/types';
import { formatDateTime, formatDuration } from '@/utils/format';

const resultLabels: Record<CallResult, string> = {
  1: '已接听',
  2: '无人接听',
  3: '拒接',
  4: '空号停机',
};

const customerTypeOptions: CustomerType[] = [-1, 0, 1, 2];

export function PendingReportRemarkModal({
  onClose,
  onSave,
  reports,
}: {
  onClose: () => void;
  onSave: (value: {
    customerTypes: Record<string, CustomerType>;
    remarks: Record<string, string>;
  }) => void;
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
  const [customerTypes, setCustomerTypes] = useState<
    Record<string, CustomerType>
  >(() =>
    Object.fromEntries(
      reports.map((report) => [
        report.clientRequestId,
        report.customerType ?? 0,
      ]),
    ),
  );

  useBodyScrollLock(true);

  const canSave = useMemo(
    () =>
      reports.every((report) => {
        const hasType = customerTypes[report.clientRequestId] !== undefined;
        const hasRemark =
          report.callResult !== 1 ||
          Boolean(remarks[report.clientRequestId]?.trim());

        return hasType && hasRemark;
      }),
    [customerTypes, remarks, reports],
  );

  function handleSave() {
    if (!canSave) {
      return;
    }

    onSave({ customerTypes, remarks });
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
            <h2>补充必填信息</h2>
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
          条待补传通话记录缺少备注或线索类型。补充完整后，系统会继续上传。
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

              <div className="pending-type-grid">
                {customerTypeOptions.map((type) => (
                  <button
                    className={
                      customerTypes[report.clientRequestId] === type
                        ? 'active'
                        : ''
                    }
                    key={type}
                    onClick={() =>
                      setCustomerTypes((current) => ({
                        ...current,
                        [report.clientRequestId]: type,
                      }))
                    }
                    type="button"
                  >
                    {typeText[type]}
                  </button>
                ))}
              </div>

              {report.callResult === 1 ? (
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
              ) : null}
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
