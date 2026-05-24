import { useState } from 'react'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import { Avatar } from './TweetCard'
import styles from './ComposeBox.module.css'
import PollComposer from './PollComposer'

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

  // poll state
  const [poll, setPoll] = useState(null)

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

  // open poll
  const openPoll = () => {
    setPoll({
      options: ['', ''],
      duration_hours: 24
    })

    // can't have poll + images together
    clear()
  }

  const handleSubmit = async () => {

    if (
      (isEmpty && !previews.length && !poll) ||
      isOverLimit ||
      loading
    ) return

    setLoading(true)
    setError('')

    try {

      const formData = new FormData()

      formData.append(
        'content',
        content.trim()
      )

      // attach images
      previews.forEach((preview) => {
        formData.append(
          'images',
          preview.file
        )
      })

      // attach poll
      if (poll) {

        const validOptions =
          poll.options.filter(
            (option) => option.trim()
          )

        if (validOptions.length >= 2) {

          formData.append(
            'poll',
            JSON.stringify({
              options: validOptions,
              duration_hours:
                poll.duration_hours,
            })
          )
        }
      }

      const { data } =
        await tweetsAPI.create(formData, {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        })

      setContent('')
      clear()
      setPoll(null)

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

    if (
      e.key === 'Enter' &&
      (e.metaKey || e.ctrlKey)
    ) {
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
          onChange={(e) =>
            setContent(e.target.value)
          }
          onKeyDown={handleKey}
          rows={3}
          maxLength={MAX_CHARS + 50}
        />

        {/* image previews */}
        <MediaPreviews
          previews={previews}
          onRemove={removeImage}
        />

        {/* poll composer */}
        {poll && (
          <PollComposer
            poll={poll}
            onChange={setPoll}
            onRemove={() => setPoll(null)}
          />
        )}

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
              accept="
                image/jpeg,
                image/png,
                image/gif,
                image/webp
              "
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            {/* media */}
            <button
              className={styles.iconBtn}
              title="Media"
              type="button"
              onClick={openPicker}
              disabled={
                previews.length >= 4 ||
                !!poll
              }
            >
              <HiPhoto />
            </button>

            {/* gif */}
            <button
              className={styles.iconBtn}
              title="GIF"
              type="button"
            >
              <MdOutlineGifBox
                style={{
                  fontSize: '1.25rem'
                }}
              />
            </button>

            {/* poll */}
            <button
              className={styles.iconBtn}
              title="Poll"
              type="button"
              onClick={openPoll}
              disabled={previews.length > 0}
            >
              <HiListBullet />
            </button>

            {/* emoji */}
            <button
              className={styles.iconBtn}
              title="Emoji"
              type="button"
            >
              <HiFaceSmile />
            </button>

            {/* schedule */}
            <button
              className={styles.iconBtn}
              title="Schedule"
              type="button"
            >
              <HiCalendarDays />
            </button>

            {/* location */}
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
                  ${remaining < 20
                    ? styles.warn
                    : ''
                  }
                  ${isOverLimit
                    ? styles.over
                    : ''
                  }
                `}
              >
                {remaining}
              </span>
            )}

            <button
              className={styles.postBtn}
              onClick={handleSubmit}
              disabled={
                (
                  isEmpty &&
                  !previews.length &&
                  !poll
                ) ||
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