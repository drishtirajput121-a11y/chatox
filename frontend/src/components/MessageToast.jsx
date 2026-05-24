import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useChatNotifStore from '../context/chatNotifStore'
import { HiXMark, HiChatBubbleLeftRight } from 'react-icons/hi2'

function Avatar({ username, src }) {
    const palettes = [
        ['#E1F5EE', '#0F6E56'], ['#E6F1FB', '#185FA5'],
        ['#FAEEDA', '#854F0B'], ['#FBEAF0', '#993556'],
    ]
    const [bg, text] = palettes[(username || '?').charCodeAt(0) % palettes.length]
    if (src) return (
        <img src={src} alt={username}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
    )
    return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center
      font-semibold text-sm flex-shrink-0"
            style={{ background: bg, color: text }}>
            {(username || '?')[0].toUpperCase()}
        </div>
    )
}

export default function MessageToast() {
    const { toast, clearToast } = useChatNotifStore()
    const navigate = useNavigate()

    if (!toast) return null

    const handleClick = () => {
        clearToast()
        navigate(`/chat/${toast.sender}`)
    }

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        animate-slide-up cursor-pointer"
            style={{ animation: 'slideUp 0.3s ease-out' }}
        >
            <div
                onClick={handleClick}
                className="flex items-center gap-3 bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-xl px-4 py-3 min-w-64 max-w-80
          hover:shadow-2xl transition-shadow"
            >
                {/* avatar */}
                <div className="relative">
                    <Avatar username={toast.sender} src={toast.avatar} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4
            bg-emerald-500 rounded-full flex items-center justify-center">
                        <HiChatBubbleLeftRight className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>

                {/* text */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {toast.sender}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                        {toast.preview}
                    </p>
                </div>

                {/* close */}
                <button
                    onClick={(e) => { e.stopPropagation(); clearToast() }}
                    className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200
            flex items-center justify-center flex-shrink-0 transition-colors"
                >
                    <HiXMark className="w-3 h-3 text-gray-500" />
                </button>
            </div>
        </div>
    )
}