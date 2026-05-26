import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { api } from '../api/client'
import { HiArrowLeft, HiPaperAirplane, HiMagnifyingGlass, HiXMark, HiChatBubbleLeftRight } from 'react-icons/hi2'
import { formatDistanceToNow } from 'date-fns'
import PageLogo from '../components/PageLogo'

/* ── Avatar ── */
function Avatar({ username, src, size = 40 }) {
    const palettes = [
        ['#E1F5EE', '#0F6E56'], ['#E6F1FB', '#185FA5'], ['#FAEEDA', '#854F0B'],
        ['#FBEAF0', '#993556'], ['#EEEDFE', '#3C3489'], ['#FAECE7', '#993C1D'],
    ]
    const [bg, text] = palettes[(username || '?').charCodeAt(0) % palettes.length]
    if (src) return (
        <img src={src} alt={username}
            className="rounded-full object-cover flex-shrink-0"
            style={{ width: size, height: size }} />
    )
    return (
        <div className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
            style={{ width: size, height: size, background: bg, color: text, fontSize: size * 0.38 }}>
            {(username || '?')[0].toUpperCase()}
        </div>
    )
}

/* ── Conversation list item ── */
function ConvoItem({ convo, active, onClick }) {
    const time = convo.last_message_time
        ? formatDistanceToNow(new Date(convo.last_message_time), { addSuffix: false })
        : ''
    const displayName = convo.first_name
        ? `${convo.first_name} ${convo.last_name || ''}`.trim()
        : convo.username

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                hover:bg-gray-100 dark:hover:bg-zinc-900
                ${active ? 'bg-blue-50 dark:bg-zinc-900 border-r-2 border-blue-500' : ''}`}
        >
            <div className="relative flex-shrink-0">
                <Avatar username={convo.username} src={convo.avatar} size={44} />
                {convo.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white
                        text-[10px] font-bold rounded-full flex items-center justify-center">
                        {convo.unread_count > 9 ? '9+' : convo.unread_count}
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                        {displayName}
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500 flex-shrink-0">
                        {time}
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">
                    {convo.last_message || 'No messages yet'}
                </p>
            </div>
        </button>
    )
}

/* ── Search result item ── */
function SearchResultItem({ user, onClick }) {
    const displayName = user.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : user.username
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                hover:bg-gray-100 dark:hover:bg-zinc-900
                border-b border-gray-100 dark:border-zinc-800 last:border-b-0"
        >
            <Avatar username={user.username} src={user.avatar} size={40} />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                    {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-500">@{user.username}</p>
            </div>
            <HiPaperAirplane className="w-4 h-4 text-gray-300 dark:text-zinc-600 flex-shrink-0" />
        </button>
    )
}

/* ── Message bubble ── */
function Bubble({ msg, isMe }) {
    const time = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ''
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed
                ${isMe
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-bl-sm'
                }`}>
                <p className="break-words">{msg.content}</p>
                <p className={`text-[10px] mt-0.5 text-right
                    ${isMe ? 'text-blue-100' : 'text-gray-400 dark:text-zinc-500'}`}>
                    {time}
                </p>
            </div>
        </div>
    )
}

/* ── Typing indicator ── */
function TypingIndicator() {
    return (
        <div className="flex justify-start mb-1">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3
                flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    )
}

/* ── Empty state ── */
function EmptyChat() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8
            text-gray-400 dark:text-zinc-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-900
                flex items-center justify-center text-2xl text-gray-400">
                <HiChatBubbleLeftRight />
            </div>
            <p className="font-semibold text-gray-600 dark:text-zinc-300">Your messages</p>
            <p className="text-sm text-center text-gray-500 dark:text-zinc-400">
                Select a conversation or search for someone to start chatting
            </p>
        </div>
    )
}

/* ══════════════════════════════════════════
   Main ChatPage
══════════════════════════════════════════ */
export default function ChatPage() {
    const { username: routeUsername } = useParams()
    const navigate = useNavigate()
    const { user: me } = useAuthStore()

    const [conversations, setConversations] = useState([])
    const [convosLoading, setConvosLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const searchDebounce = useRef(null)

    const [activeUser, setActiveUser] = useState(routeUsername || null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [wsStatus, setWsStatus] = useState('idle')
    const [isTyping, setIsTyping] = useState(false)

    const wsRef = useRef(null)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const searchRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    /* ── Load conversations ── */
    const loadConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/chat/conversations/')
            setConversations(Array.isArray(data) ? data : [])
        } catch { }
        finally { setConvosLoading(false) }
    }, [])

    useEffect(() => { loadConversations() }, [loadConversations])

    /* ── Search users ── */
    useEffect(() => {
        if (!search.trim()) { setSearchResults([]); return }
        clearTimeout(searchDebounce.current)
        setSearchLoading(true)
        searchDebounce.current = setTimeout(async () => {
            try {
                const { data } = await api.get('/chat/search-users/', { params: { q: search.trim() } })
                setSearchResults(data)
            } catch { setSearchResults([]) }
            finally { setSearchLoading(false) }
        }, 300)
    }, [search])

    const startChat = (username) => {
        setSearch('')
        setSearchResults([])
        setIsSearching(false)
        setActiveUser(username)
    }

    const clearSearch = () => {
        setSearch('')
        setSearchResults([])
        setIsSearching(false)
        searchRef.current?.blur()
    }

    /* ── Get fresh access token ── */
    // Uses the stored access token directly — no need to refresh before WS connect.
    // The Axios interceptor handles HTTP refresh automatically.
    // For WS we just use whatever is in localStorage — if it's expired,
    // the backend will reject the WS connection with 4001/4003,
    // and we handle that in onclose by redirecting to login.
    const getToken = useCallback(() => {
        return localStorage.getItem('access_token')
    }, [])

    /* ── Open WebSocket ── */
    const openSocket = useCallback((targetUser) => {
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        const token = getToken()
        if (!token) {
            navigate('/login')
            return
        }

        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const host = import.meta.env.VITE_WS_HOST || 'localhost:8000'
        const url = `${proto}://${host}/ws/chat/${targetUser}/?token=${token}`

        console.log('Connecting WS:', url)
        setWsStatus('connecting')

        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
            console.log('WS connected')
            setWsStatus('open')
            loadConversations()
        }

        ws.onclose = (e) => {
            console.warn('WS closed — code:', e.code, 'reason:', e.reason)
            setWsStatus('closed')
            // 4001 = auth failed (expired token) — redirect to login
            if (e.code === 4001 || e.code === 4003) {
                navigate('/login')
            }
        }

        ws.onerror = (e) => {
            console.error('WS error:', e)
            setWsStatus('error')
        }

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === 'history') {
                setMessages(data.messages)
            } else if (data.type === 'message') {
                setMessages(prev => [...prev, data.message])
                setIsTyping(false)
                loadConversations()
            } else if (data.type === 'typing') {
                setIsTyping(data.is_typing)
                if (data.is_typing) {
                    clearTimeout(typingTimeoutRef.current)
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
                }
            }
        }
    }, [getToken, loadConversations, navigate])

    /* ── Retry connection ── */
    const retryConnection = useCallback(() => {
        if (activeUser) openSocket(activeUser)
    }, [activeUser, openSocket])

    /* ── Open socket when activeUser changes ── */
    useEffect(() => {
        if (!activeUser || !me) return
        setMessages([])
        setIsTyping(false)
        openSocket(activeUser)

        return () => {
            wsRef.current?.close()
            wsRef.current = null
        }
    }, [activeUser, me])

    /* ── Scroll to bottom ── */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    /* ── Update URL ── */
    useEffect(() => {
        if (activeUser) navigate(`/chat/${activeUser}`, { replace: true })
        else navigate('/chat', { replace: true })
    }, [activeUser])

    /* ── Send message ── */
    const sendMessage = () => {
        const content = input.trim()
        if (!content || wsRef.current?.readyState !== WebSocket.OPEN) return
        wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }))
        wsRef.current.send(JSON.stringify({ content }))
        setInput('')
        inputRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    const handleInputChange = (e) => {
        setInput(e.target.value)
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'typing',
                is_typing: e.target.value.length > 0,
            }))
        }
    }

    const filteredConvos = conversations.filter(c => {
        const q = search.toLowerCase()
        return !q || c.username.toLowerCase().includes(q) || c.first_name?.toLowerCase().includes(q)
    })

    const activeConvo = conversations.find(c => c.username === activeUser)
    const activeDisplayName = activeConvo?.first_name
        ? `${activeConvo.first_name} ${activeConvo.last_name || ''}`.trim()
        : activeUser

    const showSearchResults = isSearching && search.trim().length > 0

    return (
        <div className="flex fixed inset-0 pb-14 md:pb-0 md:relative md:inset-auto
            md:h-full bg-white dark:bg-black">

            {/* ══ LEFT PANEL ══ */}
            <div className={`flex flex-col w-full md:w-72 lg:w-80 flex-shrink-0
                bg-white dark:bg-black
                border-r border-gray-100 dark:border-zinc-800
                ${activeUser ? 'hidden md:flex' : 'flex'}`}>

                <div className="flex items-center justify-between px-4 py-3.5
                    border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                    <h1 className="font-bold text-base text-gray-900 dark:text-zinc-100">Messages</h1>
                    <PageLogo />
                </div>

                <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                    <div className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all
                        bg-gray-100 dark:bg-zinc-900
                        ${isSearching ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-white dark:bg-black' : ''}`}>
                        <HiMagnifyingGlass className="text-gray-400 dark:text-zinc-500 text-sm flex-shrink-0" />
                        <input
                            ref={searchRef}
                            type="search"
                            placeholder="Search people to message"
                            value={search}
                            onFocus={() => setIsSearching(true)}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1
                                text-gray-700 dark:text-zinc-300
                                placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                        />
                        {search && (
                            <button onClick={clearSearch}
                                className="text-gray-400 dark:text-zinc-500
                                    hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                                <HiXMark className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {showSearchResults ? (
                        <>
                            <p className="px-4 py-2 text-xs font-medium uppercase tracking-wide
                                text-gray-400 dark:text-zinc-500">People</p>
                            {searchLoading && (
                                <div className="flex justify-center py-6">
                                    <div className="w-4 h-4 border-2 border-t-blue-500 rounded-full animate-spin
                                        border-gray-200 dark:border-zinc-700" />
                                </div>
                            )}
                            {!searchLoading && searchResults.length === 0 && (
                                <p className="text-center py-8 text-sm text-gray-400 dark:text-zinc-500">
                                    No users found for "{search}"
                                </p>
                            )}
                            {searchResults.map(u => (
                                <SearchResultItem key={u.username} user={u}
                                    onClick={() => startChat(u.username)} />
                            ))}
                            {filteredConvos.length > 0 && (
                                <>
                                    <p className="px-4 py-2 mt-1 text-xs font-medium uppercase tracking-wide
                                        text-gray-400 dark:text-zinc-500
                                        border-t border-gray-100 dark:border-zinc-800">Recent</p>
                                    {filteredConvos.map(c => (
                                        <ConvoItem key={c.username} convo={c}
                                            active={c.username === activeUser}
                                            onClick={() => startChat(c.username)} />
                                    ))}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {convosLoading && (
                                <div className="flex justify-center py-8">
                                    <div className="w-5 h-5 border-2 border-t-blue-500 rounded-full animate-spin
                                        border-gray-200 dark:border-zinc-700" />
                                </div>
                            )}
                            {!convosLoading && conversations.length === 0 && (
                                <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center
                                        text-2xl bg-gray-100 dark:bg-zinc-900 text-gray-400">
                                        <HiMagnifyingGlass />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                                        Search for someone above to start your first conversation
                                    </p>
                                </div>
                            )}
                            {conversations.map(c => (
                                <ConvoItem key={c.username} convo={c}
                                    active={c.username === activeUser}
                                    onClick={() => setActiveUser(c.username)} />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-black
                ${activeUser ? 'flex' : 'hidden md:flex'}`}>

                {!activeUser ? <EmptyChat /> : (
                    <>
                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0
                            backdrop-blur-md bg-white/90 dark:bg-black/90
                            border-b border-gray-100 dark:border-zinc-800">
                            <button
                                onClick={() => setActiveUser(null)}
                                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full
                                    text-gray-500 dark:text-zinc-400
                                    hover:bg-gray-100 dark:hover:bg-zinc-900">
                                <HiArrowLeft />
                            </button>
                            <Link to={`/${activeUser}`}
                                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-1">
                                <Avatar username={activeUser} src={activeConvo?.avatar} size={36} />
                                <div>
                                    <p className="font-semibold text-sm leading-tight
                                        text-gray-900 dark:text-zinc-100">
                                        {activeDisplayName}
                                    </p>
                                    <p className="text-xs">
                                        {wsStatus === 'open'
                                            ? <span className="text-blue-500">● Connected</span>
                                            : wsStatus === 'connecting'
                                                ? <span className="text-amber-500">● Connecting…</span>
                                                : wsStatus === 'error'
                                                    ? <span className="text-red-400">● Error</span>
                                                    : <span className="text-gray-400 dark:text-zinc-500">● Offline</span>
                                        }
                                    </p>
                                </div>
                            </Link>

                            {/* Retry button — single onClick, no duplicate */}
                            {(wsStatus === 'closed' || wsStatus === 'error') && (
                                <button
                                    onClick={retryConnection}
                                    className="text-xs text-blue-500 hover:underline px-2 py-1
                                        rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                    Retry
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-0.5
                            bg-gray-50 dark:bg-zinc-950">
                            {wsStatus === 'connecting' && (
                                <div className="flex justify-center py-6">
                                    <div className="w-5 h-5 border-2 border-t-blue-500 rounded-full animate-spin
                                        border-gray-200 dark:border-zinc-700" />
                                </div>
                            )}
                            {(wsStatus === 'error' || wsStatus === 'closed') && messages.length === 0 && (
                                <div className="text-center py-6 text-sm text-gray-400 dark:text-zinc-500">
                                    {wsStatus === 'error'
                                        ? 'Connection failed. Click Retry.'
                                        : 'Disconnected. Click Retry to reconnect.'}
                                </div>
                            )}
                            {messages.length === 0 && wsStatus === 'open' && (
                                <div className="text-center py-10 text-sm text-gray-400 dark:text-zinc-500">
                                    No messages yet. Say hello! 👋
                                </div>
                            )}
                            {messages.map(msg => (
                                <Bubble key={msg.id} msg={msg} isMe={msg.sender === me?.username} />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="flex-shrink-0 px-4 py-3
                            border-t border-gray-100 dark:border-zinc-800
                            bg-white dark:bg-black">
                            <div className="flex items-end gap-2 rounded-2xl px-4 py-2
                                bg-gray-100 dark:bg-zinc-900">
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Message ${activeDisplayName}…`}
                                    className="flex-1 bg-transparent outline-none text-sm resize-none
                                        max-h-28 py-1 text-gray-900 dark:text-zinc-100
                                        placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                                    style={{ minHeight: '24px' }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || wsStatus !== 'open'}
                                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center
                                        justify-center text-white flex-shrink-0 mb-0.5
                                        hover:bg-blue-600 disabled:opacity-40
                                        disabled:cursor-not-allowed transition-colors">
                                    <HiPaperAirplane className="text-sm -rotate-45 translate-x-px" />
                                </button>
                            </div>
                            <p className="text-[10px] mt-1.5 text-center
                                text-gray-400 dark:text-zinc-600">
                                Enter to send · Shift+Enter for new line
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
                }
