import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { useThemeStore } from '../context/themeStore'
import { HiSun, HiMoon, HiArrowRightOnRectangle } from 'react-icons/hi2'
import PageLogo from '../components/PageLogo'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => {
    setSuccess(false)
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const inputCls = `border border-[var(--border-strong)] rounded-xl px-3.5 py-3
    text-sm text-[var(--text-1)] bg-[var(--bg)] w-full outline-none
    transition-[border-color,box-shadow] duration-200
    focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-light)]`

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] pb-16 md:pb-0">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3.5
        border-b border-[var(--border)] sticky top-0
        bg-[var(--bg)] opacity-[0.98] backdrop-blur-md z-20">
        <h1 className="text-lg md:text-[1.25rem] font-extrabold text-[var(--text-1)] tracking-tight">
          Settings
        </h1>
        <PageLogo />
      </header>

      {/* Content */}
      <div className="px-4 py-5 w-full max-w-lg mx-auto">
        <p className="text-sm text-[var(--text-2)] mb-5">
          Hey!! @{user?.username}
        </p>

        {error && (
          <div className="bg-[var(--red-light)] text-[var(--red)] border border-[var(--red)]/20
            rounded-xl px-3.5 py-2.5 text-sm font-medium mb-5">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[rgba(0,186,124,0.1)] text-[var(--green)] border border-[rgba(0,186,124,0.2)]
            rounded-xl px-3.5 py-2.5 text-sm font-medium mb-4">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Theme Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">
              Display Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'dark', Icon: HiMoon, label: 'Dark Mode' },
                { value: 'light', Icon: HiSun, label: 'Light Mode' },
              ].map(({ value, Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex items-center justify-center gap-2.5 px-4 py-3.5
                    rounded-xl border font-semibold text-sm text-[var(--text-1)]
                    bg-[var(--bg-2)] transition-all duration-200 cursor-pointer
                    ${theme === value
                      ? 'border-[var(--accent)] bg-[var(--bg)] shadow-[0_0_0_2px_var(--accent-light)]'
                      : 'border-[var(--border-strong)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent)]'
                    }`}
                >
                  <Icon className="text-xl text-[var(--accent)]" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Account fields */}
          {[
            { key: 'first_name', label: 'First name' },
            { key: 'last_name', label: 'Last name' },
            { key: 'email', label: 'Email', type: 'email' },
          ].map(({ key, label, type = 'text' }) => (
            <div className="flex flex-col gap-1.5" key={key}>
              <label className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">
                {label}
              </label>
              <input className={inputCls} type={type} value={form[key]} onChange={set(key)} />
            </div>
          ))}

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">
              Bio
            </label>
            <textarea
              className={`${inputCls} resize-y`}
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell people about yourself"
            />
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2
              bg-[var(--accent)] hover:bg-[var(--accent-hover)]
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white border-none rounded-full py-3 text-sm font-bold
              transition-[background-color,opacity] duration-200 cursor-pointer"
          >
            {loading && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {loading ? 'Saving…' : 'Save changes'}
          </button>

          <div className="h-px bg-[var(--border)]" />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
              bg-transparent border border-red-300 dark:border-red-800
              text-red-500 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              rounded-full py-3 text-sm font-bold
              transition-colors duration-200 cursor-pointer"
          >
            <HiArrowRightOnRectangle className="text-lg" />
            Log out
          </button>

        </form>
      </div>
    </div>
  )
}