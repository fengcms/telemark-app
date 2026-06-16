import { BarChart3, Clock3, PhoneCall, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useOnlineSync } from '@/hooks/useOnlineSync';
import { getPendingReports } from '@/offline/callQueue';

const navItems = [
  { to: '/', label: '待拨', icon: PhoneCall },
  { to: '/summary', label: '战报', icon: BarChart3 },
  { to: '/history', label: '历史', icon: Clock3 },
  { to: '/profile', label: '我的', icon: UserRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  const sync = useOnlineSync();
  const pendingCount = getPendingReports().length;

  return (
    <div className="app-shell">
      <main className="app-content">
        {pendingCount > 0 ? (
          <button
            className="sync-banner"
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
            type="button"
          >
            {sync.isPending
              ? '正在补传通话记录...'
              : `${pendingCount} 条通话记录待补传`}
          </button>
        ) : null}
        {children}
      </main>

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
