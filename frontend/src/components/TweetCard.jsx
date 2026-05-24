import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { formatDistanceToNow } from 'date-fns'
import styles from './TweetCard.module.css'

import {
  HiHeart,
  HiOutlineHeart,
  HiChatBubbleLeft,
  HiLink,
  HiTrash,
  HiShare
} from 'react-icons/hi2'

function Avatar({ username, size = 40 }) {
  const colors = [
    'var(--accent-light)',
    'rgba(0, 186, 124, 0.1)',
    'rgba(249, 24, 128, 0.1)',
    'rgba(144, 99, 246, 0.1)'
  ]

  const textColors = [
    'var(--accent)',
    'var(--green)',
    'var(--red)',
    '#9063f6'
  ]

  const idx = username
    ? username.charCodeAt(0) % colors.length
    : 0

  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        background: colors[idx],
        color: textColors[idx],
        fontSize: size * 0.38,
        fontWeight: '700',
      }}
    >
      {username ? username[0].toUpperCase() : '?'}
    </div>
  )
}

export default function TweetCard({
  tweet,
  onDelete,
  onLikeToggle
}) {

  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [likeLoading, setLikeLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOwner =
    user?.username === tweet.author?.username

  const timeAgo = tweet.created_at
    ? formatDistanceToNow(
      new Date(tweet.created_at),
      { addSuffix: true }
    )
    : ''

  const handleLike = async (e) => {
    e.stopPropagation()

    if (likeLoading) return

    setLikeLoading(true)

    try {
      const { data } =
        await tweetsAPI.toggleLike(tweet.id)

      onLikeToggle?.(tweet.id, data)

    } catch { }

    finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()

    if (!window.confirm('Delete this Chatox?'))
      return

    try {
      await tweetsAPI.delete(tweet.id)
      onDelete?.(tweet.id)

    } catch { }
  }

  const goToTweet = (focusReply = false) => {
    navigate(
      `/${tweet.author?.username}/status/${tweet.id}`,
      {
        state: { focusReply }
      }
    )
  }

  const handleCopyLink = (e) => {
    e.stopPropagation()

    const url =
      `${window.location.origin}/` +
      `${tweet.author?.username}/status/${tweet.id}`

    navigator.clipboard.writeText(url)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <article
      className={`${styles.card} fade-up`}
      onClick={() => goToTweet(false)}
    >

      <Link
        to={`/${tweet.author?.username}`}
        onClick={(e) => e.stopPropagation()}
        className={styles.avatarWrapper}
      >
        <Avatar
          username={tweet.author?.username || '?'}
        />
      </Link>

      <div className={styles.body}>

        <div className={styles.header}>

          <div className={styles.authorMeta}>
            <Link
              to={`/${tweet.author?.username}`}
              className={styles.authorName}
              onClick={(e) => e.stopPropagation()}
            >
              {tweet.author?.first_name ||
                tweet.author?.username}
            </Link>

            <span className={styles.handle}>
              @{tweet.author?.username}
            </span>

            <span className={styles.dot}>·</span>

            <span
              className={styles.time}
              title={tweet.created_at}
            >
              {timeAgo}
            </span>
          </div>

          {isOwner && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              title="Delete"
            >
              <HiTrash />
            </button>
          )}
        </div>

        <p className={styles.content}>
          {tweet.content}
        </p>

        {/* MULTIPLE IMAGES */}
        {tweet.images?.length > 0 && (
          <div
            className={`
              ${styles.imagesGrid}

              ${tweet.images.length === 1
                ? styles.singleImage
                : styles.multiImage
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >

            {tweet.images.map((img) => (
              <img
                key={img.id}
                src={img.image}
                alt="tweet media"
                className={styles.tweetImage}
              />
            ))}

          </div>
        )}

        <div className={styles.actions}>

          {/* Reply */}
          <button
            className={`
              ${styles.actionBtn}
              ${styles.replyBtn}
            `}
            onClick={(e) => {
              e.stopPropagation()
              goToTweet(true)
            }}
          >
            <span className={styles.actionIcon}>
              <HiChatBubbleLeft />
            </span>

            <span className={styles.actionLabel}>
              Reply
            </span>
          </button>

          {/* Like */}
          <button
            className={`
              ${styles.actionBtn}
              ${styles.likeBtn}
              ${tweet.is_liked
                ? styles.liked
                : ''
              }
            `}
            onClick={handleLike}
            disabled={likeLoading}
          >
            <span className={styles.actionIcon}>
              {tweet.is_liked
                ? <HiHeart />
                : <HiOutlineHeart />
              }
            </span>

            <span className={styles.actionLabel}>
              {tweet.likes_count ?? 0}
            </span>
          </button>

          {/* Copy Link */}
          <button
            className={`
              ${styles.actionBtn}
              ${styles.copyBtn}
            `}
            onClick={handleCopyLink}
            title="Copy link to Chato"
          >
            <span className={styles.actionIcon}>
              <HiLink />
            </span>

            <span className={styles.actionLabel}>
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>

          {/* Share */}
          <button
            className={`
              ${styles.actionBtn}
              ${styles.shareBtn}
            `}
            onClick={(e) => {
              e.stopPropagation()

              if (navigator.share) {
                navigator.share({
                  title: 'Chatox Post',
                  text: tweet.content,
                  url:
                    `${window.location.origin}/` +
                    `${tweet.author?.username}/status/${tweet.id}`
                }).catch(() => { })
              }
            }}
            title="Share"
          >
            <span className={styles.actionIcon}>
              <HiShare />
            </span>
          </button>

        </div>
      </div>
    </article>
  )
}

export { Avatar }