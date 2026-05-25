import { useState } from 'react'
import { tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import PollComposer from './PollComposer'
import SchedulePicker from './SchedulePicker'
import LocationPicker from './LocationPicker'
import {
  HiPhoto, HiListBullet, HiCalendarDays, HiMapPin,
  HiSparkles, HiXMark, HiArrowPath
} from 'react-icons/hi2'
import useMediaUpload from '../hooks/useMediaUpload'
import MediaPreviews from './MediaPreviews'
import Avatar from './Avatar'

const MAX_CHARS = 280

export default function ComposeBox({ onPost }) {
  const { user } = useAuthStore()

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [poll, setPoll] = useState(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [location, setLocation] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [showLocation, setShowLocation] = useState(false)

  // AI caption state
  const [showAI, setShowAI] = useState(false)
  const [hint, setHint] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const {
    previews, error: mediaError, fileInputRef,
    openPicker, handleFiles, removeImage, clear
  } = useMediaUpload()

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0

  const openPoll = () => {
    setPoll({ options: ['', ''], duration_hours: 24 })
    clear()
  }

  /* ── AI caption generator ── */
  const handleGenerateCaption = async () => {
    if (!hint.trim() || aiLoading) return
    setAiLoading(true)
    setAiError('')
    try {
      const { data } = await tweetsAPI.generateCaption(hint)
      setContent(data.caption)
      setShowAI(false)
      setHint('')
    } catch (e) {
      setAiError(
        e.response?.data?.error || 'Failed to generate. Try again.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIKey = (e) => {
    if (e.key === 'Enter') handleGenerateCaption()
    if (e.key === 'Escape') { setShowAI(false); setHint(''); setAiError('') }
  }

  /* ── Post submit ── */
  const handleSubmit = async () => {
    if ((isEmpty && !previews.length && !poll) || isOverLimit || loading) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      previews.forEach(p => formData.append('images', p.file))

      if (poll) {
        const validOptions = poll.options.filter(o => o.trim())
        if (validOptions.length >= 2) {
          formData.append('poll', JSON.stringify({
            options: validOptions,
            duration_hours: poll.duration_hours,
          }))
        }
      }

      if (scheduledAt) formData.append('scheduled_at', new Date(scheduledAt).toISOString())
      if (location) formData.append('location', location)

      const { data } = await tweetsAPI.create(formData)

      setContent('')
      clear()
      setPoll(null)
      setScheduledAt('')
      setLocation('')
      setShowSchedule(false)
      setShowLocation(false)
      onPost?.(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  if (!user) return null

  return (
    <div className="flex gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">

      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        <Avatar username={user.username} src={user.avatar} />
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Textarea */}
        <textarea
          className="w-full bg-transparent border-none outline-none resize-none
            text-xl leading-relaxed text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-600 pt-1"
          placeholder="What's happening?!"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          maxLength={MAX_CHARS + 50}
        />

        {/* ── AI Caption Box ── */}
        {showAI && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800
            bg-blue-50 dark:bg-blue-950/40 p-3 flex flex-col gap-2">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <HiSparkles className="text-base" />
                <span className="text-xs font-semibold">AI Caption Generator</span>
              </div>
              <button
                onClick={() => { setShowAI(false); setHint(''); setAiError('') }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <HiXMark className="text-base" />
              </button>
            </div>

            {/* Input row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                onKeyDown={handleAIKey}
                placeholder="Give a hint… e.g. 'morning coffee vibes'"
                autoFocus
                className="flex-1 bg-white dark:bg-black border border-blue-200
                  dark:border-blue-700 rounded-full px-4 py-2 text-sm outline-none
                  text-gray-900 dark:text-white placeholder-gray-400
                  focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleGenerateCaption}
                disabled={!hint.trim() || aiLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500
                  hover:bg-blue-600 text-white text-sm font-semibold rounded-full
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  flex-shrink-0"
              >
                {aiLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" />
                ) : (
                  <>
                    <HiArrowPath className="text-base" />
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* AI error */}
            {aiError && (
              <p className="text-xs text-red-500">{aiError}</p>
            )}

            <p className="text-xs text-blue-400 dark:text-blue-600">
              Press Enter to generate · Esc to close
            </p>
          </div>
        )}

        {/* Image previews */}
        <MediaPreviews previews={previews} onRemove={removeImage} />

        {/* Poll */}
        {poll && (
          <PollComposer poll={poll} onChange={setPoll} onRemove={() => setPoll(null)} />
        )}

        {/* Schedule picker */}
        {showSchedule && (
          <SchedulePicker
            value={scheduledAt}
            onChange={setScheduledAt}
            onRemove={() => { setShowSchedule(false); setScheduledAt('') }}
          />
        )}

        {/* Location picker */}
        {showLocation && (
          <LocationPicker
            value={location}
            onChange={setLocation}
            onRemove={() => { setShowLocation(false); setLocation('') }}
          />
        )}

        {/* Errors */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {mediaError && <p className="text-sm text-red-500">{mediaError}</p>}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3
          border-t border-gray-200 dark:border-gray-800">

          {/* Action icons */}
          <div className="flex items-center gap-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            <button type="button" title="Media" onClick={openPicker}
              disabled={previews.length >= 4 || !!poll}
              className="w-9 h-9 flex items-center justify-center rounded-full
                text-blue-500 text-lg hover:bg-blue-50 dark:hover:bg-blue-500/10
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <HiPhoto />
            </button>

            <button type="button" title="Poll" onClick={openPoll}
              disabled={previews.length > 0}
              className="w-9 h-9 flex items-center justify-center rounded-full
                text-blue-500 text-lg hover:bg-blue-50 dark:hover:bg-blue-500/10
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <HiListBullet />
            </button>

            <button type="button" title="Schedule"
              onClick={() => { setShowSchedule(p => !p); if (showSchedule) setScheduledAt('') }}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-colors
                ${showSchedule
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}>
              <HiCalendarDays />
            </button>

            <button type="button" title="Location"
              onClick={() => { setShowLocation(p => !p); if (showLocation) setLocation('') }}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-colors
                ${showLocation
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}>
              <HiMapPin />
            </button>

            {/* ── AI Caption button ── */}
            <button type="button" title="Generate caption with AI"
              onClick={() => { setShowAI(p => !p); setAiError('') }}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-colors
                ${showAI
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}>
              <HiSparkles />
            </button>
          </div>

          {/* Counter + Post button */}
          <div className="flex items-center gap-4">
            {content.length > 0 && (
              <span className={`text-sm font-mono tabular-nums
                ${isOverLimit ? 'text-red-500 font-bold'
                  : remaining < 20 ? 'text-amber-500'
                    : 'text-gray-400'}`}>
                {remaining}
              </span>
            )}

            <button type="button" onClick={handleSubmit}
              disabled={(isEmpty && !previews.length && !poll) || isOverLimit || loading}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold
                rounded-full text-sm min-w-[76px] flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Post'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}