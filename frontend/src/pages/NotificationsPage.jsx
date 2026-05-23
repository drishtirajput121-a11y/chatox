import styles from './Page.module.css'
import { HiBell } from 'react-icons/hi2'
export default function NotificationsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
      </header>
      <div className={styles.empty}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><HiBell /></p>
        <p>Notifications will appear here.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Add a notifications endpoint to your backend to power this page.
        </p>
      </div>
    </div>
  )
}
