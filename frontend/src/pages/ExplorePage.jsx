import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import PageLogo from '../components/PageLogo'

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

  const filtered = tweets.filter(t =>
    !query.trim() ||
    t.content?.toLowerCase().includes(query.toLowerCase()) ||
    t.author?.username?.toLowerCase().includes(query.toLowerCase()) ||
    t.author?.first_name?.toLowerCase().includes(query.toLowerCase())
  )

  const handleDelete = (id) => setTweets(t => t.filter(x => x.id !== id))
  const handleLikeToggle = (id, data) => {
    setTweets(prev => prev.map(t =>
      t.id === id ? { ...t, is_liked: data.is_liked, likes_count: data.likes_count } : t
    ))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black pb-16 md:pb-0">

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between
        px-4 py-3.5 border-b border-gray-200 dark:border-gray-800
        bg-white/95 dark:bg-black/95 backdrop-blur-md">
        <h1 className="text-lg md:text-xl font-extrabold tracking-tight
          text-gray-900 dark:text-white">
          {query ? `Results for "${query}"` : 'Explore'}
        </h1>
        <PageLogo />
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 px-8">
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white
            tracking-tight mb-2">
            No results found.
          </p>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            Try searching for something else or explore more Chatox!
          </p>
        </div>
      )}

      {/* Tweets */}
      {!loading && filtered.map(tweet => (
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