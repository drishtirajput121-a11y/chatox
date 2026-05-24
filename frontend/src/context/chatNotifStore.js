import { create } from 'zustand'

const useChatNotifStore = create((set) => ({
    unreadCount: 0,
    toast: null,          // { sender, preview, avatar }

    setUnreadCount: (n) => set({ unreadCount: n }),
    incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
    clearUnread: () => set({ unreadCount: 0 }),
    showToast: (toast) => set({ toast }),
    clearToast: () => set({ toast: null }),
}))

export default useChatNotifStore