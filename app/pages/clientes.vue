<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const isLoading = ref(true)
const error = ref('')
const showModalNovoCliente = ref(false)
const clientes = ref<any[]>([])

// Função para carregar clientes
const carregarClientes = async () => {
  if (!process.client) return
  
  try {
    const supabase = useSupabaseClient()
    
    isLoading.value = true
    error.value = ''
    
    // Busca clientes diretamente
    const { data, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    clientes.value = data || []
  } catch (e) {
    error.value = 'Erro ao carregar clientes.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// Carrega dados no mount
onMounted(async () => {
  await carregarClientes()
})

// Quando cliente é criado, recarregar a página
const aoClienteCriado = async () => {
  showModalNovoCliente.value = false
  // Recarrega a página para mostrar o novo cliente
  window.location.reload()
}

// Disponibilizar função globalmente para o componente filho
provide('recarregarClientes', carregarClientes)
</script>

<template>
  <div>
    <!-- Loading enquanto carrega -->
    <AppLoading 
      v-if="isLoading" 
      title="Carregando Clientes"
      description="Preparando visão geral dos clientes..."
    />
    <!-- Conteúdo após carregamento -->
    <div v-else class="space-y-6">
      <!-- Header com botão de adicionar -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Clientes
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Gerencie seus clientes cadastrados
          </p>
        </div>
        <button
          @click="showModalNovoCliente = true"
          class="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Novo Cliente</span>
        </button>
      </div>

      <ClientesManager :clientes="clientes" />
      <div v-if="error" class="text-red-500 text-center">{{ error }}</div>

      <!-- Modal de Novo Cliente -->
      <NovoClienteModal 
        :isOpen="showModalNovoCliente" 
        @close="showModalNovoCliente = false"
        @clienteCriado="aoClienteCriado"
      />
    </div>
  </div>
</template>
