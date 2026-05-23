import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import styles from './Layout.module.css'
import {
  HiHome,
  HiMagnifyingGlass,
  HiBell,
  HiCog6Tooth,
  HiUserCircle
} from 'react-icons/hi2'

const NAV = [
  { to: '/', icon: HiHome, label: 'Home', exact: true },
  { to: '/explore', icon: HiMagnifyingGlass, label: 'Explore' },
  { to: '/notifications', icon: HiBell, label: 'Notifications' },
  { to: '/settings', icon: HiCog6Tooth, label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      {/* Left sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          Chatox
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to={`/${user.username}`}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}><HiUserCircle /></span>
              Profile
            </NavLink>
          )}
        </nav>

        <div className={styles.sidebarBottom}>
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
                ↩
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
