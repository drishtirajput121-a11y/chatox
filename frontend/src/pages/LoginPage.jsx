import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import styles from './Page.module.css'

export default function LoginPage() {
  const { login } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await login(form)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed. Check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authWrap}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <span className={styles.authDot} />
          Chatox
        </div>

        <h1 className={styles.authHeading}>Sign in</h1>

        {error && <div className={styles.formError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              value={form.username}
              onChange={set('username')}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading && <span className="spinner" style={{ width:16, height:16, borderWidth:2, borderColor:'rgba(255,255,255,0.3)', borderTopColor:'#fff' }} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          New to Chatox? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  )
}
