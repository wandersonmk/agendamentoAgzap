<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { useClientes } from '../composables/useClientes'

const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'
const showModalNovoCliente = ref(false)

let clientes = ref([])
let fetchClientesFunc: (() => Promise<void>) | null = null

if (isClient) {
  const { clientes: clientesData, fetchClientes } = useClientes()
  clientes = clientesData
  fetchClientesFunc = fetchClientes
  
  onMounted(async () => {
    isLoading.value = true
    try {
      await fetchClientes()
    } catch (e) {
      error.value = 'Erro ao carregar clientes.'
    }
    isLoading.value = false
  })
} else {
  isLoading.value = false
}

// Quando cliente é criado, recarregar lista
const aoClienteCriado = async () => {
  showModalNovoCliente.value = false
  if (fetchClientesFunc) {
    await fetchClientesFunc()
  }
}
</script>

<template>
  <div>
    <!-- Sempre mostra loading até o client buscar os dados -->
    <AppLoading 
      v-if="isLoading || !isClient" 
      title="Carregando Clientes"
      description="Preparando visão geral dos clientes..."
    />
    <!-- Conteúdo só aparece após carregamento client-side -->
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
