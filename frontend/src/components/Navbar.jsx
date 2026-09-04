import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSettings, FiSun, FiMoon } from 'react-icons/fi'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { getStoredTheme } from '../utils/theme'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [unreadCount, setUnreadCount] = useState(0)

  const closeMenu = () => setMenuOpen(false)

  const fetchUnread = async () => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    try {
      const res = await api.get('/api/messages/unread-count')
      setUnreadCount(res.data?.unread_count ?? 0)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [user])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try {
      window.localStorage.setItem('story-store:theme', next)
    } catch {
      /* ignore storage errors */
    }
  }

  const navLinks = [
    { to: '/', label: 'Home', auth: false },
    { to: '/write', label: 'Write', auth: false },
    { to: '/stories', label: 'Stories', auth: false },
    { to: '/dashboard', label: 'Dashboard', auth: true },
    { to: '/bookmarks', label: 'Bookmarks', auth: true },
    { to: '/messages', label: 'Messages', auth: true },
    { to: user ? `/profile/${user._id}` : '', label: 'Profile', auth: true },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    if (to.startsWith('/profile')) return location.pathname.startsWith('/profile')
    if (to.startsWith('/stories')) return location.pathname.startsWith('/stories')
    if (to.startsWith('/write')) return location.pathname.startsWith('/write')
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-white/70 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,247,247,0.92)_100%)] backdrop-blur-xl shadow-[0_10px_30px_rgba(111,68,80,0.06)] dark:border-[#3b3047] dark:bg-[linear-gradient(90deg,rgba(29,24,36,0.96)_0%,rgba(43,31,49,0.96)_100%)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 md:px-10">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0 py-3 md:py-4">
          <span className="inline-flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#FFB2B2_100%)] font-bold text-sm md:text-base text-[#8C3838] shadow-[0_10px_24px_rgba(201,109,125,0.18)] ring-1 ring-white/70 dark:bg-[linear-gradient(135deg,#493451_0%,#705184_100%)] dark:text-[#f5dff2] dark:ring-[#876da0]/40">SS</span>
          <div className="text-base md:text-lg font-semibold tracking-tight text-[#3b3540] dark:text-[#f1e8f5]">Story Store</div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1.5 text-sm shadow-[0_14px_30px_rgba(111,68,80,0.08)] backdrop-blur-md dark:border-[#4b3b5d] dark:bg-[#2b2235]/90 dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)]">
            {navLinks.map((link) =>
              (!link.auth || user) && (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative rounded-full px-4 py-2 inline-flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 ${
                    isActive(link.to)
                      ? 'bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] text-[#5a2f3d] font-semibold shadow-[0_8px_20px_rgba(201,109,125,0.18)] dark:bg-[linear-gradient(135deg,#6a4b85_0%,#8a5f9e_100%)] dark:text-white dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]'
                      : 'text-[#5b5160] hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d] dark:text-[#d8c9e4] dark:hover:bg-[linear-gradient(135deg,#4c385b_0%,#654672_100%)] dark:hover:text-[#fff2fc]'
                  }`}
                >
                  {link.label}
                  {link.auth && link.to === '/messages' && unreadCount > 0 && (
                    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#E87B5D] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 text-sm shrink-0 py-3 md:py-4">
          {user ? (
            <>
              <Link
                to="/settings"
                onClick={closeMenu}
                aria-label="Settings"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5A6AF]/40 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] text-[#8C3838] shadow-[0_10px_22px_rgba(201,109,125,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,109,125,0.2)] dark:border-[#705184] dark:bg-[linear-gradient(135deg,#493451_0%,#38283f_100%)] dark:text-[#f2c8dd] dark:hover:bg-[#604579]"
              >
                <FiSettings className="h-4 w-4" />
              </Link>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5A6AF]/40 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] text-[#8C3838] shadow-[0_10px_22px_rgba(201,109,125,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,109,125,0.2)] dark:border-[#705184] dark:bg-[linear-gradient(135deg,#493451_0%,#38283f_100%)] dark:text-[#f2c8dd] dark:hover:bg-[#604579]"
              >
                {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => { logout(); navigate('/') }}
                className="rounded-full border border-[#E5A6AF]/40 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] px-4 py-2 font-semibold text-[#8C3838] shadow-[0_10px_22px_rgba(201,109,125,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,109,125,0.2)] dark:border-[#705184] dark:bg-[linear-gradient(135deg,#493451_0%,#38283f_100%)] dark:text-[#f2c8dd] dark:hover:bg-[#604579]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#E5A6AF_100%)] px-4 py-2 font-semibold text-white shadow-[0_12px_24px_rgba(201,109,125,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(201,109,125,0.24)]">Login</Link>
              <Link to="/signup" onClick={closeMenu} className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFB7BD_0%,#EA7777_100%)] px-4 py-2 font-semibold text-white shadow-[0_12px_24px_rgba(227,106,106,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(227,106,106,0.24)]">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden flex cursor-pointer items-center justify-center h-10 w-10 rounded-full border border-white/70 bg-white/70 shadow-sm transition-transform duration-150 active:scale-90 dark:border-[#4b3b5d] dark:bg-[#2b2235]"
        >
          <svg className="w-5 h-5 text-[#5b5160] dark:text-[#eadff1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/70 bg-white/98 backdrop-blur-xl px-3 pb-4 pt-2 space-y-1 dark:border-[#3b3047] dark:bg-[#211a29]">
          {navLinks.map((link) =>
            (!link.auth || user) && (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`flex items-center justify-between rounded-xl px-4 py-3 font-medium transition active:scale-[0.98] ${
                  isActive(link.to)
                    ? 'bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] text-[#5a2f3d] dark:bg-[linear-gradient(135deg,#6a4b85_0%,#8a5f9e_100%)] dark:text-white'
                    : 'text-[#5b5160] hover:bg-[#FFF2F4] dark:text-[#eadff1] dark:hover:bg-[#3a2c49]'
                }`}
              >
                <span>{link.label}</span>
                {link.auth && link.to === '/messages' && unreadCount > 0 && (
                  <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#E87B5D] px-2 py-0.5 text-xs font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          )}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 font-medium text-[#5b5160] transition active:scale-[0.98] hover:bg-[#FFF2F4] dark:text-[#eadff1] dark:hover:bg-[#3a2c49]"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => { closeMenu(); toggleTheme() }}
                  className="w-full cursor-pointer rounded-xl px-4 py-3 text-left font-medium text-[#5b5160] transition active:scale-[0.98] hover:bg-[#FFF2F4] dark:text-[#eadff1] dark:hover:bg-[#3a2c49]"
                >
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  type="button"
                  onClick={() => { closeMenu(); logout(); navigate('/') }}
                  className="w-full cursor-pointer rounded-xl px-4 py-3 text-left font-medium text-[#8C3838] transition active:scale-[0.98] hover:bg-[#FFF2F4] dark:text-[#f2a6ad] dark:hover:bg-[#3a2c49]"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={closeMenu} className="flex-1 text-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#E5A6AF_100%)] px-4 py-3.5 font-semibold text-white shadow-sm transition-transform duration-150 active:scale-[0.97]">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="flex-1 text-center rounded-full bg-[linear-gradient(135deg,#FFB7BD_0%,#EA7777_100%)] px-4 py-3.5 font-semibold text-white shadow-sm transition-transform duration-150 active:scale-[0.97]">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
