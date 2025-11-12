<template>
  <header class="bg-background border-b border-border shadow-sm sticky top-0 z-50">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo da empresa -->
        <div class="flex-shrink-0 flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold text-foreground">{{ nomeEmpresa || 'Sistema de Agendamentos' }}</h1>
              <p class="text-xs text-muted-foreground">Gestão de Agendamentos</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Menu principal - Desktop -->
        <nav class="hidden md:flex items-center space-x-2">
          <NuxtLink 
            to="/"
            class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === '/' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-foreground hover:text-primary hover:bg-muted/50'"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/clientes"
            class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === '/clientes' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-foreground hover:text-primary hover:bg-muted/50'"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Clientes
          </NuxtLink>
          
          <NuxtLink 
            to="/agendamentos"
            class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === '/agendamentos' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-foreground hover:text-primary hover:bg-muted/50'"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Agendamentos
          </NuxtLink>
        </nav>

        <!-- Área direita: Tema + User + Logout -->
        <div class="flex items-center space-x-3">
          <!-- Alternador de tema -->
          <ThemeToggle />

          <!-- Menu mobile -->
          <div class="md:hidden">
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen" 
              class="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Botão de logout -->
          <button 
            @click="handleLogout" 
            class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sair"
          >
            <svg class="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      <!-- Menu mobile expandido -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-border py-3">
        <div class="space-y-1">
          <NuxtLink 
            to="/"
            @click="mobileMenuOpen = false"
            class="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium transition-colors"
            :class="$route.path === '/' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-foreground hover:text-primary hover:bg-muted/50'"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/clientes"
            @click="mobileMenuOpen = false"
            class="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium transition-colors"
            :class="$route.path === '/clientes' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-foreground hover:text-primary hover:bg-muted/50'"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Clientes
          </NuxtLink>
          
          <NuxtLink 
            to="/agendamentos"
            @click="mobileMenuOpen = false"
            class="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium transition-colors"
            :class="$route.path === '/agendamentos' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-foreground hover:text-primary hover:bg-muted/50'"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Agendamentos
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
let toast: any
let signOut: any

// Busca nome da empresa
const { nomeEmpresa, buscarNomeEmpresa } = useEmpresa()

onMounted(async () => {
  toast = await useToastSafe()
  
  // Inicializa auth apenas no cliente
  if (process.client) {
    const auth = useAuth()
    signOut = auth.signOut
    
    // Busca nome da empresa
    await buscarNomeEmpresa()
  }
})

const handleLogout = async () => {
  if (!process.client) return
  
  try {
    if (signOut) {
      await signOut()
    }
    toast?.success('Deslogado com sucesso!')
    await navigateTo('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    toast?.error('Erro ao fazer logout')
  }
}
</script>
