<template>
  <footer class="mt-auto py-4 px-6 border-t border-border bg-muted/30">
    <div class="text-center">
      <p class="text-sm text-muted-foreground">
        © {{ currentYear }} Agzap - Sistema de Agendamentos - Todos os direitos reservados
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Ano atual para o footer
const currentYear = new Date().getFullYear()

// Nome da empresa
const { nomeEmpresa } = useEmpresa()
</script>
