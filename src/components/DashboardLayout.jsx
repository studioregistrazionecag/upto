// src/components/DashboardLayout.jsx
import React from 'react'
import { supabase } from '../utils/supabaseClient'
import styles from './DashboardLayout.module.css'

const DashboardLayout = ({ user, children }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <span className={styles.userRole}>{user.role}</span>
          <h1 className={styles.userName}>{user.full_name || user.email}</h1>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout