<script setup lang="ts">
// Página acessível independente de autenticação
// Removido middleware para permitir acesso após cadastro

// Meta tags para SEO
useHead({
  title: 'Obrigado - Agzap Agendamentos',
  meta: [
    { name: 'description', content: 'Obrigado por se cadastrar no Agzap Agendamentos' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <ThankYouCard />
</template>
