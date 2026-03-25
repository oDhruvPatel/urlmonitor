import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Monitor {
  _id: string;
  url: string;
  name: string;
  status: 'active' | 'paused';
  isActive: boolean;
  intervalMinutes: number;
  lastChecked: string | null;
  createdAt: string;
}

interface DashboardProps {
  user: { id: string; email: string; displayName: string; avatar: string } | null;
}

function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchMonitors();
  }, [user, navigate]);

  const fetchMonitors = async () => {
    try {
      const res = await fetch('/api/monitors', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMonitors(data);
      }
    } catch {
      console.error('Failed to fetch monitors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/submitURL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: newUrl.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewUrl('');
        fetchMonitors();
      } else {
        setError(data.error || 'Failed to add URL');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIntervalLabel = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    return `${mins / 60}h`;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your monitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {monitors.length} {monitors.length === 1 ? 'monitor' : 'monitors'} active
          </p>
        </div>
      </div>

      {/* Add URL Form */}
      <form className="add-url-form" onSubmit={handleAddUrl}>
        <div className="add-url-input-wrap">
          <svg className="add-url-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <input
            type="url"
            placeholder="https://example.com"
            className="add-url-input"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            disabled={submitting}
          />
        </div>
        <button type="submit" className="btn-add-url" disabled={submitting}>
          {submitting ? 'Adding...' : '+ Add URL'}
        </button>
      </form>

      {error && <div className="dashboard-error">{error}</div>}

      {/* Monitors List */}
      {monitors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2>No monitors yet</h2>
          <p>Add your first URL above to start monitoring</p>
        </div>
      ) : (
        <div className="monitors-grid">
          {monitors.map((monitor) => (
            <div key={monitor._id} className="monitor-card">
              <div className="monitor-card-top">
                <div className="monitor-card-info">
                  <h3 className="monitor-card-name" title={monitor.name}>
                    {monitor.name}
                  </h3>
                  <a
                    href={monitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="monitor-card-url"
                    title={monitor.url}
                  >
                    {monitor.url}
                  </a>
                </div>
                <span className={`status-badge status-${monitor.status}`}>
                  {monitor.status}
                </span>
              </div>

              <div className="monitor-card-details">
                <div className="monitor-detail">
                  <span className="monitor-detail-label">Interval</span>
                  <span className="monitor-detail-value">
                    Every {getIntervalLabel(monitor.intervalMinutes)}
                  </span>
                </div>
                <div className="monitor-detail">
                  <span className="monitor-detail-label">Last Checked</span>
                  <span className="monitor-detail-value">
                    {formatDate(monitor.lastChecked)}
                  </span>
                </div>
                <div className="monitor-detail">
                  <span className="monitor-detail-label">Created</span>
                  <span className="monitor-detail-value">
                    {formatDate(monitor.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
