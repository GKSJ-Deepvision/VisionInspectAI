import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CornerMarks from '../components/CornerMarks';
import { loginUser } from "../lib/api";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState('quality_engineer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
  e.preventDefault();

  setError("");

  if (!email || !password) {
    setError("Enter your email and password to continue.");
    return;
  }

  try {
    const data = await loginUser(
      email,
      password,
      role
    );

    localStorage.setItem(
      "vi_token",
      data.access_token
    );

    localStorage.setItem(
      "vi_role",
      data.role
    );

    localStorage.setItem(
      "vi_username",
      data.email
    );

    router.push("/dashboard");
  } catch (err) {
    setError(
      err.message || "Unable to sign in."
    );
  }
}

  return (
    <div className="min-h-screen bg-graphite bg-blueprint bg-grid flex items-center justify-center font-body px-4">
      <div className="relative w-full max-w-md bg-panel border border-gridline p-8">
        <CornerMarks />
        <Link
          href="/"
          className="absolute -top-8 left-0 text-xs font-mono text-muted hover:text-ink transition-colors"
        >
          ← Back to overview
        </Link>

        <div className="mb-8">
          <span className="text-xs tracking-[0.2em] text-muted font-mono uppercase">
            VisionInspect AI
          </span>
          <h1 className="font-display text-2xl text-ink mt-1">
            Inspection Console Sign-In
          </h1>
          <p className="text-sm text-muted mt-2">
            {role === "factory_supervisor"
              ? "Restricted administrator access — authorized factory supervisors only."
              : "Secure access for quality engineers."
            }
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@company.com"
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

          {error && <p className="text-sm text-signal font-mono">{error}</p>}

          <button
            type="submit"
            className="w-full bg-signal text-graphite font-display font-semibold py-2.5 hover:bg-signal/90 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-muted mt-6 font-mono">
          Authorized personnel only · VisionInspect AI
        </p>
      </div>
    </div>
  );
}
