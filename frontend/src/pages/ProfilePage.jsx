import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usersAPI, tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard from '../components/TweetCard'
import { Avatar } from '../components/TweetCard'
import styles from './Page.module.css'
import { HiArrowLeft } from 'react-icons/hi2'

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

  const isMe = me?.username === username

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    
    Promise.all([
      usersAPI.getProfile(username),
      tweetsAPI.list(username),
    ])
      .then(([profileRes, tweetsRes]) => {
        if (cancelled) return
        setProfile(profileRes.data)
        setTweets(Array.isArray(tweetsRes.data) ? tweetsRes.data : tweetsRes.data.results ?? [])
      })
      .catch(() => { 
        if (!cancelled) setError('User not found') 
      })
      .finally(() => { 
        if (!cancelled) setLoading(false) 
      })

    return () => { 
      cancelled = true 
    }
  }, [username])

  const handleFollow = async () => {
    if (!profile || followLoading) return
    
    const wasFollowing = profile.is_following
    
    // 1. Optimistically update local profile state (followers count + button state)
    setProfile((p) => ({
      ...p,
      is_following: !wasFollowing,
      followers_count: (p.followers_count || 0) + (wasFollowing ? -1 : 1),
    }))

    // 2. Optimistically update logged-in user following count in auth store
    if (me) {
      updateUser({
        following_count: (me.following_count || 0) + (wasFollowing ? -1 : 1)
      })
    }

    setFollowLoading(true)
    try {
      await usersAPI.toggleFollow(username)
    } catch {
      // Revert if API fails
      setProfile((p) => ({
        ...p,
        is_following: wasFollowing,
        followers_count: (p.followers_count || 0) + (wasFollowing ? 1 : -1),
      }))
      if (me) {
        updateUser({
          following_count: (me.following_count || 0) + (wasFollowing ? 1 : -1)
        })
      }
    } finally { 
      setFollowLoading(false) 
    }
  }

  const handleDelete = (id) => setTweets((t) => t.filter((x) => x.id !== id))
  
  const handleLikeToggle = (id, data) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_liked: data.is_liked, likes_count: data.likes_count } : t
      )
    )
  }

  if (loading) return <div className={styles.center}><div className="spinner" /></div>
  if (error) return <div className={styles.empty}><p>{error}</p></div>

  return (
    <div className={styles.page}>
      <header className={styles.profileHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/')} title="Back">
          <HiArrowLeft />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>
            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : profile?.username}
          </h1>
          <p className={styles.tweetCountMeta}>{tweets.length} posts</p>
        </div>
      </header>

      {/* Banner */}
      <div className={styles.profileBanner} />

      <div className={styles.profileMeta}>
        <div className={styles.profileAvatarRow}>
          <div className={styles.profileAvatar}>
            <Avatar username={username} size={110} />
          </div>
          {!isMe && (
            <button
              className={profile?.is_following ? styles.followingBtn : styles.followBtn}
              onClick={handleFollow}
              onMouseEnter={() => setHoveringFollow(true)}
              onMouseLeave={() => setHoveringFollow(false)}
            >
              {profile?.is_following 
                ? (hoveringFollow ? 'Unfollow' : 'Following') 
                : 'Follow'}
            </button>
          )}
        </div>

        <h2 className={styles.profileName}>
          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : profile?.username}
        </h2>
        <p className={styles.profileHandle}>@{profile?.username}</p>

        {profile?.bio ? (
          <p className={styles.profileBio}>{profile.bio}</p>
        ) : (
          <p className={styles.profileBioPlaceholder}>No bio description added.</p>
        )}

        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statCount}>{profile?.following_count ?? 0}</span>
            <span className={styles.statLabel}>Following</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statCount}>{profile?.followers_count ?? 0}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
        </div>
      </div>

      <div className={styles.profileTabs}>
        <div className={`${styles.profileTab} ${styles.activeProfileTab}`}>
          Posts
          <span className={styles.tabIndicator} />
        </div>
      </div>

      {tweets.length === 0 ? (
        <div className={styles.empty}>
          <p>No posts yet.</p>
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
    </div>
  )
}
