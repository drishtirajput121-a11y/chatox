import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard, { Avatar } from '../components/TweetCard'
import { HiArrowLeft, HiTrash } from 'react-icons/hi2'
import { formatDistanceToNow } from 'date-fns'

function ReplyCard({ reply, onDelete, isMe }) {
  const [deleting, setDeleting] = useState(false)
  const timeAgo = reply.created_at
    ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
    : ''

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this reply?')) return
    setDeleting(true)
    try {
      await tweetsAPI.deleteReply(reply.id)
      onDelete(reply.id)
    } catch { }
    finally { setDeleting(false) }
  }

  return (
    <div className="flex gap-3 px-3 md:px-4 py-3
      border-b border-gray-200 dark:border-gray-800
      bg-white dark:bg-black
      hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">

      <Link to={`/${reply.author.username}`} className="flex-shrink-0">
        <Avatar
          username={reply.author.username}
          src={reply.author.avatar}
          size={36}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Link
              to={`/${reply.author.username}`}
              className="font-bold text-sm text-gray-900 dark:text-white hover:underline truncate"
            >
              {reply.author.first_name || reply.author.username}
            </Link>
            <span className="text-xs text-gray-500">@{reply.author.username}</span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          {/* Delete button — only for reply owner */}
          {isMe && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-full text-gray-400 text-lg
                hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors flex-shrink-0 disabled:opacity-50"
              title="Delete reply"
            >
              {deleting
                ? <span className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin block" />
                : <HiTrash />
              }
            </button>
          )}
        </div>

        <p className="text-sm leading-relaxed text-gray-900 dark:text-white
          whitespace-pre-wrap break-words">
          {reply.content}
        </p>
      </div>
    </div>
  )
}

export default function TweetDetailPage() {
  const { pk } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: me } = useAuthStore()

  const [tweet, setTweet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replies, setReplies] = useState([])
  const [repliesLoading, setRepliesLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const replyInputRef = useRef(null)

  // load tweet
  useEffect(() => {
    setLoading(true)
    setError('')
    tweetsAPI.get(pk)
      .then(({ data }) => setTweet(data))
      .catch(() => setError('Tweet not found'))
      .finally(() => setLoading(false))
  }, [pk])

  // load replies from backend
  useEffect(() => {
    setRepliesLoading(true)
    tweetsAPI.getReplies(pk)
      .then(({ data }) => setReplies(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setReplies([]))
      .finally(() => setRepliesLoading(false))
  }, [pk])

  // focus reply input if navigated with focusReply
  useEffect(() => {
    if (tweet && location.state?.focusReply) {
      setTimeout(() => {
        replyInputRef.current?.focus()
        replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
    }
  }, [tweet, location.state])

  const handleDelete = () => navigate(-1)

  const handleLikeToggle = (id, data) => {
    setTweet(t => ({ ...t, is_liked: data.is_liked, likes_count: data.likes_count }))
  }

  const handlePostReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || posting) return
    setPosting(true)
    try {
      const { data } = await tweetsAPI.createReply(pk, replyText.trim())
      setReplies(prev => [...prev, data])
      setReplyText('')
    } catch { }
    finally { setPosting(false) }
  }

  const handleDeleteReply = (replyId) => {
    setReplies(prev => prev.filter(r => r.id !== replyId))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black pb-16 md:pb-0">

      {/* Header */}
      <header className="flex items-center gap-4 px-3 md:px-4 py-2
        border-b border-gray-200 dark:border-gray-800
        sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-full
            text-gray-900 dark:text-white text-xl
            hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <HiArrowLeft />
        </button>
        <h1 className="text-base md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Post
        </h1>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="py-16 px-8 text-center text-gray-500">
          <p>{error}</p>
        </div>
      )}

      {tweet && (
        <div className="flex flex-col">
          <TweetCard
            tweet={tweet}
            onDelete={handleDelete}
            onLikeToggle={handleLikeToggle}
          />

          {/* Reply form */}
          {me && (
            <form
              onSubmit={handlePostReply}
              className="flex gap-3 px-3 md:px-4 py-3
                border-b border-gray-200 dark:border-gray-800
                bg-white dark:bg-black"
            >
              <Avatar username={me.username} src={me.avatar} size={36} />
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  ref={replyInputRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Post your reply"
                  rows={2}
                  maxLength={280}
                  className="w-full border-none outline-none resize-none text-base
                    leading-relaxed text-gray-900 dark:text-white bg-transparent py-1.5
                    placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {280 - replyText.length} remaining
                  </span>
                  <button
                    type="submit"
                    disabled={!replyText.trim() || posting}
                    className="bg-blue-500 hover:bg-blue-600 text-white
                      disabled:opacity-50 disabled:cursor-not-allowed
                      rounded-full px-5 py-1.5 text-sm font-bold
                      transition-colors flex items-center gap-2"
                  >
                    {posting && (
                      <span className="w-3.5 h-3.5 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                    )}
                    Reply
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          {repliesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500
                rounded-full animate-spin" />
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              No replies yet. Be the first to reply!
            </div>
          ) : (
            replies.map(reply => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                onDelete={handleDeleteReply}
                isMe={me?.username === reply.author?.username}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}