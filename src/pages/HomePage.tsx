import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  user: { id: string; email: string; displayName: string; avatar: string } | null;
}

function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();

  const handleMonitor = async () => {
    const input = document.querySelector('.monitor-input') as HTMLInputElement;
    const urlValue = input?.value.trim();

    if (!urlValue) return;

    if (!user) {
      window.location.href = '/auth/google';
      return;
    }

    try {
      const res = await fetch('/api/submitURL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: urlValue }),
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add URL');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleMonitor();
  };

  return (
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
          onKeyDown={handleKeyDown}
        />
        <button className="btn-monitor" onClick={handleMonitor}>Monitor</button>
      </div>

      <h3 className="hero-subtext" style={{ color: 'red', marginTop: '20px' }}>This site is under development !!!</h3>

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
  );
}

export default HomePage;
