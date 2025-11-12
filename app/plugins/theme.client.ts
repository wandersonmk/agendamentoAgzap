export default defineNuxtPlugin(() => {
  if (process.client) {
    // Verifica o tema salvo no localStorage ou preferência do sistema
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light')
    
    // Aplica o tema imediatamente
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(theme)
    
    // Salva a preferência se não existir
    if (!savedTheme) {
      localStorage.setItem('theme', theme)
    }
  }
})
