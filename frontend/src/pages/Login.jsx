import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import loginBg from '../assets/login-background.png'
import { useAuth } from '../context/AuthContext.jsx'

function Bracket({ corner, start, fading }) {
  if (!start) return null

  const size = 36
  const edge = 24

  const target = {
    topLeft: {
      x: edge,
      y: edge,
    },
    topRight: {
      x: window.innerWidth - edge - size,
      y: edge,
    },
    bottomLeft: {
      x: edge,
      y: window.innerHeight - edge - size,
    },
    bottomRight: {
      x: window.innerWidth - edge - size,
      y: window.innerHeight - edge - size,
    },
  }[corner]

  const borderStyles = {
    topLeft: {
      borderTop: '3px solid #60a5fa',
      borderLeft: '3px solid #60a5fa',
      borderTopLeftRadius: '6px',
    },
    topRight: {
      borderTop: '3px solid #60a5fa',
      borderRight: '3px solid #60a5fa',
      borderTopRightRadius: '6px',
    },
    bottomLeft: {
      borderBottom: '3px solid #60a5fa',
      borderLeft: '3px solid #60a5fa',
      borderBottomLeftRadius: '6px',
    },
    bottomRight: {
      borderBottom: '3px solid #60a5fa',
      borderRight: '3px solid #60a5fa',
      borderBottomRightRadius: '6px',
    },
  }[corner]

  const style = {
    position: 'fixed',
    width: size,
    height: size,
    zIndex: 50,

    left: start.x,
    top: start.y,

    transform: fading
      ? `translate(${target.x - start.x}px, ${target.y - start.y}px)`
      : 'translate(0px, 0px)',

    transition: 'transform 0.9s cubic-bezier(0.4,0,0.2,1)',

    willChange: 'transform',

    ...borderStyles,
  }

  return <div style={style}></div>
}

export default function Login() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  // Temporary role selection for frontend testing.
  // Later the backend will provide the real role.
  const [role, setRole] = useState('quality_engineer')

  const [error, setError] = useState('')
  const [iconRect, setIconRect] = useState(null)

  const iconBoxRef = useRef(null)

  const { loginUser, logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (iconBoxRef.current) {
      const rect = iconBoxRef.current.getBoundingClientRect()
      setIconRect(rect)
    }
  }, [])

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFading(true)
    }, 1800)

    const hideTimer = setTimeout(() => {
      setShowSplash(false)
    }, 2700)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  async function handleSubmit(e) {
  e.preventDefault()

  if (!name.trim() || !password.trim()) {
    setError('Enter your username and password to continue.')
    return
  }

  try {
    setError('')

    const loggedInUser = await loginUser({
      username: name.trim(),
      password: password.trim(),
    })

    // Compare selected role with the actual role returned by backend
    if (loggedInUser.role !== role) {
      logoutUser()

      const roleNames = {
        quality_inspector: 'Quality Inspector',
        quality_engineer: 'Quality Engineer',
        admin: 'Admin',
      }

      setError(
        `Role mismatch. This account is registered as ${
          roleNames[loggedInUser.role] || loggedInUser.role
        }. Please select the correct role.`
      )

      return
    }

    navigate('/dashboard')
  } catch (err) {
    console.error(err)
    setError('Login failed — check your username and password.')
  }
}

  const size = 36

  const startPositions = iconRect
    ? {
        topLeft: {
          x: iconRect.left,
          y: iconRect.top,
        },
        topRight: {
          x: iconRect.right - size,
          y: iconRect.top,
        },
        bottomLeft: {
          x: iconRect.left,
          y: iconRect.bottom - size,
        },
        bottomRight: {
          x: iconRect.right - size,
          y: iconRect.bottom - size,
        },
      }
    : null

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(5,10,25,0.65), rgba(5,10,25,0.75)),
          url(${loginBg})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style>{`
        @keyframes scanMove {
          0%, 100% {
            top: 4%;
          }

          50% {
            top: 92%;
          }
        }

        .scan-beam {
          animation: scanMove 1.3s ease-in-out infinite;
        }
      `}</style>

      {startPositions && (
        <>
          <Bracket
            corner="topLeft"
            start={startPositions.topLeft}
            fading={splashFading}
          />

          <Bracket
            corner="topRight"
            start={startPositions.topRight}
            fading={splashFading}
          />

          <Bracket
            corner="bottomLeft"
            start={startPositions.bottomLeft}
            fading={splashFading}
          />

          <Bracket
            corner="bottomRight"
            start={startPositions.bottomRight}
            fading={splashFading}
          />
        </>
      )}

      {/* Title screen / form */}
      {!showForm ? (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
          <div className="text-center max-w-lg">
            <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mb-3">
              This is
            </p>

            <h1 className="text-5xl font-extrabold text-white mb-2">
              Vision<span className="text-blue-400">Inspect</span> AI
            </h1>

            <p className="text-gray-400 text-sm tracking-wide mb-1">
              Manufacturing Defect Detection & Quality Inspection
            </p>

            <p className="text-gray-500 text-sm italic mb-10">
              Your inspection console awaits, operator.
            </p>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-md transition"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                </svg>

                Sign In
              </button>

              <Link
                to="/register"
                className="flex items-center gap-2 bg-gray-800 border border-gray-600 hover:border-blue-400 text-white font-medium px-8 py-3 rounded-md transition"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>

                Register
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
          <div className="w-full max-w-md">
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 text-xs mb-4 hover:text-gray-300"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              VisionInspect AI
            </h1>

            <p className="text-gray-400 text-sm text-center mb-6">
              Manufacturing Defect Detection & Quality Inspection
            </p>

            <form
              onSubmit={handleSubmit}
              className="bg-black/35 backdrop-blur-md border border-blue-400/20 rounded-2xl p-8 shadow-2xl"
            >
              {/* Username */}
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Operator Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Himabindhu Ravuri"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 outline-none transition"
              />

              {/* Password */}
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 mt-5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 outline-none transition"
              />

              {/* Role */}
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 mt-5">
                Select Role
              </label>

              <div className="grid grid-cols-1 gap-2 mb-6">
                {[
                  {
                    value: 'quality_inspector',
                    label: 'Quality Inspector',
                  },
                  {
                    value: 'quality_engineer',
                    label: 'Quality Engineer',
                  },
                  {
                    value: 'admin',
                    label: 'Admin',
                  },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`text-sm py-3 rounded-lg border transition-all duration-300 ${
                      role === r.value
                        ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-blue-400/50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-xs mb-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30 text-white font-medium py-3 rounded-lg transition-all duration-300"
              >
                Enter Inspection Console
              </button>

              <p className="text-center text-gray-500 text-xs mt-4">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-400 hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Splash overlay */}
      {showSplash && (
        <div
          className="absolute inset-0 bg-gray-900 flex items-center justify-center transition-opacity duration-700"
          style={{
            opacity: splashFading ? 0 : 1,
            backgroundImage: `
              linear-gradient(rgba(5,10,25,0.65), rgba(5,10,25,0.75)),
              url(${loginBg})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="text-center relative">
            <div
              ref={iconBoxRef}
              className="relative w-36 h-36 mx-auto mb-8"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-blue-400/70"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line
                    x1="12"
                    y1="22.08"
                    x2="12"
                    y2="12"
                  />
                </svg>
              </div>

              <div className="scan-beam absolute inset-x-3 h-0.5 bg-blue-400 shadow-[0_0_10px_3px_rgba(96,165,250,0.8)]"></div>
            </div>

            <p className="text-white text-xl font-semibold mb-2">
              Welcome to VisionInspect AI
            </p>

            <p className="text-blue-400 text-xs tracking-[0.2em] uppercase">
              Initializing Inspection Console…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}