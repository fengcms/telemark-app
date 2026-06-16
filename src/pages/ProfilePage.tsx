import { LogOut, Save } from 'lucide-react';
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
      <header className="page-header">
        <div>
          <p>个人中心</p>
          <h1>{session?.user.realName ?? session?.user.username}</h1>
        </div>
      </header>

      <section className="profile-card">
        <div>
          <span>账号</span>
          <strong>{session?.user.username}</strong>
        </div>
        <div>
          <span>角色</span>
          <strong>{session?.user.role === 2 ? '经理' : '普通员工'}</strong>
        </div>
        <div>
          <span>待补传</span>
          <strong>{pendingCount} 条</strong>
        </div>
      </section>

      <form className="settings-card" onSubmit={handlePassword}>
        <h2>修改密码</h2>
        <label className="field">
          <span>旧密码</span>
          <input
            autoComplete="current-password"
            onChange={(event) => setOldPassword(event.target.value)}
            type="password"
            value={oldPassword}
          />
        </label>
        <label className="field">
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
