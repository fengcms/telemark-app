import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  PhoneCall,
  UserRound,
  X,
} from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  clearSavedLoginCredentials,
  getSavedLoginCredentials,
  saveLoginCredentials,
} from '@/store/savedLogin';
import { getErrorMessage } from '@/utils/format';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    let mounted = true;
    void getSavedLoginCredentials().then((savedLogin) => {
      if (!mounted || !savedLogin) {
        return;
      }

      setUsername(savedLogin.username);
      setPassword(savedLogin.password);
      setSavePassword(true);
    });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const nextUsername = username.trim();
      await signIn(nextUsername, password);

      if (savePassword) {
        await saveLoginCredentials({
          username: nextUsername,
          password,
        });
      } else {
        clearSavedLoginCredentials();
      }

      navigate('/', { replace: true });
    } catch (signInError) {
      setError(getErrorMessage(signInError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">
          <PhoneCall aria-hidden size={52} />
        </div>
        <h1>Telemark</h1>
        <p>专注拨打，高效跟进</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>用户名</span>
            <div className="input-shell">
              <UserRound aria-hidden size={22} />
              <input
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="请输入用户名"
                value={username}
              />
            </div>
          </label>

          <label className="field">
            <span className="field-row">
              登录密码
              <button
                className="link-button"
                onClick={() => setForgotModalOpen(true)}
                type="button"
              >
                忘记密码？
              </button>
            </span>
            <div className="input-shell">
              <LockKeyhole aria-hidden size={22} />
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                type={passwordVisible ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={passwordVisible ? '隐藏密码' : '显示密码'}
                className="input-icon-button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? (
                  <EyeOff aria-hidden size={22} />
                ) : (
                  <Eye aria-hidden size={22} />
                )}
              </button>
            </div>
          </label>

          <label className="remember-row">
            <input
              checked={savePassword}
              onChange={(event) => setSavePassword(event.target.checked)}
              type="checkbox"
            />
            <span>保存密码</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? '登录中...' : '进入工作台'}
            <ArrowRight aria-hidden size={28} />
          </button>
        </form>
      </section>
      <footer className="login-footer">© 2024 Telemark 外呼助手</footer>

      {forgotModalOpen ? (
        <div className="modal-backdrop">
          <section className="app-modal">
            <header className="modal-header">
              <div>
                <p>账户协助</p>
                <h2>忘记密码</h2>
              </div>
              <button
                aria-label="关闭"
                className="icon-button"
                onClick={() => setForgotModalOpen(false)}
                type="button"
              >
                <X aria-hidden size={22} />
              </button>
            </header>
            <div className="version-copy">
              <strong>
                <Info aria-hidden size={18} />
                请联系系统维护人员
              </strong>
              <p>
                为保障账号安全，APP
                暂不支持自行找回密码。请联系系统维护人员或管理员协助重置登录密码。
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setForgotModalOpen(false)}
              type="button"
            >
              我知道了
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
