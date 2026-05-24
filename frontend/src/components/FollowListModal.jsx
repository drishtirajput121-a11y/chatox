import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../api/client'
import { useAuthStore } from '../context/authStore'

function Avatar({ username, size = 44 }) {
    const palettes = [
        ['#E1F5EE', '#0F6E56'],
        ['#E6F1FB', '#185FA5'],
        ['#FAEEDA', '#854F0B'],
        ['#FBEAF0', '#993556'],
        ['#EEEDFE', '#3C3489'],
        ['#FAECE7', '#993C1D'],
    ]
    const [bg, text] = palettes[username.charCodeAt(0) % palettes.length]
    return (
        <div
            style={{ width: size, height: size, background: bg, color: text, fontSize: size * 0.38 }}
            className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
        >
            {username[0].toUpperCase()}
        </div>
    )
}

function UserRow({ user, onClose }) {
    const { user: me } = useAuthStore()
    const navigate = useNavigate()
    const [following, setFollowing] = useState(user.is_following)
    const [loading, setLoading] = useState(false)
    const [hovering, setHovering] = useState(false)

    const isMe = me?.username === user.username

    const handleFollow = async (e) => {
        e.stopPropagation()
        if (loading) return
        setLoading(true)
        try {
            setFollowing((f) => !f)
            await usersAPI.toggleFollow(user.username)
        } catch {
            setFollowing((f) => !f) // revert
        } finally {
            setLoading(false)
        }
    }

    const goToProfile = () => {
        onClose()
        navigate(`/${user.username}`)
    }

    const displayName = user.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : user.username

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={goToProfile}
        >
            <Avatar username={user.username} />

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">@{user.username}</p>
            </div>

            {!isMe && (
                <button
                    onClick={handleFollow}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    disabled={loading}
                    className={`
            text-xs font-semibold px-4 py-1.5 rounded-full border transition-all flex-shrink-0
            ${following
                            ? hovering
                                ? 'border-red-300 text-red-500 bg-red-50'
                                : 'border-gray-300 text-gray-700 bg-white'
                            : 'border-transparent bg-gray-900 text-white hover:bg-gray-700'
                        }
            disabled:opacity-50
          `}
                >
                    {following ? (hovering ? 'Unfollow' : 'Following') : 'Follow'}
                </button>
            )}
        </div>
    )
}

export default function FollowListModal({ username, type, onClose }) {
    // type = 'followers' | 'following'
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const fn = type === 'followers' ? usersAPI.getFollowers : usersAPI.getFollowing
            const { data } = await fn(username)
            setUsers(Array.isArray(data) ? data : data.results ?? [])
        } catch {
            setError('Could not load list.')
        } finally {
            setLoading(false)
        }
    }, [username, type])

    useEffect(() => {
        load()
    }, [load])

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const title = type === 'followers' ? 'Followers' : 'Following'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                    <h2 className="font-semibold text-base text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-10 text-sm text-red-400">
                            <p>{error}</p>
                            <button
                                onClick={load}
                                className="mt-2 text-xs underline text-gray-400 hover:text-gray-600"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && users.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-3xl mb-2">{type === 'followers' ? '👥' : '🔍'}</p>
                            <p className="text-sm">
                                {type === 'followers'
                                    ? 'No followers yet.'
                                    : 'Not following anyone yet.'}
                            </p>
                        </div>
                    )}

                    {!loading && users.map((user) => (
                        <UserRow key={user.username} user={user} onClose={onClose} />
                    ))}
                </div>
            </div>
        </div>
    )
}