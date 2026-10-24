import React, { useEffect, useState } from 'react'
import { Card } from '../SettingsUI'
import { getStoredTheme, setTheme as persistTheme } from '../../utils/theme'
import { FiMoon } from 'react-icons/fi'

export default function ThemeCard() {
  const [theme, setTheme] = useState(() => getStoredTheme())

  useEffect(() => {
    const handleThemeChange = (event) => setTheme(event.detail === 'dark' ? 'dark' : 'light')
    window.addEventListener('story-store:theme-change', handleThemeChange)
    return () => window.removeEventListener('story-store:theme-change', handleThemeChange)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    persistTheme(next)
  }

  return (
    <Card
      title="Theme"
      subtitle="Switch between light and dark mode."
      icon={<FiMoon size={18} />}
      actions={<button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`relative inline-flex h-9 w-14 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
            theme === 'dark' ? 'border-[#3d405b] bg-[#3d405b]' : 'border-[#e0d5c8] bg-[#e8e0d5]'
          }`}
          role="switch"
          aria-checked={theme === 'dark'}
        >
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
              theme === 'dark' ? 'translate-x-[1.5rem]' : 'translate-x-[0.22rem]'
            }`}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-[#3d405b]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#e07a5f]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </span>
        </button>}
    >
      <p className="text-xs text-[#71817d] dark:text-gray-300">
        Current theme <span className="font-semibold capitalize text-[#287568] dark:text-[#9bd8ca]">{theme}</span>
      </p>
    </Card>
  )
}
