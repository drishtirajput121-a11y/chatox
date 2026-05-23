import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard, { Avatar } from '../components/TweetCard'
import styles from './Page.module.css'
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
  
  // Local storage replies simulation
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const replyInputRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    tweetsAPI.get(pk)
      .then(({ data }) => {
        setTweet(data)
        // Load simulated replies from localStorage
        const savedReplies = localStorage.getItem(`chatox_replies_${pk}`)
        if (savedReplies) {
          setReplies(JSON.parse(savedReplies))
        } else {
          setReplies([])
        }
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
    setTweet((t) => ({ ...t, is_liked: data.is_liked, likes_count: data.likes_count }))
  }

  const handlePostReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const newReply = {
      id: 'reply_' + Date.now(),
      author: {
        username: me?.username || 'user',
        first_name: me?.first_name || me?.username || 'User'
      },
      content: replyText.trim(),
      created_at: new Date().toISOString()
    }

    const updated = [newReply, ...replies]
    setReplies(updated)
    localStorage.setItem(`chatox_replies_${pk}`, JSON.stringify(updated))
    setReplyText('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.profileHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} title="Back">
          <HiArrowLeft />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>Post</h1>
        </div>
      </header>

      {loading && <div className={styles.center}><div className="spinner" /></div>}
      {error && <div className={styles.empty}><p>{error}</p></div>}
      
      {tweet && (
        <div className={styles.detailContainer}>
          <TweetCard
            tweet={tweet}
            onDelete={handleDelete}
            onLikeToggle={handleLikeToggle}
          />

          {/* Reply Form */}
          {me && (
            <form onSubmit={handlePostReply} className={styles.replyForm}>
              <Avatar username={me.username} size={36} />
              <div className={styles.replyFormBody}>
                <textarea
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Post your reply"
                  className={styles.replyTextarea}
                  rows={2}
                />
                <div className={styles.replyFormFooter}>
                  <button 
                    type="submit" 
                    disabled={!replyText.trim()} 
                    className={styles.replySubmitBtn}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Replies List */}
          <div className={styles.repliesList}>
            {replies.map((reply) => {
              const timeAgo = reply.created_at
                ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
                : ''
              return (
                <div key={reply.id} className={styles.replyCard}>
                  <Avatar username={reply.author.username} size={36} />
                  <div className={styles.replyCardBody}>
                    <div className={styles.replyCardHeader}>
                      <span className={styles.replyAuthorName}>
                        {reply.author.first_name || reply.author.username}
                      </span>
                      <span className={styles.replyHandle}>@{reply.author.username}</span>
                      <span className={styles.replyDot}>·</span>
                      <span className={styles.replyTime}>{timeAgo}</span>
                    </div>
                    <p className={styles.replyContent}>{reply.content}</p>
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
