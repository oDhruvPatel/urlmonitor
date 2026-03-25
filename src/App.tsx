import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

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
    <div className={`page ${isDashboard ? 'page-dashboard' : ''}`}>
      {/* Decorative circles (hidden on dashboard) */}
      {!isDashboard && (
        <>
          <div className="deco-circle deco-circle-1" />
          <div className="deco-circle deco-circle-2" />
        </>
      )}

      {/* ── Navbar ── */}
      <nav className={`navbar ${isDashboard ? 'navbar-dashboard' : ''}`}>
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          URLMonitor
        </Link>

        {!isDashboard && (
          <ul className="navbar-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#docs">Docs</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        )}

        <div className="navbar-actions">
          {loading ? null : user ? (
            <div className="user-info">
              {!isDashboard && (
                <Link to="/dashboard" className="btn-dashboard">
                  Dashboard
                </Link>
              )}
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

      {/* ── Routes ── */}
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </div>
  );
}

export default App;