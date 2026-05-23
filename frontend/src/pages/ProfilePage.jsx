import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usersAPI, tweetsAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'
import TweetCard from '../components/TweetCard'
import { Avatar } from '../components/TweetCard'
import styles from './Page.module.css'

export default function ProfilePage() {
  const { username } = useParams()
  const { user: me } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
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
      .catch(() => { if (!cancelled) setError('User not found') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [username])

  const handleFollow = async () => {
    if (!profile || followLoading) return
    
    const wasFollowing = profile.is_following
    
    // Optimistic update
    setProfile((p) => ({
      ...p,
      is_following: !wasFollowing,
      followers_count: (p.followers_count || 0) + (wasFollowing ? -1 : 1),
    }))

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
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{profile?.username}</h1>
          <p style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>{tweets.length} Chatos</p>
        </div>
      </header>

      {/* Banner */}
      <div className={styles.profileBanner} />

      <div className={styles.profileMeta}>
        <div className={styles.profileAvatarRow}>
          <div className={styles.profileAvatar}>
            <Avatar username={username} size={72} />
          </div>
          {!isMe && (
            <button
              className={profile?.is_following ? styles.followingBtn : styles.followBtn}
              onClick={handleFollow}
            >
              {profile?.is_following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <p className={styles.profileName}>
          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : profile?.username}
        </p>
        <p className={styles.profileHandle}>@{profile?.username}</p>

        {profile?.bio && <p className={styles.profileBio}>{profile.bio}</p>}

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

      {tweets.length === 0 ? (
        <div className={styles.empty}>
          <p>No Chatos yet.</p>
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
