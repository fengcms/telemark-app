import {
  ArrowRight,
  Eye,
  LockKeyhole,
  PhoneCall,
  UserRound,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/format';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  const [username, setUsername] = useState('sales05');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(username.trim(), password);
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
            <span>用户名 / 手机号</span>
            <div className="input-shell">
              <UserRound aria-hidden size={22} />
              <input
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="请输入您的账号"
                value={username}
              />
            </div>
          </label>

          <label className="field">
            <span className="field-row">
              登录密码 <a href="#forgot">忘记密码？</a>
            </span>
            <div className="input-shell">
              <LockKeyhole aria-hidden size={22} />
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                type="password"
                value={password}
              />
              <Eye aria-hidden size={22} />
            </div>
          </label>

          <label className="remember-row">
            <input type="checkbox" />
            <span>自动登录</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? '登录中...' : '进入工作台'}
            <ArrowRight aria-hidden size={28} />
          </button>
        </form>
      </section>
      <footer className="login-footer">© 2024 Telemark 外呼助手</footer>
    </main>
  );
}
