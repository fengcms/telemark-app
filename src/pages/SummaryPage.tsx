import { useQuery } from '@tanstack/react-query';
import { Clock, PhoneCall, Signal, TimerReset } from 'lucide-react';
import { getMySummary } from '@/api/endpoints';
import { EmptyState } from '@/components/EmptyState';
import {
  formatDateTime,
  formatDuration,
  getErrorMessage,
} from '@/utils/format';

export function SummaryPage() {
  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: getMySummary,
  });

  const summary = summaryQuery.data;

  return (
    <div className="page-stack">
      <section className="hero-card">
        <header className="page-header">
          <div>
            <p>今日战报</p>
            <h1>销售节奏</h1>
            <span className="header-subtitle">聚焦接通率和有效通话时长</span>
          </div>
        </header>
      </section>

      {summaryQuery.isLoading ? <EmptyState title="正在加载战报..." /> : null}
      {summaryQuery.isError ? (
        <EmptyState title={getErrorMessage(summaryQuery.error)} />
      ) : null}

      {summary ? (
        <>
          <section className="metric-grid">
            <article className="metric-card">
              <PhoneCall aria-hidden size={22} />
              <strong>{summary.totalCalls}</strong>
              <span>总拨打</span>
            </article>
            <article className="metric-card">
              <Signal aria-hidden size={22} />
              <strong>{summary.connectedCalls}</strong>
              <span>接通数</span>
            </article>
            <article className="metric-card wide">
              <TimerReset aria-hidden size={22} />
              <strong>{formatDuration(summary.totalDuration)}</strong>
              <span>总通话时长</span>
            </article>
          </section>

          <section className="timeline-card">
            <div>
              <Clock aria-hidden size={18} />
              <span>首次拨打</span>
              <strong>{formatDateTime(summary.firstCallTime)}</strong>
            </div>
            <div>
              <Clock aria-hidden size={18} />
              <span>最后拨打</span>
              <strong>{formatDateTime(summary.lastCallTime)}</strong>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
