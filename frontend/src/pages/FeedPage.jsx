import { useEffect, useState, useCallback } from 'react'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import ComposeBox from '../components/ComposeBox'
import styles from './Page.module.css'
import { HiArrowPath } from 'react-icons/hi2'

export default function FeedPage() {
  const [tab, setTab] = useState('foryou') // 'foryou' | 'following'
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = tab === 'foryou' 
        ? await tweetsAPI.list() 
        : await tweetsAPI.feed()
      const data = response.data
      setTweets(Array.isArray(data) ? data : data.results ?? [])
    } catch {
      setError('Could not load tweets. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const handlePost = (newTweet) => {
    // Automatically add new tweet to the top of the feed if applicable
    setTweets((prev) => [newTweet, ...prev])
  };

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
      {/* Dynamic Tab Header */}
      <header className={styles.tabHeader}>
        <div className={styles.tabWrapper}>
          <button 
            className={`${styles.tabBtn} ${tab === 'foryou' ? styles.activeTab : ''}`}
            onClick={() => setTab('foryou')}
          >
            <span>For you</span>
            <span className={styles.tabIndicator} />
          </button>
          <button 
            className={`${styles.tabBtn} ${tab === 'following' ? styles.activeTab : ''}`}
            onClick={() => setTab('following')}
          >
            <span>Following</span>
            <span className={styles.tabIndicator} />
          </button>
        </div>
        <button className={styles.refreshBtn} onClick={load} title="Refresh">
          <HiArrowPath className={loading ? styles.spinning : ''} />
        </button>
      </header>

      <ComposeBox onPost={handlePost} />

      {loading && (
        <div className={styles.center}><div className="spinner" /></div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && tweets.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText1}>Your feed is empty.</p>
          <p className={styles.emptyText2}>
            {tab === 'following' 
              ? 'Follow some users or switch to "For you" to see post updates!'
              : 'Be the first one to create a post!'}
          </p>
        </div>
      )}

      {!loading && !error && tweets.map((tweet) => (
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
