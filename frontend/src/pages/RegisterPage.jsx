import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { FaReact } from 'react-icons/fa'

export default function RegisterPage() {
  const { register } = useAuthStore()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await register(form)
    } } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.')
      } else {
        const d = err.response?.data
        const msg = d?.username?.[0] || d?.email?.[0] || d?.password?.[0] || d?.detail || 'Registration failed'
        setError(msg)
      }
    } finally {
    setLoading(false)
  }

  const inputCls = `border border-[var(--border-strong)] rounded-xl px-3.5 py-3
    text-sm text-[var(--text-1)] bg-[var(--bg)] w-full outline-none
    transition-[border-color,box-shadow] duration-200
    focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-light)]`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-2)] px-4 py-8">
      <div className="w-full max-w-md bg-[var(--bg)] border border-[var(--border)]
        rounded-2xl px-6 md:px-8 py-8 md:py-10 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">

        {/* Logo */}
        <div className="flex items-center gap-3 text-[1.5rem] md:text-[1.6rem]
          font-extrabold tracking-tight mb-6 text-[var(--accent)]">
          <img src="/chatox.png" alt="Chatox" className="w-10 h-10" />
          <span>Chatox</span>
        </div>

        <h1 className="text-2xl md:text-[1.85rem] font-extrabold mb-6
          text-[var(--text-1)] tracking-tight">
          Create your account
        </h1>

        {error && (
          <div className="bg-[var(--red-light)] text-[var(--red)] border border-[var(--red)]/20
            rounded-xl px-4 py-2.5 text-sm font-medium mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { key: 'username', label: 'Username', type: 'text', auto: 'username' },
            { key: 'email', label: 'Email', type: 'email', auto: 'email' },
            { key: 'password', label: 'Password', type: 'password', auto: 'new-password' },
            { key: 'password2', label: 'Confirm password', type: 'password', auto: 'new-password' },
          ].map(({ key, label, type, auto }) => (
            <div className="flex flex-col gap-1.5" key={key}>
              <label className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">
                {label}
              </label>
              <input
                className={inputCls} type={type}
                value={form[key]} onChange={set(key)} autoComplete={auto}
              />
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2
              bg-[var(--accent)] hover:bg-[var(--accent-hover)]
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white border-none rounded-full py-3 text-sm font-bold mt-2
              transition-[background-color,opacity] duration-200 cursor-pointer"
          >
            {loading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {loading ? 'Creating…' : 'Join Chatox'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--text-2)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}