import { useEffect, useRef } from 'react'
import { useAuthStore } from '../context/authStore'
import useChatNotifStore from '../context/chatNotifStore'

export default function useChatNotifications() {
    const { user } = useAuthStore()
    const { incrementUnread, showToast, clearToast } = useChatNotifStore()
    const wsRef = useRef(null)

    useEffect(() => {
        if (!user) return

        const token = localStorage.getItem('access_token')
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:8000'
        const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/notifications/?token=${token}`)
        wsRef.current = ws

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === 'new_message') {
                incrementUnread()

                // show toast for 4 seconds
                showToast({
                    sender: data.sender,
                    preview: data.preview,
                    avatar: data.avatar,
                })
                setTimeout(() => clearToast(), 4000)
            }
        }

        return () => ws.close()
    }, [user])
}