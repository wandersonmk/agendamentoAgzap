export default defineNuxtRouteMiddleware(async (to, from) => {
  // No servidor, não precisa verificar autenticação detalhada
  if (process.server) {
    return
  }
  
  try {
    console.log('[Auth Middleware] Verificando autenticação para:', to.path)
    
    const { isAuthenticated, user, isLoading, reloadSession } = useAuth()
    
    // Aguardar o carregamento inicial do plugin (máximo 3 segundos)
    let attempts = 0
    const maxAttempts = 30
    
    while (isLoading.value && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    console.log('[Auth Middleware] Estado da autenticação:', { 
      isAuthenticated: isAuthenticated.value, 
      hasUser: !!user.value,
      isLoading: isLoading.value,
      email: user.value?.email
    })
    
    // Se não está autenticado após o carregamento, tenta recarregar a sessão
    if (!isAuthenticated.value) {
      console.log('[Auth Middleware] Não autenticado, tentando recarregar sessão...')
      const hasValidSession = await reloadSession()
      
      if (!hasValidSession) {
        console.log('[Auth Middleware] Sem sessão válida, redirecionando para login')
        return navigateTo('/login')
      }
      
      console.log('[Auth Middleware] Sessão recarregada com sucesso')
    }
    
    console.log('[Auth Middleware] Usuário autenticado, permitindo acesso')
  } catch (error) {
    console.error('[Auth Middleware] Erro:', error)
    return navigateTo('/login')
  }
})
