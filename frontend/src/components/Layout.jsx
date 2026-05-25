import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { useThemeStore } from '../context/themeStore'
import useChatNotifications from '../hooks/useChatNotifications'
import MessageToast from './MessageToast'
import useChatNotifStore from '../context/chatNotifStore'
import { api } from '../api/client'
import {
  HiHome, HiMagnifyingGlass, HiBell, HiCog6Tooth, HiUser,
  HiChatBubbleLeftRight, HiArrowRightOnRectangle, HiSun, HiMoon
} from 'react-icons/hi2'
import { FaReact } from 'react-icons/fa'
import FooterCards from '../components/FooterCards'
/* ── TrendingCard ── */
function TrendingCard() {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/tweets/trending/')
      .then(res => setTrends(res.data))
      .catch(() => setTrends([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden
      border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-extrabold px-4 py-4 text-gray-900 dark:text-white
        border-b border-gray-200 dark:border-gray-800">
        What's happening
      </h2>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500
            rounded-full animate-spin" />
        </div>
      )}

      {!loading && trends.length === 0 && (
        <div className="px-4 py-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500">No trends yet</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Be the first to start a trend! ;)
          </span>
        </div>
      )}

      {trends.map((t, i) => (
        <div
          key={t.tag}
          onClick={() => navigate(`/explore?q=${encodeURIComponent(t.tag)}`)}
          className="px-4 py-3 flex flex-col gap-1 cursor-pointer
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            border-b border-gray-200 dark:border-gray-800 last:border-b-0"
        >
          <span className="text-xs text-gray-500">Trending · #{i + 1}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{t.tag}</span>
          <span className="text-xs text-gray-500">{t.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Layout ── */
export default function Layout() {
  useChatNotifications()

  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const { unreadCount, clearUnread } = useChatNotifStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePostClick = () => {
    if (location.pathname !== '/') navigate('/')
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const navItems = [
    { to: '/', icon: HiHome, label: 'Home', exact: true },
    { to: '/explore', icon: HiMagnifyingGlass, label: 'Explore' },
    { to: '/notifications', icon: HiBell, label: 'Notifications' },
    { to: '/chat', icon: HiChatBubbleLeftRight, label: 'Chat' },
    { to: user ? `/${user.username}` : '#', icon: HiUser, label: 'Profile' },
    { to: '/settings', icon: HiCog6Tooth, label: 'Settings' },
  ]

  return (
    <div className="flex justify-center max-w-[1250px] mx-auto min-h-screen px-4">

      {/* ── Left Sidebar ── */}
      <aside className="w-64 min-w-[256px] sticky top-0 h-screen flex flex-col
        px-2 py-3 border-r border-gray-200 dark:border-gray-800
        max-md:fixed max-md:bottom-0 max-md:top-auto max-md:w-full max-md:min-w-full
        max-md:h-14 max-md:flex-row max-md:border-t max-md:border-r-0
        max-md:bg-white max-md:dark:bg-black max-md:z-50 max-md:px-0 max-md:py-0">

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-3 rounded-full cursor-pointer
            hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors
            w-fit mb-2 max-md:hidden"
        >
          <img src="/chatox.png" alt="Chatox" className="w-13 h-8" />
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Chatox
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1
          max-md:flex-row max-md:flex-none max-md:w-full
          max-md:justify-around max-md:items-center">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const isChat = label === 'Chat'
            return (
              <NavLink
                key={label + to}
                to={to}
                end={exact}
                onClick={() => isChat && clearUnread()}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-full w-fit
                  text-gray-900 dark:text-white text-xl
                  hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors
                  max-md:px-2 max-md:py-2 max-md:rounded-lg
                  ${isActive ? 'font-bold' : 'font-normal'}`
                }
              >
                {/* icon + badge */}
                <span className="relative flex items-center justify-center text-[1.6rem]">
                  <Icon />
                  {isChat && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4
                      bg-emerald-500 text-white text-[10px] font-bold rounded-full
                      flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="max-md:hidden">{label}</span>
              </NavLink>
            )
          })}

          {/* Post button */}
          {user && (
            <button
              onClick={handlePostClick}
              className="mt-4 w-[90%] bg-blue-500 hover:bg-blue-600 active:scale-[.98]
                text-white font-bold text-lg py-3 rounded-full transition-all
                shadow-[0_4px_12px_rgba(29,155,240,0.15)]
                max-md:hidden"
            >
              Post
            </button>
          )}
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col gap-3 mt-auto max-md:hidden">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex items-center gap-4 px-4 py-2.5 rounded-full w-fit
              border border-gray-200 dark:border-gray-700 font-medium
              text-gray-900 dark:text-white text-base
              hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            {theme === 'dark'
              ? <HiSun className="text-2xl text-blue-500" />
              : <HiMoon className="text-2xl text-blue-500" />
            }
            <span className="text-sm">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* User chip */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-full
              hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900
                text-blue-600 dark:text-blue-300 font-bold text-lg flex items-center
                justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user.first_name || user.username}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  @{user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-full text-gray-400 text-2xl flex items-center
                  hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <HiArrowRightOnRectangle />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main feed ── */}
      <main className="flex-1 max-w-[600px] min-w-[600px] min-h-screen
        border-r border-gray-200 dark:border-gray-800
        max-md:max-w-full max-md:min-w-full max-md:border-r-0 max-md:pb-16">
        <Outlet />
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="w-80 min-w-[320px] sticky top-0 h-screen
        px-6 py-3 flex flex-col gap-4 overflow-y-auto
        max-[1095px]:hidden">

        {/* Search */}
        <div className="sticky top-0 bg-white dark:bg-black pb-3 pt-1 z-10">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2
              text-gray-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Search Chatox"
              className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent
                text-gray-900 dark:text-white placeholder-gray-500
                pl-12 pr-4 py-3 rounded-full text-sm outline-none
                focus:bg-white dark:focus:bg-black focus:border-blue-500 transition-all"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  navigate(`/explore?q=${encodeURIComponent(e.target.value)}`)
                }
              }}
            />
          </div>
        </div>

        {/* Trending */}
        <TrendingCard />

        {/* Footer */}
        <FooterCards />
      </aside>

      <MessageToast />
    </div>
  )
}