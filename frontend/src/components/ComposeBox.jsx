import { useState } from 'react'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { Avatar } from './TweetCard'
import styles from './ComposeBox.module.css'

import {
  HiPhoto,
  HiListBullet,
  HiFaceSmile,
  HiCalendarDays,
  HiMapPin
} from 'react-icons/hi2'

import { MdOutlineGifBox } from 'react-icons/md'

import useMediaUpload from '../hooks/useMediaUpload'
import MediaPreviews from './MediaPreviews'

const MAX_CHARS = 280

export default function ComposeBox({ onPost }) {
  const { user } = useAuthStore()

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    previews,
    error: mediaError,
    fileInputRef,
    openPicker,
    handleFiles,
    removeImage,
    clear
  } = useMediaUpload()

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0

  const handleSubmit = async () => {
    if ((isEmpty && !previews.length) || isOverLimit || loading) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()

      formData.append('content', content.trim())

      // attach selected images
      previews.forEach((preview) => {
        formData.append('images', preview.file)
      })

      const { data } = await tweetsAPI.create(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setContent('')
      clear()

      onPost?.(data)

    } catch (e) {
      setError(
        e.response?.data?.detail ||
        'Something went wrong'
      )

    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  if (!user) return null

  return (
    <div className={styles.box}>
      <Avatar username={user.username} />

      <div className={styles.right}>
        <textarea
          className={styles.textarea}
          placeholder="What's happening?!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          maxLength={MAX_CHARS + 50}
        />

        {/* image previews */}
        <MediaPreviews
          previews={previews}
          onRemove={removeImage}
        />

        {/* errors */}
        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        {mediaError && (
          <p className={styles.error}>
            {mediaError}
          </p>
        )}

        <div className={styles.footer}>
          <div className={styles.actionIcons}>

            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            <button
              className={styles.iconBtn}
              title="Media"
              type="button"
              onClick={openPicker}
              disabled={previews.length >= 4}
            >
              <HiPhoto />
            </button>

            <button
              className={styles.iconBtn}
              title="GIF"
              type="button"
            >
              <MdOutlineGifBox style={{ fontSize: '1.25rem' }} />
            </button>

            <button
              className={styles.iconBtn}
              title="Poll"
              type="button"
            >
              <HiListBullet />
            </button>

            <button
              className={styles.iconBtn}
              title="Emoji"
              type="button"
            >
              <HiFaceSmile />
            </button>

            <button
              className={styles.iconBtn}
              title="Schedule"
              type="button"
            >
              <HiCalendarDays />
            </button>

            <button
              className={styles.iconBtn}
              title="Location"
              type="button"
            >
              <HiMapPin />
            </button>
          </div>

          <div className={styles.submitSection}>
            {content.length > 0 && (
              <span
                className={`
                  ${styles.counter}
                  ${remaining < 20 ? styles.warn : ''}
                  ${isOverLimit ? styles.over : ''}
                `}
              >
                {remaining}
              </span>
            )}

            <button
              className={styles.postBtn}
              onClick={handleSubmit}
              disabled={
                (isEmpty && !previews.length) ||
                isOverLimit ||
                loading
              }
            >
              {loading ? (
                <span
                  className="spinner"
                  style={{
                    width: 14,
                    height: 14,
                    borderTopColor: '#fff',
                    margin: '0 auto'
                  }}
                />
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}