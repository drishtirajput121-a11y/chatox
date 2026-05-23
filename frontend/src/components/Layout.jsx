import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { useThemeStore } from '../context/themeStore'
import styles from './Layout.module.css'
import {
  HiHome,
  HiMagnifyingGlass,
  HiBell,
  HiCog6Tooth,
  HiUser,
  HiUserPlus,
  HiChatBubbleLeftRight,
  HiArrowRightOnRectangle,
  HiSun,
  HiMoon
} from 'react-icons/hi2'
import { FaReact } from 'react-icons/fa'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePostClick = () => {
    // If not on Home page, navigate to Home
    if (location.pathname !== '/') {
      navigate('/')
    }
    // After navigation or if already on Home, focus the tweet text area
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
    { to: '/notifications', icon: HiChatBubbleLeftRight, label: 'Chat' },
    { to: user ? `/${user.username}` : '#', icon: HiUserPlus, label: 'Follow' },
    { to: user ? `/${user.username}` : '#', icon: HiUser, label: 'Profile' },
    { to: '/settings', icon: HiCog6Tooth, label: 'Settings' },
  ]

  return (
    <div className={styles.shell}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <FaReact className={styles.reactLogo} />
          <span className={styles.logoText}>Chatox</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={label + to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}><Icon /></span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}

          {user && (
            <button className={styles.postBtn} onClick={handlePostClick}>
              Post
            </button>
          )}
        </nav>

        <div className={styles.sidebarBottom}>
          {/* Quick theme toggle */}
          <button 
            className={styles.themeToggleBtn} 
            onClick={toggle} 
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <HiSun /> : <HiMoon />}
            <span className={styles.themeToggleText}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {user && (
            <div className={styles.userChip}>
              <div className={styles.avatarSm}>{user.username[0].toUpperCase()}</div>
              <div className={styles.userInfo}>
                <span className={styles.userDisplayName}>
                  {user.first_name || user.username}
                </span>
                <span className={styles.userHandle}>@{user.username}</span>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
                <HiArrowRightOnRectangle />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <aside className={styles.rightSidebar}>
        <div className={styles.searchWrapper}>
          <HiMagnifyingGlass className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search Chatox" 
            className={styles.searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/explore?q=${encodeURIComponent(e.target.value)}`)
              }
            }}
          />
        </div>

        <div className={styles.trendingCard}>
          <h2 className={styles.trendingTitle}>What's happening</h2>
          
          <div className={styles.trendItem}>
            <div className={styles.trendMeta}>Technology · Trending</div>
            <div className={styles.trendName}>#ReactJS</div>
            <div className={styles.trendCount}>124,582 posts</div>
          </div>

          <div className={styles.trendItem}>
            <div className={styles.trendMeta}>Web Development · Trending</div>
            <div className={styles.trendName}>#ViteJS</div>
            <div className={styles.trendCount}>84,203 posts</div>
          </div>

          <div className={styles.trendItem}>
            <div className={styles.trendMeta}>Programming · Trending</div>
            <div className={styles.trendName}>#Zustand</div>
            <div className={styles.trendCount}>12,940 posts</div>
          </div>

          <div className={styles.trendItem}>
            <div className={styles.trendMeta}>Trending in India</div>
            <div className={styles.trendName}>#DjangoREST</div>
            <div className={styles.trendCount}>31,509 posts</div>
          </div>

          <div className={styles.trendItem}>
            <div className={styles.trendMeta}>Software Engineering</div>
            <div className={styles.trendName}>#WebDev</div>
            <div className={styles.trendCount}>245,119 posts</div>
          </div>
        </div>

        <footer className={styles.sidebarFooter}>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Cookie Policy</a>
          <a href="#">More</a>
          <span>© 2026 Chatox Corp.</span>
        </footer>
      </aside>
    </div>
  )
}
