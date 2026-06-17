import { useQuery } from '@tanstack/react-query';
import { Ban, CheckCircle2, PhoneMissed, Save, SignalZero } from 'lucide-react';
import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { getCommonCallRemarks } from '@/api/endpoints';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { CallResult, Customer } from '@/types';
import { formatDuration } from '@/utils/format';

const resultOptions: Array<{
  value: CallResult;
  label: string;
  tone: string;
  Icon: typeof CheckCircle2;
}> = [
  { value: 1, label: '已接听', tone: 'connected', Icon: CheckCircle2 },
  { value: 2, label: '无人接听', tone: 'missed', Icon: PhoneMissed },
  { value: 3, label: '拒接', tone: 'rejected', Icon: Ban },
  { value: 4, label: '空号停机', tone: 'invalid', Icon: SignalZero },
];

export type FeedbackSubmitValue = {
  callResult: CallResult;
  duration: number;
  callRemark?: string;
};

export function FeedbackSheet({
  customer,
  defaultDuration,
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  customer: Customer | null;
  defaultDuration: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (value: FeedbackSubmitValue) => void;
  submitting?: boolean;
}) {
  const [callResult, setCallResult] = useState<CallResult>(1);
  const [duration, setDuration] = useState(defaultDuration);
  const [callRemark, setCallRemark] = useState('');
  const dragStartY = useRef<number | null>(null);

  const commonRemarksQuery = useQuery({
    queryKey: ['call-remarks', 'common'],
    queryFn: getCommonCallRemarks,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const visibleDuration = useMemo(
    () => Math.max(0, Math.floor(duration)),
    [duration],
  );
  const trimmedRemark = callRemark.trim();
  const canSubmit = trimmedRemark.length > 0 && !submitting;

  const commonRemarks = commonRemarksQuery.data ?? [];

  useBodyScrollLock(open);

  useEffect(() => {
    if (open) {
      setDuration(defaultDuration);
      setCallResult(1);
      setCallRemark('');
    }
  }, [defaultDuration, open]);

  if (!open || !customer) {
    return null;
  }

  function appendRemark(remark: string) {
    setCallRemark((current) => {
      const trimmed = current.trim();
      return trimmed ? `${trimmed} ${remark}` : remark;
    });
  }

  function handleDragStart(event: PointerEvent<HTMLButtonElement>) {
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragEnd(event: PointerEvent<HTMLButtonElement>) {
    const startY = dragStartY.current;
    dragStartY.current = null;

    if (startY !== null && event.clientY - startY > 36) {
      onClose();
    }
  }

  function handleSave() {
    if (!trimmedRemark) {
      return;
    }

    onSubmit({
      callResult,
      duration: visibleDuration,
      callRemark: trimmedRemark,
    });
  }

  return (
    <div className="sheet-backdrop">
      <button
        aria-label="关闭反馈面板"
        className="sheet-backdrop-dismiss"
        onClick={onClose}
        type="button"
      />
      <section aria-modal className="feedback-sheet" role="dialog">
        <button
          aria-label="关闭反馈面板"
          className="sheet-drag-handle"
          onClick={onClose}
          onPointerDown={handleDragStart}
          onPointerUp={handleDragEnd}
          type="button"
        />
        <header className="sheet-header">
          <div>
            <h2>通话结果反馈</h2>
            <p>
              {customer.name} <span>|</span> {customer.phone}
            </p>
          </div>
        </header>

        <div className="duration-panel">
          <span>通话时长</span>
          <strong>{formatDuration(visibleDuration)}</strong>
        </div>

        <div className="result-grid">
          {resultOptions.map((option) => (
            <button
              className={
                callResult === option.value
                  ? `result-tile ${option.tone} active`
                  : `result-tile ${option.tone}`
              }
              key={option.value}
              onClick={() => setCallResult(option.value)}
              type="button"
            >
              <span className="result-icon">
                <option.Icon aria-hidden size={34} />
              </span>
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>

        <label className="field">
          <span>备注记录</span>
          <textarea
            onChange={(event) => setCallRemark(event.target.value)}
            placeholder="记录客户意向、下次回访时间等"
            rows={3}
            value={callRemark}
          />
        </label>
        {!trimmedRemark ? (
          <p className="field-error">请填写备注记录后保存反馈</p>
        ) : null}

        {commonRemarks.length > 0 ? (
          <div className="quick-remarks">
            {commonRemarks.map((remark) => (
              <button
                key={remark}
                onClick={() => appendRemark(remark)}
                type="button"
              >
                {remark}
              </button>
            ))}
          </div>
        ) : null}

        <button
          className="primary-button"
          disabled={!canSubmit}
          onClick={handleSave}
          type="button"
        >
          <Save aria-hidden size={22} />
          {submitting ? '提交中...' : '保存反馈'}
        </button>
        <button className="ghost-text-button" onClick={onClose} type="button">
          暂不保存
        </button>
      </section>
    </div>
  );
}
