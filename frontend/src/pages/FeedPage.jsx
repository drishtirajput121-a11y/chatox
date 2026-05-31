import { useEffect, useState, useCallback } from 'react'
import { tweetsAPI } from '../api/client'
import TweetCard from '../components/TweetCard'
import ComposeBox from '../components/ComposeBox'
import { HiArrowPath } from 'react-icons/hi2'

export default function FeedPage() {
  const [tab, setTab] = useState('foryou')
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

  useEffect(() => { load() }, [load])

  const handlePost = (newTweet) => setTweets(prev => [newTweet, ...prev])
  const handleDelete = (id) => setTweets(prev => prev.filter(t => t.id !== id))
  const handleLikeToggle = (id, data) => {
    setTweets(prev => prev.map(t =>
      t.id === id ? { ...t, is_liked: data.is_liked, likes_count: data.likes_count } : t
    ))
  }
  const handleEdit = (id, data) => {
    setTweets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black pb-16 md:pb-0">

      {/* Tab header */}
      <header className="sticky top-0 z-20 flex items-center
        border-b border-gray-200 dark:border-gray-800
        bg-white/95 dark:bg-black/95 backdrop-blur-md">
        <div className="flex flex-1">
          {[
            { key: 'foryou', label: 'For you' },
            { key: 'following', label: 'Following' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 relative flex justify-center items-center
                py-3.5 md:py-4 text-sm font-medium transition-colors cursor-pointer
                hover:bg-gray-100 dark:hover:bg-gray-900
                ${tab === key
                  ? 'text-gray-900 dark:text-white font-bold'
                  : 'text-gray-500'
                }`}
            >
              {label}
              {tab === key && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2
                  w-14 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="w-9 h-9 mr-3 flex items-center justify-center rounded-full
            text-blue-500 text-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
        >
          <HiArrowPath className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Compose */}
      <ComposeBox onPost={handlePost} />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={load}
            className="px-5 py-2 rounded-full border border-gray-300
              dark:border-gray-700 text-sm font-semibold
              text-gray-900 dark:text-white
              hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tweets.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 px-8">
          <p className="text-2xl md:text-3xl font-extrabold tracking-tight
            text-gray-900 dark:text-white mb-2">
            Your feed is empty.
          </p>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            {tab === 'following'
              ? 'Follow some users or switch to "For you" to see post updates!'
              : 'Be the first one to create a post!'
            }
          </p>
        </div>
      )}

      {/* Tweets */}
      {!loading && !error && tweets.map(tweet => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onDelete={handleDelete}
          onLikeToggle={handleLikeToggle}
          onEdit={handleEdit}
        />
      ))}
    </div>
  )
}