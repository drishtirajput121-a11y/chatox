import { useEffect, useState } from 'react'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import styles from './Page.module.css'
import eStyles from './ExplorePage.module.css'

export default function ExplorePage() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    tweetsAPI.list()
      .then(({ data }) => setTweets(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = tweets.filter((t) =>
    !search.trim() ||
    t.content?.toLowerCase().includes(search.toLowerCase()) ||
    t.author?.username?.toLowerCase().includes(search.toLowerCase())
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
        <h1 className={styles.pageTitle}>Explore</h1>
      </header>

      <div className={eStyles.searchBar}>
        <span className={eStyles.searchIcon}>🔍</span>
        <input
          className={eStyles.searchInput}
          type="search"
          placeholder="Search Chatox"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className={styles.center}><div className="spinner" /></div>}

      {!loading && filtered.length === 0 && (
        <div className={styles.empty}><p>No results found.</p></div>
      )}

      {filtered.map((tweet) => (
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
