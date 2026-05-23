import { useState } from 'react'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { Avatar } from './TweetCard'
import styles from './ComposeBox.module.css'

const MAX_CHARS = 280

export default function ComposeBox({ onPost }) {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || loading) return
    setLoading(true)
    setError('')
    try {
      const { data } = await tweetsAPI.create({ content: content.trim() })
      setContent('')
      onPost?.(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  if (!user) return null

  return (
    <div className={styles.box}>
      <Avatar username={user.username} />
      <div className={styles.right}>
        <textarea
          className={styles.textarea}
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          maxLength={MAX_CHARS + 50}
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <span className={`${styles.counter} ${remaining < 20 ? styles.warn : ''} ${isOverLimit ? styles.over : ''}`}>
            {remaining}
          </span>
          <button
            className={styles.postBtn}
            onClick={handleSubmit}
            disabled={isEmpty || isOverLimit || loading}
          >
            {loading ? <span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> : 'Chato'}
          </button>
        </div>
      </div>
    </div>
  )
}
