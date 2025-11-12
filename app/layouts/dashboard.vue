<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header com navegação -->
    <AppHeader />
    
    <!-- Conteúdo principal -->
    <main class="flex-1">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Conteúdo da página -->
        <slot />
      </div>
    </main>
    
    <!-- Footer global -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Layout dashboard simplificado - navegação no header
</script>
