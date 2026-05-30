import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendOTP } from '../api/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendOTP(form.username, form.email, form.password, form.password2)
      // pass email to OTP page
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3
        text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900
        w-full outline-none transition-all
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`

  return (
    <div className="min-h-screen flex items-center justify-center
            bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-black
                border border-gray-200 dark:border-gray-800
                rounded-2xl px-8 py-10
                shadow-[0_8px_24px_rgba(0,0,0,0.08)]">

        <div className="flex items-center gap-3 text-blue-500
                    text-2xl font-extrabold tracking-tight mb-6">
          <img src="/chatox.png" alt="Chatox" className="w-10 h-10" />
          <span>Chatox</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight
                    text-gray-900 dark:text-white mb-2">
          Create account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We'll send a verification code to your email
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500
                        border border-red-200 dark:border-red-800
                        rounded-xl px-4 py-3 text-sm font-medium mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { key: 'username', label: 'Username', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'password', label: 'Password', type: 'password' },
            { key: 'password2', label: 'Confirm Password', type: 'password' },
          ].map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                required
                className={inputCls}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2
                            bg-blue-500 hover:bg-blue-600 text-white font-bold
                            text-sm py-3 rounded-full
                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30
                                border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'Sending code…' : 'Send verification code'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}