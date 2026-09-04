import React from 'react'
import { Card } from '../SettingsUI'

export default function LogoutCard({ onLogout }) {
  return (
    <Card
      title="Logout"
      subtitle="Sign out of your account."
      actions={<button
          onClick={onLogout}
          className="rounded-full border border-[#E5A6AF]/50 bg-[linear-gradient(135deg,#FFF2F4_0%,#F8D7DD_100%)] dark:bg-[linear-gradient(135deg,#4a2d33_0%,#3d2026_100%)] px-5 py-2 text-sm font-semibold text-[#8C3838] dark:text-[#e8a0a0] transition hover:shadow-md"
        >
          Logout
        </button>}
    >
      <span className="sr-only">Logout action</span>
    </Card>
  )
}
