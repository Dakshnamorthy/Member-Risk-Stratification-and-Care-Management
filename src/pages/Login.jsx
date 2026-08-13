import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { loginUser } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('dr.roberts@careguard.ai');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Connect to backend via authService
      const response = await loginUser(email, password);
      
      // Store returned user and token
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);

      // Navigate to dashboard on success
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <ShieldCheck size={48} className="login-logo-icon" />
          </div>
          <h1 className="login-title">CareGuard AI</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="dr.roberts@careguard.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div style={{ color: 'var(--color-urgent-text)', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}
          
          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /> : 'Sign In'}
          </button>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}
