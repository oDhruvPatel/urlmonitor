import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/auth/user', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  return (
    <div className="page">
      {/* Decorative circles */}
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <span className="navbar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          URLMonitor
        </a>

        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#docs">Docs</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="navbar-actions">
          {loading ? null : user ? (
            <div className="user-info">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="user-avatar"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="user-name">{user.displayName}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={handleLogin}>Log in</button>
              <button className="btn-signup" onClick={handleLogin}>Sign up</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">

        <h1 className="hero-heading">
          Monitor Your URLs<br />with Confidence
        </h1>

        <p className="hero-subtext">
          Get instant alerts when your websites go down. Track uptime,
          response time, and SSL certificates — all from one dashboard.
        </p>

        <div className="monitor-input-container">
          <input 
            type="url" 
            placeholder="https://example.com" 
            className="monitor-input"
          />
          <button className="btn-monitor">Monitor</button>
        </div>

        {/* Handwritten annotations */}
        <span className="annotation annotation-right">
          Stay ahead<span className="arrow">↗</span>
        </span>
        <span className="annotation annotation-left">
          <span className="arrow">↙</span>Real-time alerts
        </span>
        <span className="annotation annotation-bottom">
          It's free <span className="arrow">↗</span>
        </span>
      </section>
    </div>
  );
}

export default App;