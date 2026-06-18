import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Info,
  LockKeyhole,
  LogOut,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { getAgentMonthlyDashboard } from '@/api/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { getPendingReports } from '@/offline/callQueue';
import { clearLocalAppCache } from '@/store/cache';
import { getErrorMessage } from '@/utils/format';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { session, signOut, updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [clearCacheModalOpen, setClearCacheModalOpen] = useState(false);
  const pendingCount = getPendingReports().length;

  const monthlyQuery = useQuery({
    queryKey: ['dashboard', 'agent-monthly'],
    queryFn: getAgentMonthlyDashboard,
  });

  const monthly =
    monthlyQuery.data?.list.find((item) => item.userId === session?.user.id) ??
    monthlyQuery.data?.list[0];
  const connectRate = monthly
    ? `${Math.round(monthly.connectRate * 1000) / 10}%`
    : '0%';

  async function handlePassword(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('请完整填写密码信息');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalOpen(false);
      setMessage('密码已更新');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleClearCache() {
    setClearingCache(true);

    try {
      await signOut();
    } finally {
      clearLocalAppCache();
      queryClient.clear();
      setClearingCache(false);
      setClearCacheModalOpen(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="profile-hero">
        <div className="avatar-ring">
          <span>
            {(session?.user.realName ?? session?.user.username ?? '销').slice(
              0,
              1,
            )}
          </span>
        </div>
        <div>
          <h1>{session?.user.realName ?? session?.user.username}</h1>
          <span>账号：</span>
          <strong>{session?.user.username}</strong>
        </div>
        <em>{session?.user.role === 2 ? 'MANAGER' : 'SALES'}</em>
        <footer>
          <div>
            <strong>{monthly?.totalCalls ?? 0}</strong>
            <span>本月呼叫</span>
          </div>
          <div>
            <strong>{connectRate}</strong>
            <span>接通率</span>
          </div>
        </footer>
      </section>

      <form className="settings-card" onSubmit={handlePassword}>
        <button
          className="setting-row"
          onClick={() => {
            setMessage('');
            setPasswordModalOpen(true);
          }}
          type="button"
        >
          <span className="setting-icon">
            <LockKeyhole aria-hidden size={24} />
          </span>
          <strong>修改密码</strong>
          <ChevronRight aria-hidden size={24} />
        </button>
        {message ? <p className="notice">{message}</p> : null}
        <button
          className="setting-row version-row"
          onClick={() => setVersionModalOpen(true)}
          type="button"
        >
          <span className="setting-icon">
            <Info aria-hidden size={24} />
          </span>
          <strong>关于版本</strong>
          <ChevronRight aria-hidden size={24} />
        </button>
        <button
          className="setting-row version-row"
          onClick={() => setClearCacheModalOpen(true)}
          type="button"
        >
          <span className="setting-icon danger-setting-icon">
            <Trash2 aria-hidden size={24} />
          </span>
          <strong>清除缓存</strong>
          <ChevronRight aria-hidden size={24} />
        </button>
      </form>

      {pendingCount > 0 ? (
        <p className="notice">{pendingCount} 条通话记录待补传</p>
      ) : null}

      <button
        className="danger-button"
        onClick={() => void signOut()}
        type="button"
      >
        <LogOut aria-hidden size={18} />
        退出登录
      </button>

      {passwordModalOpen ? (
        <div className="modal-backdrop">
          <form className="app-modal" onSubmit={handlePassword}>
            <header className="modal-header">
              <div>
                <p>账户安全</p>
                <h2>修改密码</h2>
              </div>
              <button
                aria-label="关闭"
                className="icon-button"
                onClick={() => setPasswordModalOpen(false)}
                type="button"
              >
                <X aria-hidden size={22} />
              </button>
            </header>

            <label className="field">
              <span>旧密码</span>
              <input
                autoComplete="current-password"
                onChange={(event) => setOldPassword(event.target.value)}
                placeholder="请输入旧密码"
                type="password"
                value={oldPassword}
              />
            </label>
            <label className="field">
              <span>新密码</span>
              <input
                autoComplete="new-password"
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="请输入新密码"
                type="password"
                value={newPassword}
              />
            </label>
            <label className="field">
              <span>确认新密码</span>
              <input
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="请再次输入新密码"
                type="password"
                value={confirmPassword}
              />
            </label>

            {message ? <p className="form-error">{message}</p> : null}

            <button className="primary-button" disabled={loading} type="submit">
              <Save aria-hidden size={20} />
              {loading ? '保存中...' : '保存新密码'}
            </button>
          </form>
        </div>
      ) : null}

      {versionModalOpen ? (
        <div className="modal-backdrop">
          <section className="app-modal">
            <header className="modal-header">
              <div>
                <p>Telemark Pro</p>
                <h2>关于版本</h2>
              </div>
              <button
                aria-label="关闭"
                className="icon-button"
                onClick={() => setVersionModalOpen(false)}
                type="button"
              >
                <X aria-hidden size={22} />
              </button>
            </header>
            <div className="version-copy">
              <strong>v2.4.0</strong>
              <p>
                Telemark
                外呼助手是面向销售团队的内部工作台，帮助团队完成客户拨打、通话反馈与销售跟进闭环。
              </p>
              <p>当前版本优化了移动端外呼体验、离线补传能力和通话反馈流程。</p>
            </div>
            <button
              className="primary-button"
              onClick={() => setVersionModalOpen(false)}
              type="button"
            >
              我知道了
            </button>
          </section>
        </div>
      ) : null}

      {clearCacheModalOpen ? (
        <div className="modal-backdrop">
          <section className="app-modal">
            <header className="modal-header">
              <div>
                <p>本地数据</p>
                <h2>清除本地缓存？</h2>
              </div>
              <button
                aria-label="关闭"
                className="icon-button"
                onClick={() => setClearCacheModalOpen(false)}
                type="button"
              >
                <X aria-hidden size={22} />
              </button>
            </header>
            <div className="version-copy">
              <p>
                此操作会清除本机保存的登录信息、离线补传队列、接口缓存和当前会话，并退出账号回到登录页。
              </p>
              <p>已提交到服务器的数据不会受到影响。</p>
            </div>
            <button
              className="danger-button"
              disabled={clearingCache}
              onClick={() => void handleClearCache()}
              type="button"
            >
              <Trash2 aria-hidden size={18} />
              {clearingCache ? '正在清除...' : '清除并退出'}
            </button>
            <button
              className="ghost-text-button"
              onClick={() => setClearCacheModalOpen(false)}
              type="button"
            >
              取消
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
