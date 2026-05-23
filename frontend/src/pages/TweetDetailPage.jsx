import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import styles from './Page.module.css'

export default function TweetDetailPage() {
  const { pk } = useParams()
  const navigate = useNavigate()
  const [tweet, setTweet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    tweetsAPI.get(pk)
      .then(({ data }) => setTweet(data))
      .catch(() => setError('Tweet not found'))
      .finally(() => setLoading(false))
  }, [pk])

  const handleDelete = () => navigate(-1)
  const handleLikeToggle = (id, data) => {
    setTweet((t) => ({ ...t, is_liked: data.is_liked, likes_count: data.likes_count }))
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <button
          onClick={() => navigate(-1)}
          style={{ background:'none', border:'none', color:'var(--text-2)', fontSize:'1.1rem', marginRight:'1rem', padding:'4px 8px', borderRadius:'var(--radius-sm)' }}
        >
          ←
        </button>
        <h1 className={styles.pageTitle}>Chato</h1>
      </header>

      {loading && <div className={styles.center}><div className="spinner" /></div>}
      {error && <div className={styles.empty}><p>{error}</p></div>}
      {tweet && (
        <TweetCard
          tweet={tweet}
          onDelete={handleDelete}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </div>
  )
}
