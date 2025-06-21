<template>
  <div id="app">
    <!-- Navegação superior -->
    <nav class="main-nav" v-if="showNavigation" :class="{ 'nav-hidden': isNavHidden }">
      <div class="nav-brand">
        <img src="./assets/camboriuassessoria.png" alt="Camboriú Assessoria" class="nav-logo">
        <span class="brand-text">Sistema de Gestão</span>
      </div>
      
      <div class="nav-menu">
        <router-link to="/main" class="nav-link" title="Página Principal">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        
        <router-link to="/perfil-usuario" class="nav-link" title="Meu Perfil">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Perfil</span>
        </router-link>
        
        <button @click="logout" class="nav-link logout-btn" title="Sair do Sistema">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Sair</span>
        </button>
      </div>
    </nav>

    <!-- Conteúdo principal -->
    <main class="main-content" :class="{ 'with-nav': showNavigation }">
      <router-view />
    </main>
  </div>
</template>

<script>
import AuthService from '@/services/authService'

export default {
  name: 'App',
  data() {
    return {
      lastScrollY: 0,
      isNavHidden: false
    }
  },
  computed: {
    isAuthenticated() {
      return AuthService.isAuthenticated()
    },
    showNavigation() {
      // Não mostrar navegação na tela de login
      return this.$route.name !== 'login' && this.isAuthenticated
    }
  },
  mounted() {
    // Adicionar listener para scroll
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    // Remover listener ao destruir componente
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    logout() {
      if (confirm('Deseja realmente sair do sistema?')) {
        AuthService.logout()
        this.$router.push('/')
      }
    },
    
    handleScroll() {
      const currentScrollY = window.scrollY

      // 🔝 Se está no topo da página (menos de 10px), sempre mostrar
      if (currentScrollY < 10) {
        this.isNavHidden = false
      }
      // 🔽 Se rolou para baixo mais de 100px, esconder navegação
      else if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
        this.isNavHidden = true
      }
      // 🔼 Se rolou para cima, mostrar navegação
      else if (currentScrollY < this.lastScrollY) {
        this.isNavHidden = false
      }

      this.lastScrollY = currentScrollY
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
  background: #f8f9fa;
}

/* Navegação melhorada com hide/show automático no scroll */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  transform: translateY(0);
  opacity: 1;
}

/* 🙈 Estado escondido: navegação desliza para cima quando rola para baixo */
.main-nav.nav-hidden {
  transform: translateY(-100%);
  opacity: 0;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-brand .nav-logo {
  height: 45px;
  width: auto;
  transition: transform 0.3s ease;
}

.nav-brand:hover .nav-logo {
  transform: scale(1.05);
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2E8B57;
  display: none; /* Mostra apenas em telas maiores */
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #1C1C1C;
  font-weight: 600;
  padding: 12px 18px;
  border-radius: 10px;
  transition: all 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: linear-gradient(135deg, #f0f8f5, #e8f5e8);
  color: #2E8B57;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(46, 139, 87, 0.2);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #2E8B57, #228B22);
  color: white;
  box-shadow: 0 4px 15px rgba(46, 139, 87, 0.3);
}

.nav-link.router-link-active:hover {
  background: linear-gradient(135deg, #246b47, #1e7a1e);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 1.1rem;
  min-width: 18px;
  text-align: center;
}

.nav-text {
  font-weight: 600;
  white-space: nowrap;
}

.logout-btn {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
  color: white !important;
  margin-left: 10px;
  border-left: 2px solid rgba(255,255,255,0.2);
  padding-left: 20px !important;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c82333, #b21e2e) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3) !important;
}

/* Conteúdo principal */
.main-content {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.main-content.with-nav {
  min-height: calc(100vh - 80px);
  padding-top: 80px; /* Espaço para a navegação fixa */
}

/* Responsive */
@media (min-width: 768px) {
  .brand-text {
    display: block;
  }
  
  .nav-menu {
    gap: 5px;
  }
}

@media (max-width: 768px) {
  .main-nav {
    padding: 12px 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .nav-brand {
    gap: 10px;
  }
  
  .nav-brand .nav-logo {
    height: 35px;
  }
  
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }
  
  .nav-link {
    padding: 10px 14px;
    font-size: 0.9rem;
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-icon {
    font-size: 1.3rem;
  }
  
  .logout-btn {
    margin-left: 0 !important;
    padding-left: 14px !important;
    border-left: none !important;
  }
  
  /* Ajustar padding do conteúdo para mobile */
  .main-content.with-nav {
    padding-top: 120px; /* Mais espaço no mobile por causa do wrap */
  }
}

@media (max-width: 480px) {
  .main-nav {
    padding: 10px 15px;
  }
  
  .nav-link {
    padding: 8px 12px;
    min-width: 80px;
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
  
  /* Ajustar padding do conteúdo para telas pequenas */
  .main-content.with-nav {
    padding-top: 110px;
  }
}

/* Animações */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-nav {
  animation: slideIn 0.5s ease-out;
}

/* Efeito de destaque no item ativo */
.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: rgba(255,255,255,0.8);
  border-radius: 2px 2px 0 0;
}

/* Hover effects melhorados */
.nav-link:not(.router-link-active):hover {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.nav-link:active {
  transform: translateY(0) scale(0.98);
}
</style>