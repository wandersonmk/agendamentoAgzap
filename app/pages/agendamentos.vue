<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const toast = await useToastSafe()

// Estado de carregamento inicial
const isLoading = ref(true)

// Refs para as funções e estados do composable
const agendamentosData = ref<any[]>([])
const isLoadingAgendamentos = ref(false)
let fetchAgendamentos: any
let createAgendamento: any
let updateAgendamento: any
let deleteAgendamento: any
let fetchClientes: any
let fetchAtendentes: any

// Estado do modal de novo agendamento
const showModal = ref(false)

// Estado dos modais de criação
const showModalNovoCliente = ref(false)
const showModalNovoAtendente = ref(false)

// Listas para os selects
const clientes = ref<any[]>([])
const atendentes = ref<any[]>([])

// Estados de busca e seleção
const buscaCliente = ref('')
const buscaAtendente = ref('')
const mostrarListaClientes = ref(false)
const mostrarListaAtendentes = ref(false)
const clienteSelecionado = ref<any>(null)
const atendenteSelecionado = ref<any>(null)

// Formulário de agendamento
const form = ref({
  cliente_id: '',
  atendente_id: '',
  assunto: '',
  data_agendamento: '',
  hora_agendamento: '',
  status: 'pendente'
})

// Filtros
const filtros = ref({
  busca: '',
  status: 'todos',
  dataInicio: '',
  dataFim: ''
})

// Computed para filtrar clientes na busca
const clientesFiltrados = computed(() => {
  if (!buscaCliente.value) return clientes.value
  
  const busca = buscaCliente.value.toLowerCase()
  return clientes.value.filter((cliente: any) => 
    cliente.nome?.toLowerCase().includes(busca) ||
    cliente.telefone?.toLowerCase().includes(busca)
  )
})

// Computed para filtrar atendentes na busca
const atendentesFiltrados = computed(() => {
  if (!buscaAtendente.value) return atendentes.value
  
  const busca = buscaAtendente.value.toLowerCase()
  return atendentes.value.filter((atendente: any) => 
    atendente.nome?.toLowerCase().includes(busca) ||
    atendente.telefone?.toLowerCase().includes(busca)
  )
})

// Computed para filtrar agendamentos
const agendamentos = computed(() => {
  let resultado = agendamentosData.value || []

  // Filtro por busca (nome do cliente, telefone ou assunto)
  if (filtros.value.busca.trim()) {
    const busca = filtros.value.busca.toLowerCase()
    resultado = resultado.filter((ag: any) => 
      ag.cliente?.nome?.toLowerCase().includes(busca) ||
      ag.cliente?.telefone?.toLowerCase().includes(busca) ||
      ag.assunto?.toLowerCase().includes(busca) ||
      ag.atendente?.nome?.toLowerCase().includes(busca)
    )
  }

  // Filtro por status
  if (filtros.value.status !== 'todos') {
    resultado = resultado.filter((ag: any) => ag.status === filtros.value.status)
  }

  // Filtro por data inicial
  if (filtros.value.dataInicio) {
    resultado = resultado.filter((ag: any) => ag.data_agendamento >= filtros.value.dataInicio)
  }

  // Filtro por data final
  if (filtros.value.dataFim) {
    resultado = resultado.filter((ag: any) => ag.data_agendamento <= filtros.value.dataFim)
  }

  return resultado
})

// Limpar filtros
const limparFiltros = () => {
  filtros.value = {
    busca: '',
    status: 'todos',
    dataInicio: '',
    dataFim: ''
  }
}

// Variável para armazenar o composable
let composable: any = null

// Aguarda a autenticação ser carregada e carrega dados
onMounted(async () => {
  if (process.client) {
    // Inicializa composable no cliente
    composable = useAgendamentos()
    fetchAgendamentos = composable.fetchAgendamentos
    createAgendamento = composable.createAgendamento
    updateAgendamento = composable.updateAgendamento
    deleteAgendamento = composable.deleteAgendamento
    fetchClientes = composable.fetchClientes
    fetchAtendentes = composable.fetchAtendentes
    
    // Watch para sincronizar os dados
    watch(() => composable.agendamentos.value, (newVal) => {
      agendamentosData.value = newVal
    }, { immediate: true })
    
    watch(() => composable.isLoading.value, (newVal) => {
      isLoadingAgendamentos.value = newVal
    }, { immediate: true })
    
    // Inicializa auth no cliente
    const { isLoading: authLoading } = useAuth()
    
    // Aguarda autenticação
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Carrega dados
    await Promise.all([
      fetchAgendamentos(),
      fetchClientes().then((data: any) => clientes.value = data),
      fetchAtendentes().then((data: any) => atendentes.value = data)
    ])
  }
  
  isLoading.value = false
})

// Abrir modal
const abrirModal = async () => {
  // Garante que temos clientes e atendentes carregados
  if (clientes.value.length === 0) {
    clientes.value = await fetchClientes()
  }
  if (atendentes.value.length === 0) {
    atendentes.value = await fetchAtendentes()
  }
  showModal.value = true
}

// Fechar modal
const fecharModal = () => {
  showModal.value = false
  limparFormulario()
}

// Limpar formulário
const limparFormulario = () => {
  form.value = {
    cliente_id: '',
    atendente_id: '',
    assunto: '',
    data_agendamento: '',
    hora_agendamento: '',
    status: 'pendente'
  }
  buscaCliente.value = ''
  buscaAtendente.value = ''
  clienteSelecionado.value = null
  atendenteSelecionado.value = null
}

// Métodos para gerenciar clientes
const selecionarCliente = (cliente: any) => {
  clienteSelecionado.value = cliente
  form.value.cliente_id = cliente.id
  buscaCliente.value = cliente.nome
  mostrarListaClientes.value = false
}

const limparClienteSelecionado = () => {
  clienteSelecionado.value = null
  form.value.cliente_id = ''
  buscaCliente.value = ''
}

const ocultarListaClientes = () => {
  setTimeout(() => {
    mostrarListaClientes.value = false
  }, 200)
}

// Métodos para gerenciar atendentes
const selecionarAtendente = (atendente: any) => {
  atendenteSelecionado.value = atendente
  form.value.atendente_id = atendente.id
  buscaAtendente.value = atendente.nome
  mostrarListaAtendentes.value = false
}

const limparAtendenteSelecionado = () => {
  atendenteSelecionado.value = null
  form.value.atendente_id = ''
  buscaAtendente.value = ''
}

const ocultarListaAtendentes = () => {
  setTimeout(() => {
    mostrarListaAtendentes.value = false
  }, 200)
}

// Salvar agendamento
const salvarAgendamento = async () => {
  // Validação básica
  if (!form.value.cliente_id || !form.value.atendente_id || !form.value.assunto || 
      !form.value.data_agendamento || !form.value.hora_agendamento) {
    toast?.error('Por favor, preencha todos os campos!')
    return
  }

  try {
    await createAgendamento(form.value)
    toast?.success('Agendamento criado com sucesso!')
    fecharModal()
  } catch (error) {
    toast?.error('Erro ao criar agendamento')
    console.error('Erro:', error)
  }
}

// Deletar agendamento
const confirmarExclusao = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    try {
      await deleteAgendamento(id)
      toast?.success('Agendamento excluído com sucesso!')
    } catch (error) {
      toast?.error('Erro ao excluir agendamento')
      console.error('Erro:', error)
    }
  }
}

// Atualizar status
const atualizarStatus = async (id: string, novoStatus: string) => {
  try {
    await updateAgendamento(id, { status: novoStatus })
    toast?.success('Status atualizado!')
  } catch (error) {
    toast?.error('Erro ao atualizar status')
    console.error('Erro:', error)
  }
}

// Abrir modal de novo cliente
const abrirModalNovoCliente = () => {
  showModalNovoCliente.value = true
}

// Abrir modal de novo atendente
const abrirModalNovoAtendente = () => {
  showModalNovoAtendente.value = true
}

// Quando cliente é criado, atualizar lista e selecionar
const aoClienteCriado = async (clienteCriado: any) => {
  showModalNovoCliente.value = false
  // Recarregar lista de clientes
  clientes.value = await fetchClientes()
  // Selecionar o cliente recém-criado
  if (clienteCriado) {
    selecionarCliente(clienteCriado)
  }
}

// Quando atendente é criado, atualizar lista e selecionar
const aoAtendenteCriado = async (atendenteCriado: any) => {
  showModalNovoAtendente.value = false
  // Recarregar lista de atendentes
  atendentes.value = await fetchAtendentes()
  // Selecionar o atendente recém-criado
  if (atendenteCriado) {
    selecionarAtendente(atendenteCriado)
  }
}

// Formatar data para exibição
const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Formatar telefone
const formatarTelefone = (telefone: string) => {
  return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}
</script>

<template>
  <div>
    <!-- Loading enquanto carrega -->
    <AppLoading 
      v-if="isLoading"
      title="Carregando Agendamentos" 
      description="Preparando gerenciamento de agendamentos..."
    />
    
    <!-- Página de Agendamentos -->
    <div v-else class="max-w-7xl mx-auto space-y-8">
      <!-- Header com título e botão -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Agendamentos
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Gerencie seus agendamentos e notificações de forma inteligente
          </p>
        </div>
        <AppButton @click="abrirModal" variant="primary" class="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Novo Agendamento
        </AppButton>
      </div>

      <!-- Filtros -->
      <div class="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Busca -->
          <div class="lg:col-span-2">
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">
              Buscar
            </label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="filtros.busca"
                type="text"
                placeholder="Nome do cliente, telefone, assunto..."
                class="w-full pl-10 pr-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">
              Status
            </label>
            <select
              v-model="filtros.status"
              class="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <!-- Data Início -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">
              Data Início
            </label>
            <input
              v-model="filtros.dataInicio"
              type="date"
              class="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
            />
          </div>
        </div>

        <!-- Linha adicional: Data Fim e Botão Limpar -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <!-- Data Fim -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">
              Data Fim
            </label>
            <input
              v-model="filtros.dataFim"
              type="date"
              class="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
            />
          </div>

          <!-- Botão Limpar Filtros -->
          <div class="flex items-end">
            <button
              @click="limparFiltros"
              class="w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Limpar Filtros
            </button>
          </div>

          <!-- Contador de resultados -->
          <div class="lg:col-span-2 flex items-end">
            <div class="text-sm text-muted-foreground">
              <span class="font-semibold text-foreground">{{ agendamentos.length }}</span>
              {{ agendamentos.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de agendamentos com scroll -->
      <div class="relative">
        <div class="overflow-y-auto max-h-[calc(100vh-28rem)] pr-2 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          <!-- Card de agendamento -->
          <div 
            v-for="agendamento in agendamentos" 
            :key="agendamento.id"
            class="group relative bg-card border border-border/50 rounded-xl p-5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
          >
          <!-- Gradient decorativo -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <!-- Badge de status -->
          <div 
            class="absolute top-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full border"
            :class="{
              'bg-yellow-500/10 text-yellow-600 border-yellow-500/20': agendamento.status === 'pendente',
              'bg-green-500/10 text-green-600 border-green-500/20': agendamento.status === 'concluido',
              'bg-red-500/10 text-red-600 border-red-500/20': agendamento.status === 'cancelado'
            }"
          >
            {{ agendamento.status === 'pendente' ? 'Pendente' : agendamento.status === 'concluido' ? 'Concluído' : 'Cancelado' }}
          </div>

          <div class="relative flex flex-col lg:flex-row gap-4">
            <!-- Coluna Esquerda - Informações Principais -->
            <div class="flex-1 space-y-4">
              <!-- Cliente -->
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</p>
                    <h3 class="text-lg font-bold text-foreground">{{ agendamento.cliente?.nome || 'N/A' }}</h3>
                  </div>
                </div>
                <div class="ml-12 space-y-1.5 bg-muted/30 rounded-lg p-3">
                  <div class="flex items-center space-x-2">
                    <svg class="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="text-sm text-foreground/90">{{ agendamento.cliente?.telefone || 'N/A' }}</span>
                  </div>
                  <div class="flex items-start space-x-2">
                    <svg class="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                    </svg>
                    <p class="text-sm text-foreground/75 leading-snug">{{ agendamento.assunto }}</p>
                  </div>
                </div>
              </div>

              <!-- Atendente -->
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent-foreground to-accent-foreground/70 rounded-lg flex items-center justify-center shadow-md shadow-accent-foreground/20">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Atendente Responsável</p>
                    <h4 class="text-base font-bold text-foreground">{{ agendamento.atendente?.nome || 'N/A' }}</h4>
                  </div>
                </div>
                <div class="ml-12 bg-muted/30 rounded-lg p-3">
                  <div class="flex items-center space-x-2">
                    <svg class="w-3.5 h-3.5 text-accent-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="text-sm text-foreground/90">{{ agendamento.atendente?.telefone || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Coluna Direita - Data, Hora e Ações -->
            <div class="flex flex-col items-center lg:items-end justify-between space-y-4 lg:w-56">
              <!-- Data e Hora -->
              <div class="space-y-3 w-full">
                <div class="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-3 border border-primary/20">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</p>
                      <p class="text-base font-bold text-foreground">{{ formatarData(agendamento.data_agendamento) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-md border border-border/50">
                      <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Horário</p>
                      <p class="text-base font-bold text-foreground">{{ agendamento.hora_agendamento }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ações -->
              <div class="flex items-center gap-2 w-full lg:justify-end">
                <button 
                  @click="atualizarStatus(agendamento.id, agendamento.status === 'pendente' ? 'concluido' : 'pendente')"
                  class="flex-1 lg:flex-initial px-3 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-medium text-sm border border-primary/20 hover:shadow-md hover:shadow-primary/20" 
                  :title="agendamento.status === 'pendente' ? 'Marcar como concluído' : 'Marcar como pendente'"
                >
                  <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
                <button 
                  @click="confirmarExclusao(agendamento.id)"
                  class="flex-1 lg:flex-initial px-3 py-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-200 font-medium text-sm border border-destructive/20 hover:shadow-md hover:shadow-destructive/20" 
                  title="Excluir"
                >
                  <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensagem quando não há agendamentos -->
        <div v-if="agendamentos.length === 0" class="text-center py-12 bg-card border border-border rounded-lg">
          <svg class="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum agendamento encontrado</h3>
          <p class="text-sm text-muted-foreground mb-4">Crie seu primeiro agendamento clicando no botão acima</p>
        </div>
        </div>
      </div>

      <!-- Modal de Novo Cliente -->
      <NovoClienteModal 
        :isOpen="showModalNovoCliente" 
        @close="showModalNovoCliente = false"
        @clienteCriado="aoClienteCriado($event)"
      />

      <!-- Modal de Novo Atendente -->
      <NovoAtendenteModal 
        :isOpen="showModalNovoAtendente" 
        @close="showModalNovoAtendente = false"
        @atendenteCriado="aoAtendenteCriado($event)"
      />

      <!-- Modal de Novo Agendamento -->
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="fecharModal">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <!-- Overlay -->
          <div class="fixed inset-0 transition-opacity bg-black/50" @click="fecharModal"></div>

          <!-- Modal -->
          <div class="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-xl border border-border">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-foreground">Novo Agendamento</h2>
              <button @click="fecharModal" class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Formulário -->
            <form @submit.prevent="salvarAgendamento" class="space-y-6">
              <!-- Seção Cliente -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-foreground flex items-center">
                  <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Cliente
                </h3>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Selecione o Cliente *</label>
                  <div class="flex gap-2">
                    <div class="flex-1 relative">
                      <!-- Input de busca -->
                      <div class="relative">
                        <input
                          v-model="buscaCliente"
                          @focus="mostrarListaClientes = true"
                          @blur="ocultarListaClientes"
                          type="text"
                          placeholder="Buscar cliente por nome ou telefone..."
                          class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      
                      <!-- Lista de clientes filtrados -->
                      <div 
                        v-if="mostrarListaClientes && clientesFiltrados.length > 0"
                        class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        <button
                          v-for="cliente in clientesFiltrados"
                          :key="cliente.id"
                          @mousedown.prevent="selecionarCliente(cliente)"
                          type="button"
                          class="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors border-b border-border/50 last:border-b-0"
                          :class="{ 'bg-primary/20': form.cliente_id === cliente.id }"
                        >
                          <div class="font-medium text-foreground">{{ cliente.nome }}</div>
                          <div class="text-sm text-muted-foreground">{{ cliente.telefone }}</div>
                        </button>
                      </div>
                      
                      <!-- Mensagem quando não há resultados -->
                      <div 
                        v-if="mostrarListaClientes && buscaCliente && clientesFiltrados.length === 0"
                        class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-3 text-center text-sm text-muted-foreground"
                      >
                        Nenhum cliente encontrado
                      </div>
                    </div>
                    
                    <button
                      @click="abrirModalNovoCliente"
                      type="button"
                      class="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-colors font-medium text-sm border border-primary/20 whitespace-nowrap"
                      title="Criar novo cliente"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Cliente selecionado -->
                  <div v-if="clienteSelecionado" class="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-sm font-medium text-foreground">Cliente selecionado:</div>
                        <div class="text-sm text-foreground">{{ clienteSelecionado.nome }} - {{ clienteSelecionado.telefone }}</div>
                      </div>
                      <button
                        @click="limparClienteSelecionado"
                        type="button"
                        class="p-1 rounded-md hover:bg-primary/20 transition-colors"
                        title="Remover seleção"
                      >
                        <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Assunto *</label>
                  <textarea 
                    v-model="form.assunto" 
                    placeholder="Ex: Discutir proposta de projeto..."
                    class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[100px]"
                  />
                </div>
              </div>

              <!-- Divisor -->
              <div class="border-t border-border"></div>

              <!-- Seção Atendente -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-foreground flex items-center">
                  <svg class="w-5 h-5 mr-2 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Atendente
                </h3>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Selecione o Atendente *</label>
                  <div class="flex gap-2">
                    <div class="flex-1 relative">
                      <!-- Input de busca -->
                      <div class="relative">
                        <input
                          v-model="buscaAtendente"
                          @focus="mostrarListaAtendentes = true"
                          @blur="ocultarListaAtendentes"
                          type="text"
                          placeholder="Buscar atendente por nome ou telefone..."
                          class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      
                      <!-- Lista de atendentes filtrados -->
                      <div 
                        v-if="mostrarListaAtendentes && atendentesFiltrados.length > 0"
                        class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        <button
                          v-for="atendente in atendentesFiltrados"
                          :key="atendente.id"
                          @mousedown.prevent="selecionarAtendente(atendente)"
                          type="button"
                          class="w-full text-left px-3 py-2 hover:bg-accent-foreground/10 transition-colors border-b border-border/50 last:border-b-0"
                          :class="{ 'bg-accent-foreground/20': form.atendente_id === atendente.id }"
                        >
                          <div class="font-medium text-foreground">{{ atendente.nome }}</div>
                          <div class="text-sm text-muted-foreground">{{ atendente.telefone }}</div>
                        </button>
                      </div>
                      
                      <!-- Mensagem quando não há resultados -->
                      <div 
                        v-if="mostrarListaAtendentes && buscaAtendente && atendentesFiltrados.length === 0"
                        class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-3 text-center text-sm text-muted-foreground"
                      >
                        Nenhum atendente encontrado
                      </div>
                    </div>
                    
                    <button
                      @click="abrirModalNovoAtendente"
                      type="button"
                      class="px-4 py-2 bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground hover:text-white rounded-md transition-colors font-medium text-sm border border-accent-foreground/20 whitespace-nowrap"
                      title="Criar novo atendente"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Atendente selecionado -->
                  <div v-if="atendenteSelecionado" class="mt-2 p-3 bg-accent-foreground/10 border border-accent-foreground/20 rounded-md">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-sm font-medium text-foreground">Atendente selecionado:</div>
                        <div class="text-sm text-foreground">{{ atendenteSelecionado.nome }} - {{ atendenteSelecionado.telefone }}</div>
                      </div>
                      <button
                        @click="limparAtendenteSelecionado"
                        type="button"
                        class="p-1 rounded-md hover:bg-accent-foreground/20 transition-colors"
                        title="Remover seleção"
                      >
                        <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Divisor -->
              <div class="border-t border-border"></div>

              <!-- Seção Data e Hora -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-foreground flex items-center">
                  <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Data e Horário
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Data *</label>
                    <input
                      v-model="form.data_agendamento"
                      type="date"
                      class="w-full rounded-md bg-secondary text-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Hora *</label>
                    <input
                      v-model="form.hora_agendamento"
                      type="time"
                      class="w-full rounded-md bg-secondary text-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Botões -->
              <div class="flex items-center justify-end space-x-3 pt-4">
                <AppButton @click="fecharModal" variant="outline" type="button">
                  Cancelar
                </AppButton>
                <AppButton variant="primary" type="submit">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Criar Agendamento
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
