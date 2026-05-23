import { useState } from 'react'
import { usersAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { useThemeStore } from '../context/themeStore'
import styles from './Page.module.css'
import { HiSun, HiMoon } from 'react-icons/hi2'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  
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
    setForm((f) => ({ ...f, [k]: e.target.value }))
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

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </header>

      <div className={styles.settingsContent}>
        <p className={styles.settingsSub}>
          @{user?.username} — Customize your experience and account info
        </p>

        {error && <div className={styles.formError}>{error}</div>}
        {success && (
          <div className={styles.formSuccess}>
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.settingsForm}>
          {/* Theme Settings Section */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Display Theme</label>
            <div className={styles.themeSelectorRow}>
              <button
                type="button"
                className={`${styles.themeOptionBtn} ${theme === 'dark' ? styles.activeThemeOption : ''}`}
                onClick={() => setTheme('dark')}
              >
                <HiMoon className={styles.themeOptionIcon} />
                <span>Dark Mode</span>
              </button>
              
              <button
                type="button"
                className={`${styles.themeOptionBtn} ${theme === 'light' ? styles.activeThemeOption : ''}`}
                onClick={() => setTheme('light')}
              >
                <HiSun className={styles.themeOptionIcon} />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Account Settings Section */}
          {[
            { key: 'first_name', label: 'First name' },
            { key: 'last_name', label: 'Last name' },
            { key: 'email', label: 'Email', type: 'email' },
          ].map(({ key, label, type = 'text' }) => (
            <div className={styles.formGroup} key={key}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                type={type}
                value={form[key]}
                onChange={set(key)}
              />
            </div>
          ))}

          <div className={styles.formGroup}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.input}
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              style={{ resize: 'vertical' }}
              placeholder="Tell people about yourself"
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading && <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} />}
            {loading ? 'Saving Changes…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
