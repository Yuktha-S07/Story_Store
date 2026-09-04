import React, { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { Card } from '../SettingsUI'

export default function ThemeCard() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    setTheme('light')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <Card
      title="Theme"
      subtitle="Switch between light and dark mode."
      icon={theme === 'dark' ? FiMoon : FiSun}
      iconColor="amber"
      accent="amber"
      actions={<button
          onClick={toggleTheme}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 ${
            theme === 'dark'
              ? 'border-[#6b5c8a] bg-gradient-to-r from-[#4a3d6b] to-[#3d405b] shadow-[0_0_12px_rgba(107,92,138,0.3)]'
              : 'border-[#d4a853]/50 bg-gradient-to-r from-[#f5e6c8] to-[#e8d5b0] shadow-[0_0_12px_rgba(212,168,83,0.2)]'
          }`}
          role="switch"
          aria-checked={theme === 'dark'}
        >
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${
              theme === 'dark' ? 'translate-x-[1.5rem]' : 'translate-x-[0.15rem]'
            }`}
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5 text-[#6b5c8a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-[#e07a5f]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </span>
        </button>}
    >
      <div className="flex items-center gap-3 rounded-xl bg-[#f8f4ee] px-4 py-3 dark:bg-[#2a2430]">
        {theme === 'dark' ? (
          <FiMoon size={16} className="text-[#9c78b9]" />
        ) : (
          <FiSun size={16} className="text-[#d4a853]" />
        )}
        <p className="text-xs text-[#5d584f] dark:text-gray-300">
          Currently using <span className="font-bold capitalize text-[#26231f] dark:text-white">{theme}</span> mode
        </p>
      </div>
    </Card>
  )
}
