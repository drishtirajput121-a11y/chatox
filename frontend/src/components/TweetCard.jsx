import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { formatDistanceToNow } from 'date-fns'
import PollDisplay from './PollDisplay'
import {
  HiHeart, HiOutlineHeart, HiChatBubbleLeft,
  HiLink, HiTrash, HiShare, HiMapPin, HiPencil,
  HiCheck, HiXMark
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
    <img src={src} alt={username}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  )

  return (
    <div
      className={`rounded-full flex items-center justify-center
        font-bold flex-shrink-0 leading-none ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {username ? username[0].toUpperCase() : '?'}
    </div>
  )
}

/* ── Images grid ── */
function ImagesGrid({ images }) {
  if (!images?.length) return null

  const [current, setCurrent] = useState(0)
  const [paddingBottom, setPaddingBottom] = useState('56.25%')

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    const ratio = naturalWidth / naturalHeight
    if (ratio >= 1.6) setPaddingBottom('56.25%')       // 16:9
    else if (ratio >= 0.9) setPaddingBottom('100%')    // 1:1
    else setPaddingBottom('125%')                       // 4:5
  }

  const prev = (e) => {
    e.stopPropagation()
    setCurrent(i => (i - 1 + images.length) % images.length)
  }

  const next = (e) => {
    e.stopPropagation()
    setCurrent(i => (i + 1) % images.length)
  }

  return (
    <div
      className="relative mt-2 rounded-2xl overflow-hidden
        border border-gray-200 dark:border-gray-800 w-full"
      style={{ paddingBottom }}
      onClick={e => e.stopPropagation()}
    >
      <img
        src={images[current].image}
        alt="tweet media"
        onLoad={handleLoad}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2
              w-8 h-8 rounded-full bg-black/50 hover:bg-black/75
              text-white flex items-center justify-center
              transition-colors text-lg font-bold">
            ‹
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2
              w-8 h-8 rounded-full bg-black/50 hover:bg-black/75
              text-white flex items-center justify-center
              transition-colors text-lg font-bold">
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2
            flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setCurrent(i) }}
                className={`rounded-full transition-all
                  ${i === current
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── TweetCard ── */
export default function TweetCard({ tweet, onDelete, onLikeToggle, onEdit }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [likeLoading, setLikeLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(tweet.content)
  const [editLoading, setEditLoading] = useState(false)

  const isOwner = user?.username === tweet.author?.username

  const timeAgo = tweet.created_at
    ? formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })
    : ''

  const handleLike = async (e) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    const wasLiked = tweet.is_liked
    const wasCount = tweet.likes_count ?? 0
    onLikeToggle?.(tweet.id, {
      is_liked: !wasLiked,
      likes_count: wasLiked ? wasCount - 1 : wasCount + 1,
    })
    try {
      const { data } = await tweetsAPI.toggleLike(tweet.id)
      onLikeToggle?.(tweet.id, { is_liked: data.is_liked, likes_count: data.likes_count })
    } catch {
      onLikeToggle?.(tweet.id, { is_liked: wasLiked, likes_count: wasCount })
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this Chatox?')) return
    try {
      await tweetsAPI.delete(tweet.id)
      onDelete?.(tweet.id)
    } catch { }
  }

  const handleEditStart = (e) => {
    e.stopPropagation()
    setEditContent(tweet.content)
    setEditing(true)
  }

  const handleEditCancel = (e) => {
    e.stopPropagation()
    setEditing(false)
    setEditContent(tweet.content)
  }

  const handleEditSave = async (e) => {
    e.stopPropagation()
    if (!editContent.trim() || editLoading) return
    setEditLoading(true)
    try {
      const { data } = await tweetsAPI.update(tweet.id, { content: editContent.trim() })
      onEdit?.(tweet.id, data)
      setEditing(false)
    } catch { }
    finally { setEditLoading(false) }
  }

  const handleEditKey = (e) => {
    e.stopPropagation()
    if (e.key === 'Escape') handleEditCancel(e)
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleEditSave(e)
  }

  const goToTweet = (focusReply = false) => {
    if (editing) return
    navigate(`/${tweet.author?.username}/status/${tweet.id}`, { state: { focusReply } })
  }

  const handleCopyLink = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(
      `${window.location.origin}/${tweet.author?.username}/status/${tweet.id}`
    )
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
      <Link to={`/${tweet.author?.username}`} onClick={e => e.stopPropagation()}
        className="flex-shrink-0">
        <Avatar username={tweet.author?.username || '?'} src={tweet.author?.avatar} />
      </Link>

      {/* Body */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Link to={`/${tweet.author?.username}`} onClick={e => e.stopPropagation()}
              className="font-bold text-sm text-gray-900 dark:text-white truncate hover:underline">
              {tweet.author?.first_name || tweet.author?.username}
            </Link>
            <span className="text-sm text-gray-500 truncate">@{tweet.author?.username}</span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-500 whitespace-nowrap" title={tweet.created_at}>
              {timeAgo}
            </span>
          </div>

          {/* Owner actions — edit + delete */}
          {isOwner && !editing && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={handleEditStart} title="Edit"
                className="p-1.5 rounded-full text-gray-400 text-lg flex items-center
                  hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <HiPencil />
              </button>
              <button onClick={handleDelete} title="Delete"
                className="p-1.5 rounded-full text-gray-400 text-lg flex items-center
                  hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <HiTrash />
              </button>
            </div>
          )}
        </div>

        {/* Content — inline edit or display */}
        {editing ? (
          <div onClick={e => e.stopPropagation()} className="mt-1 mb-2">
            <textarea
              autoFocus
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              onKeyDown={handleEditKey}
              rows={3}
              maxLength={280}
              className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-blue-400
                rounded-xl px-3 py-2 outline-none resize-none
                text-gray-900 dark:text-white leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-gray-400">{280 - editContent.length} remaining · Ctrl+Enter to save · Esc to cancel</span>
              <div className="flex gap-2">
                <button onClick={handleEditCancel}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs
                    text-gray-500 border border-gray-300 dark:border-gray-700
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <HiXMark className="text-sm" /> Cancel
                </button>
                <button onClick={handleEditSave}
                  disabled={!editContent.trim() || editLoading}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs
                    bg-blue-500 text-white font-semibold
                    hover:bg-blue-600 disabled:opacity-50 transition-colors">
                  {editLoading
                    ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    : <HiCheck className="text-sm" />
                  }
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-gray-900 dark:text-white
            whitespace-pre-wrap break-words mt-0.5 mb-3">
            {tweet.content}
          </p>
        )}

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
          <PollDisplay poll={tweet.poll} tweetAuthor={tweet.author?.username} />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between max-w-sm mt-3">

          {/* Reply */}
          <button onClick={e => { e.stopPropagation(); goToTweet(true) }}
            className="group flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
            <span className="flex items-center justify-center p-1.5 rounded-full text-xl
              group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
              <HiChatBubbleLeft />
            </span>
            <span className="text-xs font-medium">Reply</span>
          </button>

          {/* Like */}
          <button onClick={handleLike} disabled={likeLoading}
            className={`group flex items-center gap-1 transition-colors
              ${tweet.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            <span className={`flex items-center justify-center p-1.5 rounded-full text-xl transition-colors
              ${tweet.is_liked ? 'bg-red-50 dark:bg-red-500/10' : 'group-hover:bg-red-50 dark:group-hover:bg-red-500/10'}`}>
              {tweet.is_liked ? <HiHeart /> : <HiOutlineHeart />}
            </span>
            <span className="text-xs font-medium">{tweet.likes_count ?? 0}</span>
          </button>

          {/* Copy link */}
          <button onClick={handleCopyLink}
            className="group flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
            <span className="flex items-center justify-center p-1.5 rounded-full text-xl
              group-hover:bg-green-50 dark:group-hover:bg-green-500/10 transition-colors">
              <HiLink />
            </span>
            <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Share */}
          <button onClick={handleShare}
            className="group flex items-center justify-center p-1.5 rounded-full text-xl
              text-gray-500 hover:text-blue-500
              hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            title="Share">
            <HiShare />
          </button>

        </div>
      </div>
    </article>
  )
}

export { Avatar }