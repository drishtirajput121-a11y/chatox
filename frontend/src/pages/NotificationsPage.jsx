import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { HiBell, HiHeart, HiUserPlus, HiChatBubbleLeft, HiArrowPath } from 'react-icons/hi2'
import PageLogo from '../components/PageLogo'

function getAvatar(username) {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-teal-100 text-teal-800',
    'bg-rose-100 text-rose-800',
    'bg-purple-100 text-purple-800',
    'bg-amber-100 text-amber-800',
  ]
  const idx = username.charCodeAt(0) % colors.length
  const initials = username.slice(0, 2).toUpperCase()
  return { initials, color: colors[idx] }
}

const TYPE_CONFIG = {
  like: { icon: HiHeart, bg: 'bg-red-500', label: 'liked your post' },
  follow: { icon: HiUserPlus, bg: 'bg-teal-500', label: 'followed you' },
  reply: { icon: HiChatBubbleLeft, bg: 'bg-blue-500', label: 'replied to your post' },
  retweet: { icon: HiArrowPath, bg: 'bg-amber-500', label: 'reposted your post' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function NotificationCard({ n }) {
  const { initials, color } = getAvatar(n.sender.username)
  const config = TYPE_CONFIG[n.notification_type] ?? TYPE_CONFIG.like
  const Icon = config.icon

  return (
    <Link
      to={`/${n.sender.username}`}
      className={`flex items-start gap-3 px-4 md:px-5 py-4
        border-b border-gray-200 dark:border-gray-800
        transition-colors cursor-pointer
        ${n.is_read
          ? 'bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900/50'
          : 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-50/80 dark:hover:bg-blue-900/20'
        }`}
    >
      {/* Avatar + icon badge */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center
          justify-center text-sm font-medium ${color}`}>
          {initials}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full
          flex items-center justify-center
          border-2 border-white dark:border-black ${config.bg}`}>
          <Icon className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-semibold hover:underline">
            {n.sender.username}
          </span>
          {' '}{config.label}
        </p>
        {n.tweet?.content && (
          <p className="text-xs text-gray-500 mt-1 pl-3
            border-l-2 border-gray-200 dark:border-gray-700 truncate">
            {n.tweet.content}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
      )}
    </Link>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications/')
      .then(res => setNotifications(res.data.results ?? res.data))
      .catch(console.error)
      .finally(() => setLoading(false))

    api.post('/notifications/mark-read/').catch(() => { })
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black pb-16 md:pb-0">

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between
        px-4 md:px-5 py-3.5 border-b border-gray-200 dark:border-gray-800
        bg-white/95 dark:bg-black/95 backdrop-blur-md">
        <h1 className="text-lg md:text-xl font-extrabold tracking-tight
          text-gray-900 dark:text-white">
          Notifications
        </h1>
        <div className="flex items-center gap-3">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))}
              className="text-xs text-blue-500 font-medium px-3 py-1.5
                rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              Mark all read
            </button>
          )}
          <PageLogo />
        </div>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500
            rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4
          py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900
            flex items-center justify-center">
            <HiBell className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Nothing to see here — yet
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              When people like, reply to, or share your posts, you'll find them here.
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div>
          {notifications.map(n => (
            <NotificationCard key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  )
}