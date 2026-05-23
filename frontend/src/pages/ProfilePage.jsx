import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useContext(AuthContext)

  if (!user) return <div>Please login to view your profile.</div>

  return (
    <div className="surface p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-xl">
          {user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-slate-600">{user.email}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="surface p-4">
          <div className="text-xs text-slate-500">Member status</div>
          <div className="text-lg font-semibold mt-2">Active</div>
        </div>
        <div className="surface p-4">
          <div className="text-xs text-slate-500">Recommendations</div>
          <div className="text-lg font-semibold mt-2">Personalized</div>
        </div>
      </div>
    </div>
  )
}
