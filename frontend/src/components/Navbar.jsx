import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-20 border-b border-white/70 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,247,247,0.92)_100%)] backdrop-blur-xl shadow-[0_10px_30px_rgba(111,68,80,0.06)]">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between px-2 sm:px-4 md:px-10">
        <Link to="/" className="flex items-center gap-1 sm:gap-3 shrink-0 py-3 md:py-4">
          <span className="inline-flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#FFB2B2_100%)] font-bold text-xs sm:text-base text-[#8C3838] shadow-[0_10px_24px_rgba(201,109,125,0.18)] ring-1 ring-white/70">SS</span>
          <div className="text-sm sm:text-lg font-semibold tracking-tight text-[#3b3540] hidden sm:block">Story Store</div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar flex-1 justify-start md:justify-center px-1 md:px-2 py-3 md:py-4 scroll-px-2">
          <div className="flex items-center gap-1 sm:gap-2 rounded-full border border-white/70 bg-white/70 p-1 sm:p-2 text-xs sm:text-sm shadow-[0_14px_30px_rgba(111,68,80,0.08)] backdrop-blur-md">
            <Link to="/" className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">Home</Link>
            <Link to="/write" className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">Write</Link>
            <Link to="/stories" className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">Stories</Link>
            {user && (
              <>
                <Link to="/dashboard" className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">Dashboard</Link>
                <Link to="/bookmarks" className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">Bookmarks</Link>
                <Link to={`/profile/${user._id}`} className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-[#5b5160] whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(135deg,#F7D0D7_0%,#F0B5C2_100%)] hover:text-[#5a2f3d]">Profile</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0 py-3 md:py-4">
          {user ? (
            <button
              onClick={() => { logout(); navigate('/') }}
              className="rounded-full border border-[#E5A6AF]/40 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] px-2 sm:px-4 py-1.5 sm:py-2 font-semibold text-[#8C3838] shadow-[0_10px_22px_rgba(201,109,125,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,109,125,0.2)]"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD5D5_0%,#E5A6AF_100%)] px-2 sm:px-4 py-1.5 sm:py-2 font-semibold text-white shadow-[0_12px_24px_rgba(201,109,125,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(201,109,125,0.24)]">Login</Link>
              <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFB7BD_0%,#EA7777_100%)] px-2 sm:px-4 py-1.5 sm:py-2 font-semibold text-white shadow-[0_12px_24px_rgba(227,106,106,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(227,106,106,0.24)]">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
