import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard, { Avatar } from '../components/TweetCard'
import { HiArrowLeft } from 'react-icons/hi2'
import { formatDistanceToNow } from 'date-fns'

export default function TweetDetailPage() {
  const { pk } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: me } = useAuthStore()

  const [tweet, setTweet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const replyInputRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    tweetsAPI.get(pk)
      .then(({ data }) => {
        setTweet(data)
        const saved = localStorage.getItem(`chatox_replies_${pk}`)
        setReplies(saved ? JSON.parse(saved) : [])
      })
      .catch(() => setError('Tweet not found'))
      .finally(() => setLoading(false))
  }, [pk])

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

  const handlePostReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    const newReply = {
      id: 'reply_' + Date.now(),
      author: { username: me?.username || 'user', first_name: me?.first_name || me?.username || 'User' },
      content: replyText.trim(),
      created_at: new Date().toISOString(),
    }
    const updated = [newReply, ...replies]
    setReplies(updated)
    localStorage.setItem(`chatox_replies_${pk}`, JSON.stringify(updated))
    setReplyText('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] pb-16 md:pb-0">

      {/* Header */}
      <header className="flex items-center gap-4 md:gap-5 px-3 md:px-4 py-2
        border-b border-[var(--border)] sticky top-0
        bg-[var(--bg)] opacity-[0.98] backdrop-blur-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-full
            text-[var(--text-1)] text-xl bg-transparent border-none
            transition-colors duration-200 hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <HiArrowLeft />
        </button>
        <h1 className="text-base md:text-[1.25rem] font-extrabold text-[var(--text-1)] tracking-tight">
          Post
        </h1>
      </header>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="py-16 px-8 text-center text-[var(--text-2)]">
          <p>{error}</p>
        </div>
      )}

      {tweet && (
        <div className="flex flex-col">
          <TweetCard tweet={tweet} onDelete={handleDelete} onLikeToggle={handleLikeToggle} />

          {/* Reply form */}
          {me && (
            <form onSubmit={handlePostReply}
              className="flex gap-3 px-3 md:px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
              <Avatar username={me.username} size={36} />
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full border-none outline-none resize-none text-base md:text-[1.1rem]
                    leading-[1.4] text-[var(--text-1)] bg-transparent py-1.5
                    placeholder:text-[var(--text-2)]"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-white border-none rounded-full px-4 py-2 text-sm font-bold
                      transition-[background-color,opacity] duration-200 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          <div className="flex flex-col">
            {replies.map(reply => {
              const timeAgo = reply.created_at
                ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
                : ''
              return (
                <div key={reply.id}
                  className="flex gap-3 px-3 md:px-4 py-3 border-b border-[var(--border)]
                    bg-[var(--bg)] transition-colors duration-200 hover:bg-[var(--bg-hover)]">
                  <Avatar username={reply.author.username} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-[3px] flex-wrap">
                      <span className="font-bold text-sm text-[var(--text-1)]">
                        {reply.author.first_name || reply.author.username}
                      </span>
                      <span className="text-xs text-[var(--text-2)]">@{reply.author.username}</span>
                      <span className="text-[var(--text-2)]">·</span>
                      <span className="text-xs text-[var(--text-2)]">{timeAgo}</span>
                    </div>
                    <p className="text-sm leading-[1.45] text-[var(--text-1)] whitespace-pre-wrap break-words">
                      {reply.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}