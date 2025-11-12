import { ref, computed } from 'vue'
import { useSupabaseClient } from './useSupabaseClient'

export function useAgendamentos() {
  const supabase = useSupabaseClient()
  
  const agendamentos = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todos os agendamentos da empresa
  const fetchAgendamentos = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          atendente:atendentes(id, nome, telefone, email)
        `)
        .order('data_agendamento', { ascending: false })
        .order('hora_agendamento', { ascending: false })

      if (fetchError) throw fetchError

      agendamentos.value = data || []
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao buscar agendamentos:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Criar novo agendamento
  const createAgendamento = async (agendamento: {
    cliente_id: string
    atendente_id: string
    data_agendamento: string
    hora_agendamento: string
    assunto: string
    status?: string
  }) => {
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

      // Buscar dados do cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('nome, telefone')
        .eq('id', agendamento.cliente_id)
        .single()

      if (clienteError || !clienteData) {
        throw new Error('Cliente não encontrado')
      }

      // Buscar dados do atendente
      const { data: atendenteData, error: atendenteError } = await supabase
        .from('atendentes')
        .select('nome, telefone')
        .eq('id', agendamento.atendente_id)
        .single()

      if (atendenteError || !atendenteData) {
        throw new Error('Atendente não encontrado')
      }

      const { data, error: createError } = await supabase
        .from('agendamentos')
        .insert({
          cliente_id: agendamento.cliente_id,
          cliente_nome: clienteData.nome,
          cliente_telefone: clienteData.telefone,
          atendente_id: agendamento.atendente_id,
          atendente_nome: atendenteData.nome,
          atendente_telefone: atendenteData.telefone,
          data_agendamento: agendamento.data_agendamento,
          hora_agendamento: agendamento.hora_agendamento,
          assunto: agendamento.assunto,
          empresa_id: empresaIdData,
          status: agendamento.status || 'pendente'
        })
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          atendente:atendentes(id, nome, telefone, email)
        `)
        .single()

      if (createError) throw createError

      // Adiciona o novo agendamento no início da lista
      agendamentos.value.unshift(data)
      
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao criar agendamento:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Atualizar agendamento
  const updateAgendamento = async (id: string, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          atendente:atendentes(id, nome, telefone, email)
        `)
        .single()

      if (updateError) throw updateError

      // Atualiza o agendamento na lista
      const index = agendamentos.value.findIndex(a => a.id === id)
      if (index !== -1) {
        agendamentos.value[index] = data
      }

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao atualizar agendamento:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Deletar agendamento
  const deleteAgendamento = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Remove da lista
      agendamentos.value = agendamentos.value.filter(a => a.id !== id)
      
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao deletar agendamento:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Buscar clientes
  const fetchClientes = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err)
      return []
    }
  }

  // Buscar atendentes
  const fetchAtendentes = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('atendentes')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Erro ao buscar atendentes:', err)
      return []
    }
  }

  return {
    agendamentos: computed(() => agendamentos.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchAgendamentos,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    fetchClientes,
    fetchAtendentes
  }
}
