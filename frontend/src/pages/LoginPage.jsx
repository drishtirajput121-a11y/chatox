import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { FaReact } from 'react-icons/fa'

export default function LoginPage() {
  const { login } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      // send as regular JSON — no FormData needed for text fields
      const { data } = await usersAPI.updateMe({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        bio: form.bio,
      })
      updateUser(data)  // merge into store
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm
    text-gray-900 dark:text-white bg-white dark:bg-gray-900 w-full outline-none transition-all
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gray-50 dark:bg-gray-950 px-4 py-8">

      <div className="w-full max-w-md bg-white dark:bg-black
        border border-gray-200 dark:border-gray-800
        rounded-2xl px-6 md:px-8 py-8 md:py-10
        shadow-[0_8px_24px_rgba(0,0,0,0.08)]">

        {/* Logo */}
        <div className="flex items-center gap-3 text-blue-500 text-2xl font-extrabold tracking-tight mb-6">
          <img src="/chatox.png" alt="Chatox" className="w-10 h-10" />
          <span>Chatox</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight
          text-gray-900 dark:text-white mb-6">
          Sign in to Chatox
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500
            border border-red-200 dark:border-red-800
            rounded-xl px-4 py-3 text-sm font-medium mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
            <input
              type="text" value={form.username} onChange={set('username')}
              autoComplete="username" autoFocus className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
            <input
              type="password" value={form.password} onChange={set('password')}
              autoComplete="current-password" className={inputCls}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2
              bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-full
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to Chatox?{' '}
          <Link to="/register" className="text-blue-500 font-bold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}