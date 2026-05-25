import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { formatDistanceToNow } from 'date-fns'
import PollDisplay from './PollDisplay'
import {
  HiHeart, HiOutlineHeart, HiChatBubbleLeft,
  HiLink, HiTrash, HiShare, HiMapPin
} from 'react-icons/hi2'

/* ── Avatar ── */
function Avatar({ username, src, size = 40 }) {
  const palettes = [
    ['bg-blue-100 text-blue-600'],
    ['bg-green-100 text-green-600'],
    ['bg-pink-100 text-pink-600'],
    ['bg-purple-100 text-purple-600'],
    ['bg-amber-100 text-amber-600'],
    ['bg-teal-100 text-teal-600'],
  ]
  const idx = username ? username.charCodeAt(0) % palettes.length : 0
  const cls = palettes[idx][0]

  if (src) return (
    <img
      src={src}
      alt={username}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  )

  return (
    <div
      className={`rounded-full flex items-center justify-center
        font-bold flex-shrink-0 ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {username ? username[0].toUpperCase() : '?'}
    </div>
  )
}

/* ── Images grid ── */
function ImagesGrid({ images }) {
  if (!images?.length) return null
  return (
    <div
      className={`grid gap-1 mt-2 rounded-2xl overflow-hidden
        border border-gray-200 dark:border-gray-800
        ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
      onClick={e => e.stopPropagation()}
    >
      {images.map(img => (
        <img
          key={img.id}
          src={img.image}
          alt="tweet media"
          className="w-full h-48 object-cover"
        />
      ))}
    </div>
  )
}

/* ── Action button ── */
function ActionBtn({ onClick, icon, label, hoverColor, activeColor, active }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1 bg-transparent border-none
        cursor-pointer transition-colors
        ${active ? activeColor : 'text-gray-500'}`}
    >
      <span className={`flex items-center justify-center p-1.5 rounded-full
        text-xl transition-colors
        ${active
          ? `${activeColor}`
          : `group-hover:${hoverColor.bg} group-hover:${hoverColor.text}`
        }`}>
        {icon}
      </span>
      {label !== undefined && (
        <span className="text-xs font-medium">{label}</span>
      )}
    </button>
  )
}

/* ── TweetCard ── */
export default function TweetCard({ tweet, onDelete, onLikeToggle }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [likeLoading, setLikeLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOwner = user?.username === tweet.author?.username

  const timeAgo = tweet.created_at
    ? formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })
    : ''

  const handleLike = async (e) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      const { data } = await tweetsAPI.toggleLike(tweet.id)
      onLikeToggle?.(tweet.id, data)
    } catch { }
    finally { setLikeLoading(false) }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this Chatox?')) return
    try {
      await tweetsAPI.delete(tweet.id)
      onDelete?.(tweet.id)
    } catch { }
  }

  const goToTweet = (focusReply = false) => {
    navigate(`/${tweet.author?.username}/status/${tweet.id}`, {
      state: { focusReply }
    })
  }

  const handleCopyLink = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/${tweet.author?.username}/status/${tweet.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (e) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: 'Chatox Post',
        text: tweet.content,
        url: `${window.location.origin}/${tweet.author?.username}/status/${tweet.id}`
      }).catch(() => { })
    }
  }

  return (
    <article
      onClick={() => goToTweet(false)}
      className="flex gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800
        bg-white dark:bg-black cursor-pointer
        hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors fade-up"
    >
      {/* Avatar */}
      <Link
        to={`/${tweet.author?.username}`}
        onClick={e => e.stopPropagation()}
        className="flex-shrink-0"
      >
        <Avatar
          username={tweet.author?.username || '?'}
          src={tweet.author?.avatar}
        />
      </Link>>

      {/* Body */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Link
              to={`/${tweet.author?.username}`}
              onClick={e => e.stopPropagation()}
              className="font-bold text-sm text-gray-900 dark:text-white
                truncate hover:underline"
            >
              {tweet.author?.first_name || tweet.author?.username}
            </Link>
            <span className="text-sm text-gray-500 truncate">
              @{tweet.author?.username}
            </span>
            <span className="text-gray-400">·</span>
            <span
              className="text-sm text-gray-500 whitespace-nowrap"
              title={tweet.created_at}
            >
              {timeAgo}
            </span>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              title="Delete"
              className="p-1.5 rounded-full text-gray-400 text-lg flex items-center
                hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors flex-shrink-0"
            >
              <HiTrash />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-gray-900 dark:text-white
          whitespace-pre-wrap break-words mt-0.5 mb-3">
          {tweet.content}
        </p>

        {/* Location */}
        {tweet.location && (
          <div className="flex items-center gap-1 mb-2">
            <HiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400">{tweet.location}</span>
          </div>
        )}

        {/* Images */}
        <ImagesGrid images={tweet.images} />

        {/* Poll */}
        {tweet.poll && (
          <PollDisplay
            poll={tweet.poll}
            tweetAuthor={tweet.author?.username}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between max-w-sm mt-3">

          {/* Reply */}
          <button
            onClick={e => { e.stopPropagation(); goToTweet(true) }}
            className="group flex items-center gap-1 text-gray-500
              hover:text-blue-500 transition-colors"
          >
            <span className="flex items-center justify-center p-1.5 rounded-full
              text-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10
              transition-colors">
              <HiChatBubbleLeft />
            </span>
            <span className="text-xs font-medium">Reply</span>
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`group flex items-center gap-1 transition-colors
              ${tweet.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <span className={`flex items-center justify-center p-1.5 rounded-full
              text-xl transition-colors
              ${tweet.is_liked
                ? 'bg-red-50 dark:bg-red-500/10'
                : 'group-hover:bg-red-50 dark:group-hover:bg-red-500/10'
              }`}>
              {tweet.is_liked ? <HiHeart /> : <HiOutlineHeart />}
            </span>
            <span className="text-xs font-medium">{tweet.likes_count ?? 0}</span>
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="group flex items-center gap-1 text-gray-500
              hover:text-green-500 transition-colors"
          >
            <span className="flex items-center justify-center p-1.5 rounded-full
              text-xl group-hover:bg-green-50 dark:group-hover:bg-green-500/10
              transition-colors">
              <HiLink />
            </span>
            <span className="text-xs font-medium">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="group flex items-center justify-center p-1.5 rounded-full
              text-xl text-gray-500 hover:text-blue-500
              hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            title="Share"
          >
            <HiShare />
          </button>

        </div>
      </div>
    </article>
  )
}

export { Avatar }