import { ChevronRight, Info, LockKeyhole, LogOut, Save, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingReports } from '@/offline/callQueue';
import { getErrorMessage } from '@/utils/format';

export function ProfilePage() {
  const { session, signOut, updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const pendingCount = getPendingReports().length;

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
          <em>v2.4.0</em>
          <ChevronRight aria-hidden size={24} />
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
    </div>
  );
}
