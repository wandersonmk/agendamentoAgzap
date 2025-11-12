<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] overflow-y-auto" @click.self="fechar">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity bg-black/60" @click="fechar"></div>

      <!-- Modal -->
      <div class="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-xl border border-border">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-foreground">Novo Atendente</h2>
          <button @click="fechar" class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="salvar" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nome *</label>
            <input
              v-model="form.nome"
              type="text"
              placeholder="Ex: Maria Santos"
              class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Telefone *</label>
            <input
              v-model="telefoneFormatado"
              @input="aplicarMascaraTelefone"
              type="tel"
              placeholder="(00) 00000-0000"
              maxlength="15"
              class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="maria@exemplo.com"
              class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Especialidade</label>
            <input
              v-model="form.especialidade"
              type="text"
              placeholder="Ex: Vendas, Suporte, Técnico"
              class="w-full rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <!-- Botões -->
          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              @click="fechar"
              type="button"
              class="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isLoading || !form.nome || !form.telefone"
              class="px-4 py-2 bg-accent-foreground text-white rounded-lg hover:bg-accent-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Salvando...</span>
              <span v-else>Salvar Atendente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  atendenteCriado: [atendente: any]
}>()

const toast = await useToastSafe()
const supabase = useSupabaseClient()

const isLoading = ref(false)
const telefoneFormatado = ref('')
const form = ref({
  nome: '',
  telefone: '',
  email: '',
  especialidade: '',
  ativo: true
})

// Função para aplicar máscara de telefone
const aplicarMascaraTelefone = (event: Event) => {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '') // Remove tudo que não é dígito
  
  // Limita a 11 dígitos
  if (valor.length > 11) {
    valor = valor.slice(0, 11)
  }
  
  // Aplica a máscara
  if (valor.length <= 10) {
    // Formato: (00) 0000-0000
    valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
  } else {
    // Formato: (00) 00000-0000
    valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
  }
  
  telefoneFormatado.value = valor
  // Salva apenas os números no form
  form.value.telefone = valor.replace(/\D/g, '')
}

const fechar = () => {
  limparFormulario()
  emit('close')
}

const limparFormulario = () => {
  form.value = {
    nome: '',
    telefone: '',
    email: '',
    especialidade: '',
    ativo: true
  }
  telefoneFormatado.value = ''
}

const salvar = async () => {
  if (!form.value.nome || !form.value.telefone) {
    toast?.error('Preencha os campos obrigatórios')
    return
  }

  isLoading.value = true
  try {
    // Buscar empresa_id do usuário logado
    const { data: empresaId, error: empresaError } = await supabase
      .rpc('get_user_empresa_id')

    if (empresaError) {
      throw new Error('Erro ao identificar sua empresa')
    }

    // Inserir atendente com empresa_id
    const { data, error } = await supabase
      .from('atendentes')
      .insert([{
        ...form.value,
        empresa_id: empresaId
      }])
      .select()
      .single()

    if (error) throw error

    toast?.success('Atendente criado com sucesso!')
    emit('atendenteCriado', data)
    fechar()
  } catch (error: any) {
    console.error('Erro ao criar atendente:', error)
    toast?.error(error?.message || 'Erro ao criar atendente')
  } finally {
    isLoading.value = false
  }
}
</script>
