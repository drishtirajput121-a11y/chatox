import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { formatDistanceToNow } from 'date-fns'
import styles from './TweetCard.module.css'

function Avatar({ username, size = 42 }) {
  const colors = ['#E1F5EE','#E6F1FB','#FAEEDA','#FBEAF0','#EEEDFE','#FAECE7']
  const textColors = ['#0F6E56','#185FA5','#854F0B','#993556','#3C3489','#993C1D']
  const idx = username.charCodeAt(0) % colors.length
  return (
    <div
      className={styles.avatar}
      style={{
        width: size, height: size,
        background: colors[idx],
        color: textColors[idx],
        fontSize: size * 0.36,
      }}
    >
      {username[0].toUpperCase()}
    </div>
  )
}

export default function TweetCard({ tweet, onDelete, onLikeToggle }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [likeLoading, setLikeLoading] = useState(false)

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
    } catch {}
    finally { setLikeLoading(false) }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this Chato?')) return
    try {
      await tweetsAPI.delete(tweet.id)
      onDelete?.(tweet.id)
    } catch {}
  }

  const goToTweet = () => {
    navigate(`/${tweet.author?.username}/status/${tweet.id}`)
  }

  return (
    <article className={`${styles.card} fade-up`} onClick={goToTweet}>
      <Link
        to={`/${tweet.author?.username}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar username={tweet.author?.username || '?'} />
      </Link>

      <div className={styles.body}>
        <div className={styles.header}>
          <Link
            to={`/${tweet.author?.username}`}
            className={styles.authorName}
            onClick={(e) => e.stopPropagation()}
          >
            {tweet.author?.username}
          </Link>
          <span className={styles.handle}>@{tweet.author?.username}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{timeAgo}</span>
          {isOwner && (
            <button className={styles.deleteBtn} onClick={handleDelete} title="Delete">
              ✕
            </button>
          )}
        </div>

        <p className={styles.content}>{tweet.content}</p>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${tweet.is_liked ? styles.liked : ''}`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            <span className={styles.actionIcon}>
              {tweet.is_liked ? '♥' : '♡'}
            </span>
            <span>{tweet.likes_count ?? 0}</span>
          </button>

          <button className={styles.actionBtn} onClick={(e) => {
            e.stopPropagation()
            goToTweet()
          }}>
            <span className={styles.actionIcon}>◎</span>
            <span>Reply</span>
          </button>

          <button className={styles.actionBtn} onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(window.location.origin + `/${tweet.author?.username}/status/${tweet.id}`)
          }}>
            <span className={styles.actionIcon}>⎘</span>
            <span>Copy</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export { Avatar }
