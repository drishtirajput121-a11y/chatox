import styles from './Page.module.css'
import { HiBell } from 'react-icons/hi2'

export default function NotificationsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
      </header>
      
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIconWrapper}>
          <HiBell className={styles.bellIcon} />
        </div>
        <h2 className={styles.emptyHeading}>Nothing to see here — yet</h2>
        <p className={styles.emptyText}>
          When people like, reply to, or share your posts, you'll find them here.
        </p>
      </div>
    </div>
  )
}
