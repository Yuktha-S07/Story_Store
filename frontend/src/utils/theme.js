const THEME_KEY = 'story-store:theme'

export function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initTheme() {
  const theme = getStoredTheme()
  applyTheme(theme)
  return theme
}

export function setTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore storage errors */
  }
  applyTheme(theme)
  return theme
}
