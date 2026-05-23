import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import styles from './Page.module.css'

export default function ExplorePage() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  
  const query = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    tweetsAPI.list()
      .then(({ data }) => setTweets(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  const filtered = tweets.filter((t) =>
    !query.trim() ||
    t.content?.toLowerCase().includes(query.toLowerCase()) ||
    t.author?.username?.toLowerCase().includes(query.toLowerCase()) ||
    (t.author?.first_name && t.author.first_name.toLowerCase().includes(query.toLowerCase()))
  )

  const handleDelete = (id) => setTweets((t) => t.filter((x) => x.id !== id))
  
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
        <h1 className={styles.pageTitle}>
          {query ? `Search results for "${query}"` : 'Explore'}
        </h1>
      </header>

      {loading && <div className={styles.center}><div className="spinner" /></div>}

      {!loading && filtered.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText1}>No results found.</p>
          <p className={styles.emptyText2}>Try searching for something else or explore more Chatos!</p>
        </div>
      )}

      {!loading && filtered.map((tweet) => (
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
