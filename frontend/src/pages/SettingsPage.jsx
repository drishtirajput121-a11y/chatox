import { useState } from 'react'
import { usersAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import styles from './Page.module.css'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
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

      <div style={{ padding:'1.5rem 1.1rem', maxWidth:480 }}>
        <p style={{ fontSize:'0.82rem', color:'var(--text-3)', marginBottom:'1.25rem' }}>
          @{user?.username} — Edit your profile info
        </p>

        {error && <div className={styles.formError}>{error}</div>}
        {success && (
          <div style={{ background:'var(--green-light)', color:'var(--green-dark)', borderRadius:'var(--radius-sm)', padding:'9px 12px', fontSize:'0.85rem', marginBottom:'1rem' }}>
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { key:'first_name', label:'First name' },
            { key:'last_name', label:'Last name' },
            { key:'email', label:'Email', type:'email' },
          ].map(({ key, label, type='text' }) => (
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
              style={{ resize:'vertical' }}
              placeholder="Tell people about yourself"
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading && <span className="spinner" style={{ width:16, height:16, borderWidth:2, borderColor:'rgba(255,255,255,0.3)', borderTopColor:'#fff' }} />}
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
