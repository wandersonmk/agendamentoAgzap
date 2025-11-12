import { computed, readonly } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { useSupabaseClient } from './useSupabaseClient'

// Composable de autenticação usando estados globais compartilhados
export function useAuth() {
  const supabase = useSupabaseClient()

  // Usar os estados globais criados pelo plugin auth.client.ts
  const user = useState<User | null>('auth_user', () => null)
  const session = useState<Session | null>('auth_session', () => null)
  const isLoading = useState<boolean>('auth_loading', () => false)
  const errorMessage = useState<string | null>('auth_error', () => null)

  // Computed para verificar se está autenticado
  const isAuthenticated = computed(() => !!user.value && !!session.value)

  // Funções de autenticação
  const signInWithEmailAndPassword = async (email: string, password: string) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      // Os estados serão atualizados automaticamente pelo listener onAuthStateChange
      return data.user
    } catch (err: any) {
      errorMessage.value = String(err?.message || err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signUp = async ({ name, companyName, email, password }: { name: string, companyName: string, email: string, password: string }) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      // 1. Criar autenticação no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error

      // 2. Criar empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome: companyName,
          email: email
        })
        .select()
        .single()

      if (empresaError) throw empresaError

      // 3. Criar usuário associado à empresa
      const { error: usuarioError } = await supabase.from('usuarios').insert({
        nome: name,
        empresa_id: empresaData.id,
        email: email,
        perfil: 'admin'
      })

      if (usuarioError) throw usuarioError

      return data.user
    } catch (err: any) {
      errorMessage.value = String(err?.message || err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Limpar estados
      user.value = null
      session.value = null
    } catch (err: any) {
      errorMessage.value = String(err?.message || err)
    } finally {
      isLoading.value = false
    }
  }

  const reloadSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (data.session) {
        user.value = data.session.user
        session.value = data.session
        return true
      } else {
        user.value = null
        session.value = null
        return false
      }
    } catch (err: any) {
      console.error('[useAuth] Erro ao recarregar sessão:', err)
      user.value = null
      session.value = null
      return false
    }
  }

  const clearError = () => { errorMessage.value = null }

  return {
    user: readonly(user),
    session: readonly(session),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    signInWithEmailAndPassword,
    signUp,
    signOut,
    reloadSession,
    clearError
  }
}