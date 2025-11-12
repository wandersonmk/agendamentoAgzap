<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Estado de carregamento inicial
const isLoading = ref(true)

// Estado do modal de novo agendamento
const showModal = ref(false)

// Formulário de agendamento
const form = ref({
  // Cliente
  clienteNome: '',
  clienteTelefone: '',
  assunto: '',
  // Atendente
  atendenteNome: '',
  atendenteTelefone: '',
  // Data e hora
  dataAgendamento: '',
  horaAgendamento: ''
})

// Filtros
const filtros = ref({
  busca: '',
  status: 'todos',
  dataInicio: '',
  dataFim: ''
})

// Lista de agendamentos (mockado)
const agendamentosMock = ref([
  {
    id: 1,
    clienteNome: 'João Silva',
    clienteTelefone: '(11) 98765-4321',
    assunto: 'Discutir proposta de projeto',
    atendenteNome: 'Maria Santos',
    atendenteTelefone: '(11) 91234-5678',
    dataAgendamento: '2025-01-15',
    horaAgendamento: '14:30',
    status: 'pendente'
  },
  {
    id: 2,
    clienteNome: 'Ana Costa',
    clienteTelefone: '(21) 99876-5432',
    assunto: 'Renovação de contrato',
    atendenteNome: 'Carlos Oliveira',
    atendenteTelefone: '(21) 98765-4321',
    dataAgendamento: '2025-01-16',
    horaAgendamento: '10:00',
    status: 'pendente'
  },
  {
    id: 3,
    clienteNome: 'Pedro Almeida',
    clienteTelefone: '(11) 93456-7890',
    assunto: 'Consultoria técnica',
    atendenteNome: 'Maria Santos',
    atendenteTelefone: '(11) 91234-5678',
    dataAgendamento: '2025-01-14',
    horaAgendamento: '09:00',
    status: 'concluido'
  }
])

// Computed para filtrar agendamentos
const agendamentos = computed(() => {
  let resultado = agendamentosMock.value

  // Filtro por busca (nome do cliente, telefone ou assunto)
  if (filtros.value.busca.trim()) {
    const busca = filtros.value.busca.toLowerCase()
    resultado = resultado.filter(ag => 
      ag.clienteNome.toLowerCase().includes(busca) ||
      ag.clienteTelefone.toLowerCase().includes(busca) ||
      ag.assunto.toLowerCase().includes(busca) ||
      ag.atendenteNome.toLowerCase().includes(busca)
    )
  }

  // Filtro por status
  if (filtros.value.status !== 'todos') {
    resultado = resultado.filter(ag => ag.status === filtros.value.status)
  }

  // Filtro por data inicial
  if (filtros.value.dataInicio) {
    resultado = resultado.filter(ag => ag.dataAgendamento >= filtros.value.dataInicio)
  }

  // Filtro por data final
  if (filtros.value.dataFim) {
    resultado = resultado.filter(ag => ag.dataAgendamento <= filtros.value.dataFim)
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

// Aguarda a autenticação ser carregada
onMounted(async () => {
  if (process.client) {
    // Inicializa auth no cliente
    const { isLoading: authLoading } = useAuth()
    
    // Aguarda autenticação
    while (authLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 300))
  isLoading.value = false
})

// Abrir modal
const abrirModal = () => {
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
    clienteNome: '',
    clienteTelefone: '',
    assunto: '',
    atendenteNome: '',
    atendenteTelefone: '',
    dataAgendamento: '',
    horaAgendamento: ''
  }
}

// Salvar agendamento (apenas visual por enquanto)
const salvarAgendamento = () => {
  // Validação básica
  if (!form.value.clienteNome || !form.value.clienteTelefone || !form.value.assunto || 
      !form.value.atendenteNome || !form.value.atendenteTelefone || 
      !form.value.dataAgendamento || !form.value.horaAgendamento) {
    alert('Por favor, preencha todos os campos!')
    return
  }

  // Adiciona à lista (temporário)
  const novoAgendamento = {
    id: agendamentosMock.value.length + 1,
    ...form.value,
    status: 'pendente'
  }
  
  agendamentosMock.value.unshift(novoAgendamento)
  fecharModal()
  
  // Feedback visual
  console.log('Agendamento criado:', novoAgendamento)
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
          <div class="absolute top-3 right-3 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
            Pendente
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
                    <h3 class="text-lg font-bold text-foreground">{{ agendamento.clienteNome }}</h3>
                  </div>
                </div>
                <div class="ml-12 space-y-1.5 bg-muted/30 rounded-lg p-3">
                  <div class="flex items-center space-x-2">
                    <svg class="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="text-sm text-foreground/90">{{ agendamento.clienteTelefone }}</span>
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
                    <h4 class="text-base font-bold text-foreground">{{ agendamento.atendenteNome }}</h4>
                  </div>
                </div>
                <div class="ml-12 bg-muted/30 rounded-lg p-3">
                  <div class="flex items-center space-x-2">
                    <svg class="w-3.5 h-3.5 text-accent-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="text-sm text-foreground/90">{{ agendamento.atendenteTelefone }}</span>
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
                      <p class="text-base font-bold text-foreground">{{ formatarData(agendamento.dataAgendamento) }}</p>
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
                      <p class="text-base font-bold text-foreground">{{ agendamento.horaAgendamento }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ações -->
              <div class="flex items-center gap-2 w-full lg:justify-end">
                <button class="flex-1 lg:flex-initial px-3 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-medium text-sm border border-primary/20 hover:shadow-md hover:shadow-primary/20" title="Editar">
                  <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="flex-1 lg:flex-initial px-3 py-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-200 font-medium text-sm border border-destructive/20 hover:shadow-md hover:shadow-destructive/20" title="Excluir">
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
                  Dados do Cliente
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Nome do Cliente *</label>
                    <AppInput v-model="form.clienteNome" placeholder="Ex: João Silva" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Telefone do Cliente *</label>
                    <AppInput v-model="form.clienteTelefone" placeholder="(00) 00000-0000" />
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
                  Dados do Atendente
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Nome do Atendente *</label>
                    <AppInput v-model="form.atendenteNome" placeholder="Ex: Maria Santos" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Telefone do Atendente *</label>
                    <AppInput v-model="form.atendenteTelefone" placeholder="(00) 00000-0000" />
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
                  Agendamento
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Data *</label>
                    <AppInput v-model="form.dataAgendamento" type="date" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Hora *</label>
                    <AppInput v-model="form.horaAgendamento" type="time" />
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
