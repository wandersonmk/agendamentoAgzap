export function useEmpresa() {
  // Estado global para o nome da empresa
  const nomeEmpresa = useState<string | null>('empresa_nome', () => null)
  const isLoadingEmpresa = useState<boolean>('empresa_loading', () => false)

  // Busca SIMPLES e DIRETA do nome da empresa
  async function buscarNomeEmpresa() {
    if (!process.client) return

    try {
      isLoadingEmpresa.value = true
      const supabase = useSupabaseClient()
      
      // Pega o usuário atual da sessão do Supabase diretamente
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.id) {
        console.log('Usuário não está logado')
        nomeEmpresa.value = 'Sistema de Agendamentos'
        return
      }

      console.log('Buscando empresa para usuário:', user.id)
      
      // Primeiro busca o usuario para pegar o empresa_id
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

      if (usuarioError || !usuarioData?.empresa_id) {
        console.error('Erro ao buscar usuario:', usuarioError)
        nomeEmpresa.value = 'Sistema de Agendamentos'
        return
      }

      console.log('empresa_id encontrado:', usuarioData.empresa_id)

      // Agora busca a empresa pelo empresa_id
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', usuarioData.empresa_id)
        .single()

      if (empresaError) {
        console.error('Erro ao buscar empresa:', empresaError)
        nomeEmpresa.value = 'Sistema de Agendamentos'
        return
      }

      console.log('Nome da empresa encontrado:', empresaData?.nome)
      nomeEmpresa.value = empresaData?.nome || 'Sistema de Agendamentos'
      
    } catch (err) {
      console.error('Erro:', err)
      nomeEmpresa.value = 'Sistema de Agendamentos'
    } finally {
      isLoadingEmpresa.value = false
    }
  }

  return {
    nomeEmpresa: readonly(nomeEmpresa),
    isLoadingEmpresa: readonly(isLoadingEmpresa),
    buscarNomeEmpresa
  }
}
