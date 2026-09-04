import React from 'react'
import { FiLogOut } from 'react-icons/fi'
import { Card } from '../SettingsUI'

export default function LogoutCard({ onLogout }) {
  return (
    <Card
      title="Logout"
      subtitle="Sign out of your account."
      icon={FiLogOut}
      iconColor="slate"
      accent="slate"
      actions={
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-[#E5A6AF]/50 bg-gradient-to-r from-[#FFF2F4] to-[#F8D7DD] px-5 py-2.5 text-sm font-semibold text-[#8C3838] shadow-[0_2px_8px_rgba(229,166,175,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(229,166,175,0.3)] dark:from-[#4a2d33] dark:to-[#3d2026] dark:text-[#e8a0a0] dark:shadow-none dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
        >
          <FiLogOut size={14} /> Logout
        </button>
      }
    />
  )
}
