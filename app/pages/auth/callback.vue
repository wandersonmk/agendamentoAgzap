<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: [] // Sem middleware para não bloquear o callback
})

const route = useRoute()
const { reloadSession } = useAuth()

onMounted(async () => {
  console.log('[Auth Callback] Processando confirmação de email...')
  
  // Aguardar um pouco para garantir que o token foi processado
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Recarregar a sessão para pegar o usuário autenticado
  const hasSession = await reloadSession()
  
  if (hasSession) {
    console.log('[Auth Callback] Sessão confirmada, redirecionando para dashboard')
    await navigateTo('/pedidos')
  } else {
    console.log('[Auth Callback] Falha ao confirmar sessão, redirecionando para login')
    await navigateTo('/login')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <AppLoading />
      <p class="mt-4 text-muted-foreground">Confirmando seu email...</p>
    </div>
  </div>
</template>
