import { useEffect, useState } from 'react'
import api from '../api/client'
import { HiBell, HiHeart, HiUserPlus, HiChatBubbleLeft, HiArrowPath } from 'react-icons/hi2'

// generates initials + a consistent color from username
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
    <div className={`flex items-start gap-3 px-5 py-4 border-b border-gray-100 
      hover:bg-gray-50 transition-colors cursor-pointer
      ${!n.is_read ? 'bg-blue-50 hover:bg-blue-50/80' : ''}`}
    >
      {/* avatar + icon badge */}
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center 
          text-sm font-medium ${color}`}>
          {initials}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full 
          flex items-center justify-center border-2 border-white ${config.bg}`}>
          <Icon className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{n.sender.username}</span>
          {' '}{config.label}
        </p>
        {n.tweet?.content && (
          <p className="text-xs text-gray-500 mt-1 pl-3 border-l-2 border-gray-200 truncate">
            {n.tweet.content}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>

      {/* unread dot */}
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
      )}
    </div>
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h1 className="text-lg font-medium">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))}
            className="text-xs text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* list */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <HiBell className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">Nothing to see here — yet</h2>
            <p className="text-sm text-gray-500 mt-1">
              When people like, reply to, or share your posts, you'll find them here.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {notifications.map(n => <NotificationCard key={n.id} n={n} />)}
        </div>
      )}
    </div>
  )
}