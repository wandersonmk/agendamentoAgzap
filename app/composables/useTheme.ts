export const useTheme = () => {
  const isDark = useState<boolean>('theme-is-dark', () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true // Default para SSR
  })

  const toggleTheme = () => {
    if (!process.client) return

    isDark.value = !isDark.value
    const html = document.documentElement
    const newTheme = isDark.value ? 'dark' : 'light'

    html.classList.remove('light', 'dark')
    html.classList.add(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const setTheme = (theme: 'light' | 'dark') => {
    if (!process.client) return

    isDark.value = theme === 'dark'
    const html = document.documentElement

    html.classList.remove('light', 'dark')
    html.classList.add(theme)
    localStorage.setItem('theme', theme)
  }

  return {
    isDark: readonly(isDark),
    toggleTheme,
    setTheme
  }
}
