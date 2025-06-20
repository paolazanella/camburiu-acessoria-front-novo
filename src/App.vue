<template>
  <div id="app">
    <!-- Navegação superior -->
    <nav class="main-nav" v-if="showNavigation">
      <div class="nav-brand">
        <img src="./assets/camboriuassessoria.png" alt="Camboriú Assessoria" class="nav-logo">
      </div>
      
      <div class="nav-menu">
        <router-link to="/main" class="nav-link" v-if="isAuthenticated">Dashboard</router-link>
        <router-link to="/perfil-usuario" class="nav-link" v-if="isAuthenticated">Perfil</router-link>
        <button @click="logout" class="nav-link logout-btn" v-if="isAuthenticated">Sair</button>
      </div>
    </nav>

    <!-- Conteúdo principal -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import AuthService from '@/services/authService'

export default {
  name: 'App',
  computed: {
    isAuthenticated() {
      return AuthService.isAuthenticated()
    },
    showNavigation() {
      // Não mostrar navegação na tela de login
      return this.$route.name !== 'login' && this.isAuthenticated
    }
  },
  methods: {
    logout() {
      if (confirm('Deseja realmente sair do sistema?')) {
        AuthService.logout()
        this.$router.push('/')
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand .nav-logo {
  height: 40px;
  width: auto;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #1C1C1C;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-link:hover {
  background-color: #f0f0f0;
  color: #2E8B57;
}

.nav-link.router-link-active {
  background-color: #2E8B57;
  color: white;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
}

.logout-btn:hover {
  background-color: #c82333;
  color: white;
}

.main-content {
  min-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .main-nav {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>