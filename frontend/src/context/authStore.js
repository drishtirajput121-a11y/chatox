import { create } from 'zustand'
import { authAPI, usersAPI } from '../api/client'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  init: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ loading: false }); return }
    try {
      const { data } = await usersAPI.me()
      set({ user: data, loading: false })
    } catch {
      // token expired — try refreshing
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        localStorage.removeItem('access_token')
        set({ user: null, loading: false })
        return
      }
      try {
        const { data } = await authAPI.refreshToken(refresh)
        localStorage.setItem('access_token', data.access)
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
        const me = await usersAPI.me()
        set({ user: me.data, loading: false })
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, loading: false })
      }
    }
  },

  login: async (credentials) => {
    set({ error: null })
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const me = await usersAPI.me()
    set({ user: me.data })
    return me.data
  },

  // used after OTP verification — tokens already stored
  setUserFromTokens: async () => {
    const me = await usersAPI.me()
    set({ user: me.data })
    return me.data
  },

  register: async (payload) => {
    set({ error: null })
    await authAPI.register(payload)
    return get().login({ username: payload.username, password: payload.password })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null })
  },

  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}))