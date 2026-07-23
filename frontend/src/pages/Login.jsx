import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Quality Engineer')
  const [error, setError] = useState('')
  const { loginUser } = useAuth()
  const navigate = useNavigate()

async function handleSubmit(e) {
  e.preventDefault()
  if (!name.trim() || !password.trim()) {
    setError('Enter your username and password to continue.')
    return
  }
  try {
    setError('')
    await loginUser({ username: name.trim(), password: password.trim() })
    navigate('/dashboard')
  } catch (err) {
    setError('Login failed — check your username and password.')
  }
}
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-1">VisionInspect AI</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Manufacturing Defect Detection & Quality Inspection</p>

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Operator Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Himabindhu Ravuri"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white mb-5 outline-none focus:border-blue-400"
          />
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
  Password
</label>
<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="••••••••"
  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white mb-5 outline-none focus:border-blue-400"
/>

          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
            Role
          </label>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['Quality Engineer', 'Factory Supervisor'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`text-sm py-2 rounded-md border transition ${
                  role === r
                    ? 'border-blue-400 bg-blue-400/10 text-blue-400'
                    : 'border-gray-600 text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2.5 rounded-md hover:bg-blue-600 transition"
          >
            Enter Inspection Console
          </button>
        </form>
        <p className="text-center text-gray-500 text-xs mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
          </p>
      </div>
    </div>
  )
}