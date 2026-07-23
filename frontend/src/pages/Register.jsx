import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerRequest } from '../services/api.js'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    try {
      setError('')
      await registerRequest(username.trim(), password.trim(), email.trim())
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError('Registration failed — username may already be taken.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-1">Create Account</h1>
        <p className="text-gray-400 text-sm text-center mb-6">VisionInspect AI</p>

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. himabindhu"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white mb-4 outline-none focus:border-blue-400"
          />

          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. hima@example.com"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white mb-4 outline-none focus:border-blue-400"
          />

          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white mb-5 outline-none focus:border-blue-400"
          />

          {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
          {success && <p className="text-green-400 text-xs mb-4">Account created! Redirecting to login…</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2.5 rounded-md hover:bg-blue-600 transition"
          >
            Create Account
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}