import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import AdminFooter from './AdminFooter'
import { AnimatePresence, motion } from 'framer-motion'
import { getRoleNotifications } from '../utils/processes'

export default function AdminLayout({ session }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifVersion, setNotifVersion] = useState(0)
  const location = useLocation()
  const notifications = useMemo(
    () => getRoleNotifications(session?.role),
    [session?.role, location.pathname, notifVersion],
  )

  useEffect(() => {
    const interval = setInterval(() => setNotifVersion((value) => value + 1), 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <AdminSidebar session={session} collapsed={sidebarCollapsed} />
      <div className="admin-main">
        <AdminHeader
          session={session}
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          notifications={notifications}
        />
        <div className="admin-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="page-anim"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

