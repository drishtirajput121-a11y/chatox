import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usersAPI, tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard from '../components/TweetCard'
import { Avatar } from '../components/TweetCard'
import FollowListModal from '../components/FollowListModal'
import { HiArrowLeft, HiCamera, HiTrash } from 'react-icons/hi2'
import styles from './Page.module.css'

export default function ProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: me, updateUser } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [hoveringFollow, setHoveringFollow] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [removingAvatar, setRemovingAvatar] = useState(false)
  const [removingBanner, setRemovingBanner] = useState(false)

  // track if user explicitly removed (so we don't fall back to profile url)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [bannerRemoved, setBannerRemoved] = useState(false)

  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const isMe = me?.username === username

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setAvatarPreview(null)
    setBannerPreview(null)
    setAvatarRemoved(false)
    setBannerRemoved(false)

    Promise.all([
      usersAPI.getProfile(username),
      tweetsAPI.list(username),
    ])
      .then(([profileRes, tweetsRes]) => {
        if (cancelled) return
        setProfile(profileRes.data)
        setTweets(Array.isArray(tweetsRes.data) ? tweetsRes.data : tweetsRes.data.results ?? [])
      })
      .catch(() => { if (!cancelled) setError('User not found') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [username])

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setAvatarPreview(ev.target.result); setAvatarRemoved(false) }
    reader.readAsDataURL(file)
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setProfile((p) => ({ ...p, avatar: data.avatar }))
    } catch {
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  /* ── Avatar remove ── */
  const handleAvatarRemove = async (e) => {
    e.stopPropagation()
    if (removingAvatar) return
    setRemovingAvatar(true)
    try {
      const form = new FormData()
      form.append('avatar', '')          // send empty string to clear
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setProfile((p) => ({ ...p, avatar: null }))
      setAvatarPreview(null)
      setAvatarRemoved(true)
    } catch { }
    finally { setRemovingAvatar(false) }
  }

  /* ── Banner upload ── */
  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setBannerPreview(ev.target.result); setBannerRemoved(false) }
    reader.readAsDataURL(file)
    setUploadingBanner(true)
    try {
      const form = new FormData()
      form.append('banner', file)
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setProfile((p) => ({ ...p, banner: data.banner }))
    } catch {
      setBannerPreview(null)
    } finally {
      setUploadingBanner(false)
      e.target.value = ''
    }
  }

  /* ── Banner remove ── */
  const handleBannerRemove = async (e) => {
    e.stopPropagation()
    if (removingBanner) return
    setRemovingBanner(true)
    try {
      const form = new FormData()
      form.append('banner', '')
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setProfile((p) => ({ ...p, banner: null }))
      setBannerPreview(null)
      setBannerRemoved(true)
    } catch { }
    finally { setRemovingBanner(false) }
  }

  /* ── Follow ── */
  const handleFollow = async () => {
    if (!profile || followLoading) return
    const wasFollowing = profile.is_following
    setProfile((p) => ({
      ...p,
      is_following: !wasFollowing,
      followers_count: (p.followers_count || 0) + (wasFollowing ? -1 : 1),
    }))
    if (me) updateUser({ following_count: (me.following_count || 0) + (wasFollowing ? -1 : 1) })
    setFollowLoading(true)
    try {
      await usersAPI.toggleFollow(username)
    } catch {
      setProfile((p) => ({
        ...p,
        is_following: wasFollowing,
        followers_count: (p.followers_count || 0) + (wasFollowing ? 1 : -1),
      }))
      if (me) updateUser({ following_count: (me.following_count || 0) + (wasFollowing ? 1 : -1) })
    } finally { setFollowLoading(false) }
  }

  const handleDelete = (id) => setTweets((t) => t.filter((x) => x.id !== id))
  const handleLikeToggle = (id, data) => {
    setTweets((prev) =>
      prev.map((t) => t.id === id ? { ...t, is_liked: data.is_liked, likes_count: data.likes_count } : t)
    )
  }

  if (loading) return <div className={styles.center}><div className="spinner" /></div>
  if (error) return <div className={styles.empty}><p>{error}</p></div>

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : profile?.username

  const avatarSrc = avatarRemoved ? null : (avatarPreview || profile?.avatar || null)
  const bannerSrc = bannerRemoved ? null : (bannerPreview || profile?.banner || null)
  const hasAvatar = !!avatarSrc
  const hasBanner = !!bannerSrc

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <HiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="font-bold text-base text-gray-900 leading-tight">{displayName}</h1>
          <p className="text-xs text-gray-400">{tweets.length} posts</p>
        </div>
      </header>

      {/* ── Banner ── */}
      <div className="relative h-36 group">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100" />
        )}

        {isMe && (
          <>
            {/* dark overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all pointer-events-none rounded-none" />

            {/* action buttons — centered */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Change banner */}
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-white drop-shadow-md"
                title="Change banner"
              >
                {uploadingBanner ? (
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <HiCamera className="text-2xl" />
                    <span className="text-[11px] font-semibold">Change</span>
                  </>
                )}
              </button>

              {/* Remove banner — only shown if banner exists */}
              {hasBanner && (
                <button
                  onClick={handleBannerRemove}
                  className="flex flex-col items-center gap-1 text-white drop-shadow-md"
                  title="Remove banner"
                >
                  {removingBanner ? (
                    <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <HiTrash className="text-2xl" />
                      <span className="text-[11px] font-semibold">Remove</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </>
        )}
      </div>

      {/* Profile meta */}
      <div className="px-4 pb-4 border-b border-gray-100">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-11 mb-3">

          {/* ── Avatar ── */}
          <div className="relative group/av w-20 h-20 flex-shrink-0">
            <div className="ring-4 ring-white rounded-full overflow-hidden w-20 h-20">
              {avatarSrc ? (
                <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
              ) : (
                <Avatar username={username} size={80} />
              )}
            </div>

            {isMe && (
              <>
                {/* dark overlay */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover/av:bg-black/40 transition-all pointer-events-none" />

                {/* action buttons */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover/av:opacity-100 transition-opacity">
                  {/* Change avatar */}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-white drop-shadow"
                    title="Change photo"
                  >
                    {uploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiCamera className="text-lg" />
                    )}
                  </button>

                  {/* Remove avatar — only if image exists */}
                  {hasAvatar && (
                    <button
                      onClick={handleAvatarRemove}
                      className="text-white drop-shadow"
                      title="Remove photo"
                    >
                      {removingAvatar ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <HiTrash className="text-lg" />
                      )}
                    </button>
                  )}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {/* Follow button */}
          {!isMe && (
            <button
              onClick={handleFollow}
              onMouseEnter={() => setHoveringFollow(true)}
              onMouseLeave={() => setHoveringFollow(false)}
              disabled={followLoading}
              className={`
                px-5 py-2 rounded-full text-sm font-semibold border transition-all disabled:opacity-50
                ${profile?.is_following
                  ? hoveringFollow
                    ? 'border-red-300 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-800 bg-white'
                  : 'border-transparent bg-gray-900 text-white hover:bg-gray-700'
                }
              `}
            >
              {profile?.is_following ? (hoveringFollow ? 'Unfollow' : 'Following') : 'Follow'}
            </button>
          )}
        </div>

        {/* Name + handle */}
        <h2 className="font-bold text-xl text-gray-900 leading-tight">{displayName}</h2>
        <p className="text-sm text-gray-400 mb-2">@{profile?.username}</p>

        {/* Bio */}
        {profile?.bio
          ? <p className="text-sm text-gray-700 leading-relaxed mb-3">{profile.bio}</p>
          : <p className="text-sm text-gray-400 italic mb-3">No bio description added.</p>
        }

        {/* Stats */}
        <div className="flex gap-5">
          <button
            onClick={() => setModal('following')}
            className="flex items-center gap-1 group hover:underline focus:outline-none"
          >
            <span className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
              {profile?.following_count ?? 0}
            </span>
            <span className="text-sm text-gray-400 group-hover:text-emerald-500 transition-colors">Following</span>
          </button>
          <button
            onClick={() => setModal('followers')}
            className="flex items-center gap-1 group hover:underline focus:outline-none"
          >
            <span className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
              {profile?.followers_count ?? 0}
            </span>
            <span className="text-sm text-gray-400 group-hover:text-emerald-500 transition-colors">Followers</span>
          </button>
        </div>
      </div>

      {/* Posts tab */}
      <div className="flex border-b border-gray-100">
        <div className="flex-1 text-center py-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900">
          Posts
        </div>
      </div>

      {/* Tweets */}
      {tweets.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-3xl mb-2">✏️</p>
          <p className="text-sm">No posts yet.</p>
        </div>
      ) : (
        tweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            onDelete={handleDelete}
            onLikeToggle={handleLikeToggle}
          />
        ))
      )}

      {/* Follow list modal */}
      {modal && (
        <FollowListModal
          username={username}
          type={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}