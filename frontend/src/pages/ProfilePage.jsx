import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usersAPI, tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard from '../components/TweetCard'
import { Avatar } from '../components/TweetCard'
import FollowListModal from '../components/FollowListModal'
import { HiArrowLeft, HiCamera, HiTrash, HiPencil } from 'react-icons/hi2'
import PageLogo from '../components/PageLogo'

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
      setProfile(p => ({ ...p, avatar: data.avatar }))
    } catch { setAvatarPreview(null) }
    finally { setUploadingAvatar(false); e.target.value = '' }
  }

  const handleAvatarRemove = async (e) => {
    e.stopPropagation()
    if (removingAvatar) return
    setRemovingAvatar(true)
    try {
      const form = new FormData()
      form.append('avatar', '')
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setProfile(p => ({ ...p, avatar: null }))
      setAvatarPreview(null)
      setAvatarRemoved(true)
    } catch { }
    finally { setRemovingAvatar(false) }
  }

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
      setProfile(p => ({ ...p, banner: data.banner }))
    } catch { setBannerPreview(null) }
    finally { setUploadingBanner(false); e.target.value = '' }
  }

  const handleBannerRemove = async (e) => {
    e.stopPropagation()
    if (removingBanner) return
    setRemovingBanner(true)
    try {
      const form = new FormData()
      form.append('banner', '')
      const { data } = await usersAPI.updateMe(form)
      updateUser(data)
      setProfile(p => ({ ...p, banner: null }))
      setBannerPreview(null)
      setBannerRemoved(true)
    } catch { }
    finally { setRemovingBanner(false) }
  }

  const handleFollow = async () => {
    if (!profile || followLoading) return
    const wasFollowing = profile.is_following
    setProfile(p => ({
      ...p,
      is_following: !wasFollowing,
      followers_count: (p.followers_count || 0) + (wasFollowing ? -1 : 1),
    }))
    if (me) updateUser({ following_count: (me.following_count || 0) + (wasFollowing ? -1 : 1) })
    setFollowLoading(true)
    try {
      await usersAPI.toggleFollow(username)
    } catch {
      setProfile(p => ({
        ...p,
        is_following: wasFollowing,
        followers_count: (p.followers_count || 0) + (wasFollowing ? 1 : -1),
      }))
      if (me) updateUser({ following_count: (me.following_count || 0) + (wasFollowing ? 1 : -1) })
    } finally { setFollowLoading(false) }
  }

  const handleDelete = (id) => setTweets(t => t.filter(x => x.id !== id))
  const handleLikeToggle = (id, data) => {
    setTweets(prev => prev.map(t =>
      t.id === id ? { ...t, is_liked: data.is_liked, likes_count: data.likes_count } : t
    ))
  }

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        User not found
      </p>
      <p className="text-sm text-gray-500">
        This account doesn't exist or may have been deleted.
      </p>
    </div>
  )

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : profile?.username

  const avatarSrc = avatarRemoved ? null : (avatarPreview || profile?.avatar || null)
  const bannerSrc = bannerRemoved ? null : (bannerPreview || profile?.banner || null)
  const hasAvatar = !!avatarSrc
  const hasBanner = !!bannerSrc

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black pb-16 md:pb-0">

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between
  px-4 py-3.5 border-b border-gray-200 dark:border-gray-800
  bg-white/95 dark:bg-black/95 backdrop-blur-md">

        {/* Left side — back button + name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full
        text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-xl"
          >
            <HiArrowLeft />
          </button>
          <div>
            <h1 className="font-bold text-sm md:text-base text-gray-900 dark:text-white leading-tight">
              {displayName}
            </h1>
            <p className="text-xs text-gray-400">{tweets.length} posts</p>
          </div>
        </div>

        {/* Right side — logo */}
        <PageLogo />

      </header>

      {/* Banner */}
      <div className="relative h-20 md:h-28 group">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br
            from-blue-100 via-teal-100 to-purple-100
            dark:from-blue-900/30 dark:via-teal-900/30 dark:to-purple-900/30" />
        )}
        {isMe && (
          <>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35
              transition-all pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center gap-4
              opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-white drop-shadow-md"
              >
                {uploadingBanner
                  ? <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><HiCamera className="text-2xl" /><span className="text-[11px] font-semibold">Change</span></>
                }
              </button>
              {hasBanner && (
                <button onClick={handleBannerRemove}
                  className="flex flex-col items-center gap-1 text-white drop-shadow-md">
                  {removingBanner
                    ? <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><HiTrash className="text-2xl" /><span className="text-[11px] font-semibold">Remove</span></>
                  }
                </button>
              )}
            </div>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </>
        )}
      </div>

      {/* Profile meta */}
      <div className="px-3 md:px-4 pb-4 border-b border-gray-200 dark:border-gray-800">

        {/* Avatar row */}
        <div className="flex items-end justify-between mt-2 mb-3">

          {/* Avatar — smaller on mobile */}
          <div className="relative group/av w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
            <div className="ring-4 ring-white dark:ring-black rounded-full overflow-hidden w-16 h-16 md:w-20 md:h-20">
              {avatarSrc
                ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                : <Avatar username={username} src={avatarSrc} size={80} />
              }
            </div>
            {isMe && (
              <>
                <div className="absolute inset-0 rounded-full bg-black/0
                  group-hover/av:bg-black/40 transition-all pointer-events-none" />
                <div className="absolute inset-0 rounded-full flex items-center
                  justify-center gap-2 opacity-0 group-hover/av:opacity-100 transition-opacity">
                  <button onClick={() => avatarInputRef.current?.click()} className="text-white drop-shadow">
                    {uploadingAvatar
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <HiCamera className="text-lg" />
                    }
                  </button>
                  {hasAvatar && (
                    <button onClick={handleAvatarRemove} className="text-white drop-shadow">
                      {removingAvatar
                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <HiTrash className="text-lg" />
                      }
                    </button>
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm self-end mb-1 font-semibold
                border transition-all disabled:opacity-50
                ${profile?.is_following
                  ? hoveringFollow
                    ? 'border-red-300 text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white bg-white dark:bg-transparent'
                  : 'border-transparent bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                }`}
            >
              {profile?.is_following ? (hoveringFollow ? 'Unfollow' : 'Following') : 'Follow'}
            </button>
          )}
        </div>

        {/* Name + handle */}
        <h2 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white leading-tight">
          {displayName}
        </h2>
        <p className="text-sm text-gray-400 mb-2">@{profile?.username}</p>

        {/* Bio */}
        {profile?.bio
          ? <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{profile.bio}</p>
          : <p className="text-sm text-gray-400 italic mb-3">No bio description added.</p>
        }

        {/* Stats */}
        <div className="flex gap-4 md:gap-5">
          <button onClick={() => setModal('following')} className="flex items-center gap-1 group hover:underline">
            <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
              {profile?.following_count ?? 0}
            </span>
            <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Following</span>
          </button>
          <button onClick={() => setModal('followers')} className="flex items-center gap-1 group hover:underline">
            <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
              {profile?.followers_count ?? 0}
            </span>
            <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Followers</span>
          </button>
        </div>
      </div>

      {/* Posts tab */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <div className="flex-1 text-center py-3 text-sm font-bold
          text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white">
          Posts
        </div>
      </div>

      {/* Tweets */}
      {tweets.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center gap-2">
          <p className="text-3xl"><HiPencil /></p>
          <p className="text-sm text-gray-400">No posts yet.</p>
        </div>
      ) : (
        tweets.map(tweet => (
          <TweetCard key={tweet.id} tweet={tweet} onDelete={handleDelete} onLikeToggle={handleLikeToggle} />
        ))
      )}

      {modal && (
        <FollowListModal username={username} type={modal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}