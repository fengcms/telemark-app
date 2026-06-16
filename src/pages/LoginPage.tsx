import { LogIn } from 'lucide-react';
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
          <LogIn aria-hidden size={28} />
        </div>
        <span className="login-eyebrow">Sales Calling Workspace</span>
        <h1>Telemark 外呼助手</h1>
        <p>看客户，打电话，回填结果。</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>账号</span>
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入账号"
              value={username}
            />
          </label>

          <label className="field">
            <span>密码</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </section>
    </main>
  );
}
