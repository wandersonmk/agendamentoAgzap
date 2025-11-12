import type { PostgrestResponse } from '@supabase/supabase-js'

// Interface para tipagem do cliente
export interface Cliente {
  id: string
  nome: string
  telefone: string
  email?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

// Interface para inserção/atualização de cliente
export interface ClienteInput {
  nome: string
  telefone: string
  email?: string
  observacoes?: string
  ativo?: boolean
}

export const useClientes = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  // Estados reativos
  const clientes = ref<Cliente[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar clientes da empresa do usuário logado
  const fetchClientes = async (): Promise<void> => {
    console.log('🔍 Iniciando busca de clientes...')
    isLoading.value = true
    error.value = null
    try {
      // A RLS policy já filtra automaticamente por empresa_id
      // mas vamos garantir buscando apenas clientes ativos da empresa
      const { data, error: clientesError }: PostgrestResponse<Cliente> = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Resultado da busca:', { data, error: clientesError })

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError)
        error.value = `Erro ao carregar clientes: ${clientesError.message}`
        return
      }

      console.log(`✅ ${data?.length || 0} clientes encontrados`)
      clientes.value = data || []
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar clientes:', err)
      error.value = 'Erro inesperado ao carregar clientes'
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar novo cliente
  const addCliente = async (clienteData: ClienteInput): Promise<any> => {
    console.log('➕ Adicionando novo cliente:', clienteData)
    isLoading.value = true
    error.value = null
    try {
      // Buscar empresa_id do usuário logado
      const { data: empresaIdData, error: empresaError } = await supabase
        .rpc('get_user_empresa_id')

      if (empresaError) {
        console.error('❌ Erro ao buscar empresa_id:', empresaError)
        throw new Error('Erro ao identificar sua empresa')
      }

      // Inserir cliente com empresa_id
      const { data, error: insertError } = await supabase
        .from('clientes')
        .insert([{
          ...clienteData,
          empresa_id: empresaIdData
        }])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao adicionar cliente:', insertError)
        error.value = `Erro ao adicionar cliente: ${insertError.message}`
        throw insertError
      }

      console.log('✅ Cliente adicionado com sucesso:', data)
      // Recarregar lista de clientes
      await fetchClientes()
      return data
    } catch (err: any) {
      console.error('💥 Erro inesperado ao adicionar cliente:', err)
      error.value = err?.message || 'Erro inesperado ao adicionar cliente'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Atualizar cliente
  const updateCliente = async (clienteId: string, clienteData: Partial<ClienteInput>): Promise<boolean> => {
    console.log('✏️ Atualizando cliente:', clienteId, clienteData)
    isLoading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', clienteId)
        .select()

      if (updateError) {
        console.error('❌ Erro ao atualizar cliente:', updateError)
        error.value = `Erro ao atualizar cliente: ${updateError.message}`
        return false
      }

      console.log('✅ Cliente atualizado com sucesso:', data)
      // Recarregar lista de clientes
      await fetchClientes()
      return true
    } catch (err) {
      console.error('💥 Erro inesperado ao atualizar cliente:', err)
      error.value = 'Erro inesperado ao atualizar cliente'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Deletar cliente
  const deleteCliente = async (clienteId: string): Promise<boolean> => {
    console.log('🗑️ Deletando cliente:', clienteId)

    try {
      isLoading.value = true
      error.value = null

      // Verificar se existem agendamentos pendentes para este cliente
      const { data: agendamentosPendentes, error: checkError } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('status', 'pendente')

      if (checkError) {
        console.error('❌ Erro ao verificar agendamentos:', checkError)
        throw new Error('Erro ao verificar agendamentos do cliente')
      }

      // Se houver agendamentos pendentes, não permite excluir
      if (agendamentosPendentes && agendamentosPendentes.length > 0) {
        const mensagem = `Não é possível excluir este cliente. Existem ${agendamentosPendentes.length} agendamento(s) pendente(s) associado(s) a ele.`
        console.warn('⚠️', mensagem)
        error.value = mensagem
        throw new Error(mensagem)
      }

      // Se não houver agendamentos pendentes, pode excluir
      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)

      if (deleteError) {
        console.error('❌ Erro ao deletar cliente:', deleteError)
        error.value = `Erro ao deletar cliente: ${deleteError.message}`
        throw new Error(`Erro ao deletar cliente: ${deleteError.message}`)
      }

      console.log('✅ Cliente deletado com sucesso')
      
      // Recarregar lista de clientes
      await fetchClientes()
      return true
      
    } catch (err: any) {
      console.error('💥 Erro inesperado ao deletar cliente:', err)
      error.value = err?.message || 'Erro inesperado ao deletar cliente'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Limpar erro
  const clearError = (): void => {
    error.value = null
  }

  // Retornar estados e funções reativas (readonly)
  return {
    clientes,
    isLoading,
    error,
    fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente,
    clearError
  }
}
