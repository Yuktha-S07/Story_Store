import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const navLinks = [
    { to: '/', label: 'Home', auth: false },
    { to: '/write', label: 'Write', auth: false },
    { to: '/stories', label: 'Stories', auth: false },
    { to: '/dashboard', label: 'Dashboard', auth: true },
    { to: '/bookmarks', label: 'Bookmarks', auth: true },
    { to: user ? `/profile/${user._id}` : '', label: 'Profile', auth: true },
  ]

  return (
    <nav className="sticky top-0 z-20 border-b border-white/70 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,247,247,0.92)_100%)] backdrop-blur-xl shadow-[0_10px_30px_rgba(111,68,80,0.06)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 md:px-10">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0 py-3 md:py-4">
          <span className="inline-flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#FFB2B2_100%)] font-bold text-sm md:text-base text-[#8C3838] shadow-[0_10px_24px_rgba(201,109,125,0.18)] ring-1 ring-white/70">SS</span>
          <div className="text-base md:text-lg font-semibold tracking-tight text-[#3b3540]">Story Store</div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1.5 text-sm shadow-[0_14px_30px_rgba(111,68,80,0.08)] backdrop-blur-md">
            {navLinks.map((link) =>
              (!link.auth || user) && (
                <Link key={link.to} to={link.to} className="rounded-full px-4 py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 text-sm shrink-0 py-3 md:py-4">
          {user ? (
            <button
              onClick={() => { logout(); navigate('/') }}
              className="rounded-full border border-[#E5A6AF]/40 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] px-4 py-2 font-semibold text-[#8C3838] shadow-[0_10px_22px_rgba(201,109,125,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,109,125,0.2)]"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#E5A6AF_100%)] px-4 py-2 font-semibold text-white shadow-[0_12px_24px_rgba(201,109,125,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(201,109,125,0.24)]">Login</Link>
              <Link to="/signup" onClick={closeMenu} className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFB7BD_0%,#EA7777_100%)] px-4 py-2 font-semibold text-white shadow-[0_12px_24px_rgba(227,106,106,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(227,106,106,0.24)]">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-full border border-white/70 bg-white/70 shadow-sm"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-[#5b5160]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="md:hidden border-t border-white/70 bg-white/98 backdrop-blur-xl px-3 pb-4 pt-2 space-y-1">
          {navLinks.map((link) =>
            (!link.auth || user) && (
              <Link key={link.to} to={link.to} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[#5b5160] font-medium transition hover:bg-[#FFF2F4]">
                {link.label}
              </Link>
            )
          )}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                onClick={() => { closeMenu(); logout(); navigate('/') }}
                className="w-full rounded-xl px-4 py-3 text-left font-medium text-[#8C3838] transition hover:bg-[#FFF2F4]"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={closeMenu} className="flex-1 text-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#E5A6AF_100%)] px-4 py-3 font-semibold text-white shadow-sm">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="flex-1 text-center rounded-full bg-[linear-gradient(135deg,#FFB7BD_0%,#EA7777_100%)] px-4 py-3 font-semibold text-white shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
