import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { CallResult, Customer } from '@/types';
import { formatDuration } from '@/utils/format';

const resultOptions: Array<{ value: CallResult; label: string; hint: string }> =
  [
    { value: 1, label: '已接听', hint: '有沟通，自动标记意向' },
    { value: 2, label: '无人接听', hint: '稍后可再次跟进' },
    { value: 3, label: '拒接', hint: '客户明确拒绝接听' },
    { value: 4, label: '空号停机', hint: '号码不可用' },
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

  const visibleDuration = useMemo(
    () => Math.max(0, Math.floor(duration)),
    [duration],
  );

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

  return (
    <div className="sheet-backdrop">
      <section aria-modal className="feedback-sheet" role="dialog">
        <header className="sheet-header">
          <div>
            <p>通话反馈</p>
            <h2>{customer.name}</h2>
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

        <div className="duration-panel">
          <span>通话时长</span>
          <strong>{formatDuration(visibleDuration)}</strong>
          <input
            min={0}
            onChange={(event) => setDuration(Number(event.target.value))}
            type="number"
            value={visibleDuration}
          />
        </div>

        <div className="result-grid">
          {resultOptions.map((option) => (
            <button
              className={
                callResult === option.value
                  ? 'result-tile active'
                  : 'result-tile'
              }
              key={option.value}
              onClick={() => setCallResult(option.value)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.hint}</span>
            </button>
          ))}
        </div>

        <label className="field">
          <span>备注</span>
          <textarea
            onChange={(event) => setCallRemark(event.target.value)}
            placeholder="记录客户意向、下次回访时间或其他关键信息"
            rows={4}
            value={callRemark}
          />
        </label>

        <button
          className="primary-button"
          disabled={submitting}
          onClick={() =>
            onSubmit({
              callResult,
              duration: visibleDuration,
              callRemark: callRemark.trim() || undefined,
            })
          }
          type="button"
        >
          {submitting ? '提交中...' : '提交通话结果'}
        </button>
      </section>
    </div>
  );
}
