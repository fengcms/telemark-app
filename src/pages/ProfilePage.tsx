import { ChevronRight, Info, LockKeyhole, LogOut, Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingReports } from '@/offline/callQueue';
import { getErrorMessage } from '@/utils/format';

export function ProfilePage() {
  const { session, signOut, updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const pendingCount = getPendingReports().length;

  async function handlePassword(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await updatePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setMessage('密码已更新');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
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
            <strong>1,284</strong>
            <span>本月呼叫</span>
          </div>
          <div>
            <strong>{pendingCount ? `${pendingCount} 条` : '85%'}</strong>
            <span>{pendingCount ? '待补传' : '接通率'}</span>
          </div>
        </footer>
      </section>

      <form className="settings-card" onSubmit={handlePassword}>
        <div className="setting-row">
          <span className="setting-icon">
            <LockKeyhole aria-hidden size={24} />
          </span>
          <strong>修改密码</strong>
          <ChevronRight aria-hidden size={24} />
        </div>
        <label className="field compact-field">
          <span>旧密码</span>
          <input
            autoComplete="current-password"
            onChange={(event) => setOldPassword(event.target.value)}
            type="password"
            value={oldPassword}
          />
        </label>
        <label className="field compact-field">
          <span>新密码</span>
          <input
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            value={newPassword}
          />
        </label>
        {message ? <p className="notice">{message}</p> : null}
        <button className="secondary-button" disabled={loading} type="submit">
          <Save aria-hidden size={18} />
          {loading ? '保存中...' : '保存新密码'}
        </button>
        <div className="setting-row version-row">
          <span className="setting-icon">
            <Info aria-hidden size={24} />
          </span>
          <strong>关于版本</strong>
          <em>v2.4.0</em>
          <ChevronRight aria-hidden size={24} />
        </div>
      </form>

      <button
        className="danger-button"
        onClick={() => void signOut()}
        type="button"
      >
        <LogOut aria-hidden size={18} />
        退出登录
      </button>
    </div>
  );
}
