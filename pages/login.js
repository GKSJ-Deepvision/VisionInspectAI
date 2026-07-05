import { useState } from 'react';
import { useRouter } from 'next/router';
import CornerMarks from '../components/CornerMarks';

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState('quality_engineer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setError('Enter your ID and password to continue.');
      return;
    }
    // TODO: replace with real POST /auth/login once backend endpoint is ready.
    // For now this simulates a JWT so the rest of the frontend can be built and demoed.
    const mockToken = btoa(JSON.stringify({ username, role, iat: Date.now() }));
    localStorage.setItem('vi_token', mockToken);
    localStorage.setItem('vi_role', role);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-graphite bg-blueprint bg-grid flex items-center justify-center font-body px-4">
      <div className="relative w-full max-w-md bg-panel border border-gridline p-8">
        <CornerMarks />

        <div className="mb-8">
          <span className="text-xs tracking-[0.2em] text-muted font-mono uppercase">
            VisionInspect AI
          </span>
          <h1 className="font-display text-2xl text-ink mt-1">
            Inspection Console Sign-In
          </h1>
          <p className="text-sm text-muted mt-2">
            Restricted access — quality engineers and factory supervisors only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('quality_engineer')}
                className={`py-2 text-sm border transition-colors ${
                  role === 'quality_engineer'
                    ? 'border-signal text-ink bg-signal/10'
                    : 'border-gridline text-muted hover:border-muted'
                }`}
              >
                Quality Engineer
              </button>
              <button
                type="button"
                onClick={() => setRole('factory_supervisor')}
                className={`py-2 text-sm border transition-colors ${
                  role === 'factory_supervisor'
                    ? 'border-signal text-ink bg-signal/10'
                    : 'border-gridline text-muted hover:border-muted'
                }`}
              >
                Factory Supervisor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">
              Employee ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. QE-1042"
              className="w-full bg-graphite border border-gridline px-3 py-2 text-ink text-sm focus:outline-none focus:border-signal"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-graphite border border-gridline px-3 py-2 text-ink text-sm focus:outline-none focus:border-signal"
            />
          </div>

          {error && (
            <p className="text-sm text-signal font-mono">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-signal text-graphite font-display font-semibold py-2.5 hover:bg-signal/90 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-muted mt-6 font-mono">
          v0.1 — frontend milestone build, auth wired to backend pending.
        </p>
      </div>
    </div>
  );
}
