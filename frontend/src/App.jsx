import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import TweetDetailPage from './pages/TweetDetailPage'
import ExplorePage from './pages/ExplorePage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ChatPage from './pages/ChatPage'
import { useThemeStore } from './context/themeStore'

function RequireAuth({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  const initAuth = useAuthStore((s) => s.init)
  const logout = useAuthStore((s) => s.logout)
  const initTheme = useThemeStore((s) => s.init)

  useEffect(() => {
    initAuth()
    initTheme()
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<FeedPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path=":username" element={<ProfilePage />} />
          <Route path=":username/status/:pk" element={<TweetDetailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:username" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
