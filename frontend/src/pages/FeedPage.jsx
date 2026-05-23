import { useEffect, useState, useCallback } from 'react'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import ComposeBox from '../components/ComposeBox'
import styles from './Page.module.css'

export default function FeedPage() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await tweetsAPI.feed()
      setTweets(Array.isArray(data) ? data : data.results ?? [])
    } catch {
      setError('Could not load your feed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handlePost = (newTweet) => {
    setTweets((prev) => [newTweet, ...prev])
  }

  const handleDelete = (id) => {
    setTweets((prev) => prev.filter((t) => t.id !== id))
  }

  const handleLikeToggle = (id, data) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_liked: data.is_liked, likes_count: data.likes_count } : t
      )
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Home</h1>
        <button className={styles.refreshBtn} onClick={load} title="Refresh">↻</button>
      </header>

      <ComposeBox onPost={handlePost} />

      {loading && (
        <div className={styles.center}><div className="spinner" /></div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && tweets.length === 0 && (
        <div className={styles.empty}>
          <p>Your feed is empty.</p>
          <p>Follow some people to see their Chatos here!</p>
        </div>
      )}

      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onDelete={handleDelete}
          onLikeToggle={handleLikeToggle}
        />
      ))}
    </div>
  )
}
