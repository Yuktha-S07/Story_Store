import React from 'react'
import { Card } from '../SettingsUI'
import { FiLogOut } from 'react-icons/fi'

export default function LogoutCard({ onLogout }) {
  return (
    <Card
      title="Logout"
      subtitle="Sign out of your account."
      tone="logout"
      icon={<FiLogOut size={18} />}
      actions={<button
          onClick={onLogout}
          className="rounded-xl border border-[#e5c4ce] bg-[#fff3f6] px-5 py-2.5 text-sm font-semibold text-[#8c4260] transition hover:-translate-y-0.5 hover:border-[#d9aab9] hover:shadow-md dark:border-[#68404f] dark:bg-[#3d2732] dark:text-[#e8a0b4]"
        >
          Logout
        </button>}
    >
      <span className="sr-only">Logout action</span>
    </Card>
  )
}
