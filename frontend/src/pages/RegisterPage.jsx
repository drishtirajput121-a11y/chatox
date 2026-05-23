import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import styles from './Page.module.css'
import { FaReact } from 'react-icons/fa'

export default function RegisterPage() {
  const { register } = useAuthStore()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await register(form)
    } catch (err) {
      const d = err.response?.data
      const msg = d?.username?.[0] || d?.email?.[0] || d?.password?.[0] || d?.detail || 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authWrap}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <FaReact className={styles.reactLogo} />
          <span>Chatox</span>
        </div>

        <h1 className={styles.authHeading}>Create your account</h1>

        {error && <div className={styles.formError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { key: 'username', label: 'Username', type: 'text', auto: 'username' },
            { key: 'email', label: 'Email', type: 'email', auto: 'email' },
            { key: 'password', label: 'Password', type: 'password', auto: 'new-password' },
            { key: 'password2', label: 'Confirm password', type: 'password', auto: 'new-password' },
          ].map(({ key, label, type, auto }) => (
            <div className={styles.formGroup} key={key}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                type={type}
                value={form[key]}
                onChange={set(key)}
                autoComplete={auto}
              />
            </div>
          ))}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading && <span className="spinner" style={{ width:16, height:16, borderWidth:2, borderColor:'rgba(255,255,255,0.3)', borderTopColor:'#fff' }} />}
            {loading ? 'Creating…' : 'Join Chatox'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
