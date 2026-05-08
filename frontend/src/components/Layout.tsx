import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Video, PlayCircle, MessageSquare } from 'lucide-react'
import './Layout.css'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: TrendingUp, label: 'Produits' },
  { path: '/content', icon: Video, label: 'Content' },
  { path: '/ads', icon: PlayCircle, label: 'Ads' },
  { path: '/assistant', icon: MessageSquare, label: 'AI' },
]

export default function Layout() {
  return (
    <div className="layout">
      <main className="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
