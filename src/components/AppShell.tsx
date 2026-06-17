import {
  BarChart3,
  Clock3,
  Menu,
  PhoneCall,
  Search,
  UserRound,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PendingReportRemarkModal } from '@/components/PendingReportRemarkModal';
import { useOnlineSync } from '@/hooks/useOnlineSync';
import {
  getPendingReports,
  getReportsMissingRemarks,
  updatePendingReportRemarks,
} from '@/offline/callQueue';
import type { PendingCallReport } from '@/types';

const navItems = [
  { to: '/', label: '待拨', icon: PhoneCall },
  { to: '/summary', label: '战报', icon: BarChart3 },
  { to: '/history', label: '历史', icon: Clock3 },
  { to: '/profile', label: '我的', icon: UserRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  const sync = useOnlineSync();
  const [reportsNeedingRemarks, setReportsNeedingRemarks] = useState<
    PendingCallReport[]
  >([]);
  const pendingCount = getPendingReports().length;

  function handleSyncPendingReports() {
    const missingRemarks = getReportsMissingRemarks();

    if (missingRemarks.length > 0) {
      setReportsNeedingRemarks(missingRemarks);
      return;
    }

    sync.mutate();
  }

  function handleSavePendingRemarks(remarks: Record<string, string>) {
    updatePendingReportRemarks(remarks);
    setReportsNeedingRemarks([]);
    sync.mutate();
  }

  return (
    <div className="app-shell">
      <header className="brand-topbar">
        <button aria-label="菜单" className="topbar-button" type="button">
          <Menu aria-hidden size={28} />
        </button>
        <div className="wordmark">
          <span>Telemark</span>
          <i />
          <i />
          <i />
          <i />
        </div>
        <button aria-label="搜索" className="topbar-button" type="button">
          <Search aria-hidden size={30} />
        </button>
      </header>

      <main className="app-content">
        {pendingCount > 0 ? (
          <button
            className="sync-banner"
            disabled={sync.isPending}
            onClick={handleSyncPendingReports}
            type="button"
          >
            {sync.isPending
              ? '正在补传通话记录...'
              : `${pendingCount} 条通话记录待补传`}
          </button>
        ) : null}
        {children}
      </main>

      {reportsNeedingRemarks.length > 0 ? (
        <PendingReportRemarkModal
          onClose={() => setReportsNeedingRemarks([])}
          onSave={handleSavePendingRemarks}
          reports={reportsNeedingRemarks}
        />
      ) : null}

      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className="nav-item"
              end={item.to === '/'}
              key={item.to}
              to={item.to}
            >
              <Icon aria-hidden size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
