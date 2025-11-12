import type { SupabaseClient, User, Session } from '@supabase/supabase-js'

export default defineNuxtPlugin(async () => {
  // Só executa no cliente
  if (process.client) {
    console.log('[Auth Plugin] Inicializando...')
    
    // Obter estados existentes ou criar novos
    const user = useState<User | null>('auth_user', () => null)
    const session = useState<Session | null>('auth_session', () => null)
    const loading = useState<boolean>('auth_loading', () => true)
    
    try {
      // Aguardar um pouco para garantir que Supabase está disponível
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const nuxtApp = useNuxtApp()
      
      if (!nuxtApp.$supabase) {
        console.error('[Auth Plugin] Supabase não disponível')
        loading.value = false
        return
      }
      
      const supabase = nuxtApp.$supabase as SupabaseClient
      console.log('[Auth Plugin] Cliente Supabase obtido')
      
      // Verificar se existe uma sessão salva
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[Auth Plugin] Erro ao obter sessão:', error)
        // Limpar estados em caso de erro
        user.value = null
        session.value = null
      } else {
        console.log('[Auth Plugin] Sessão obtida:', { hasSession: !!data.session })
        
        // Atualizar o estado com a sessão atual
        if (data.session) {
          // Verificar se a sessão é válida (não expirada)
          const expiresAt = data.session.expires_at
          const now = Math.floor(Date.now() / 1000)
          
          if (expiresAt && expiresAt > now) {
            user.value = data.session.user
            session.value = data.session
            console.log('[Auth Plugin] Usuário restaurado:', data.session.user.email)
          } else {
            // Sessão expirada - limpar
            console.log('[Auth Plugin] Sessão expirada, limpando estados')
            user.value = null
            session.value = null
            // Tentar fazer signOut para limpar localStorage
            await supabase.auth.signOut()
          }
        } else {
          user.value = null
          session.value = null
          console.log('[Auth Plugin] Nenhuma sessão encontrada')
        }
      }
      
      loading.value = false
      
      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event: any, newSession: Session | null) => {
        console.log('[Auth Plugin] Auth state changed:', event, { hasSession: !!newSession })
        
        // Tratamento específico por tipo de evento
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !newSession) {
          // Limpar estados quando logout ou falha no refresh
          user.value = null
          session.value = null
          console.log('[Auth Plugin] Sessão removida/expirada')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Atualizar estados em login ou refresh bem-sucedido
          user.value = newSession?.user ?? null
          session.value = newSession
          console.log('[Auth Plugin] Sessão atualizada:', { 
            hasUser: !!user.value, 
            email: user.value?.email 
          })
        } else if (event === 'USER_UPDATED') {
          // Atualizar apenas o usuário
          if (newSession?.user) {
            user.value = newSession.user
          }
        }
      })
      
      console.log('[Auth Plugin] Inicialização concluída')
      
    } catch (error) {
      console.error('[Auth Plugin] Erro ao inicializar:', error)
      user.value = null
      session.value = null
      loading.value = false
    }
  }
})
