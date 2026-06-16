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
      <section className="report-hero">
        <header className="page-header">
          <div>
            <p>今日完成情况</p>
            <h1>业绩稳步攀升</h1>
            <strong>84%</strong>
            <span>目标进度</span>
          </div>
        </header>
      </section>

      {summaryQuery.isLoading ? <EmptyState title="正在加载战报..." /> : null}
      {summaryQuery.isError ? (
        <EmptyState title={getErrorMessage(summaryQuery.error)} />
      ) : null}

      {summary ? (
        <>
          <h2 className="section-title">核心指标</h2>
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

          <h2 className="section-title">今日轨迹</h2>
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
