const THEME_KEY = 'story-store:theme'
const AUTH_TOKEN_KEY = 'access_token'

export function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/**
 * Theme to use for the current session: visitors who are not logged in always
 * start in light mode, while logged-in users get their saved preference.
 */
export function getPreferredTheme() {
  try {
    if (!window.localStorage.getItem(AUTH_TOKEN_KEY)) return 'light'
  } catch {
    return 'light'
  }
  return getStoredTheme()
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initTheme() {
  const theme = getPreferredTheme()
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
