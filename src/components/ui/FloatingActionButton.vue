<template>
    <div class="fab-container">
        <!-- Botão Principal -->
        <button 
            @click="toggleMenu" 
            class="fab-main"
            :class="{ 'active': isMenuOpen }"
        >
            <span class="fab-icon">{{ isMenuOpen ? '✕' : '➕' }}</span>
        </button>

        <!-- Menu de Opções -->
        <div class="fab-menu" :class="{ 'open': isMenuOpen }">
            <button 
                @click="navigateTo('/cadastro-cliente-veiculo')"
                class="fab-option"
                title="Novo Cliente com Veículo"
            >
                <span class="fab-option-icon">👤</span>
                <span class="fab-option-text">Cliente</span>
            </button>

            <button 
                @click="navigateTo('/cadastro-veiculo')"
                class="fab-option"
                title="Novo Veículo"
            >
                <span class="fab-option-icon">🚗</span>
                <span class="fab-option-text">Veículo</span>
            </button>

            <button 
                @click="refreshData"
                class="fab-option"
                title="Atualizar Dados"
                :disabled="loading"
            >
                <span class="fab-option-icon" :class="{ 'spinning': loading }">🔄</span>
                <span class="fab-option-text">{{ loading ? 'Atualizando' : 'Atualizar' }}</span>
            </button>
        </div>

        <!-- Backdrop -->
        <div 
            v-if="isMenuOpen" 
            class="fab-backdrop" 
            @click="closeMenu"
        ></div>
    </div>
</template>

<script>
export default {
    name: 'FloatingActionButton',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isMenuOpen: false
        }
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen
        },

        closeMenu() {
            this.isMenuOpen = false
        },

        navigateTo(route) {
            this.closeMenu()
            this.$router.push(route)
        },

        refreshData() {
            this.closeMenu()
            this.$emit('refresh')
        }
    },
    mounted() {
        // Fechar menu ao pressionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu()
            }
        })
    }
}
</script>

<style scoped>
.fab-container {
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 1000;
}

.fab-main {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2E8B57, #228B22);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 20px rgba(46, 139, 87, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1002;
}

.fab-main:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(46, 139, 87, 0.6);
}

.fab-main.active {
    transform: rotate(45deg);
    background: linear-gradient(135deg, #dc3545, #c82333);
}

.fab-icon {
    transition: transform 0.3s ease;
}

.fab-menu {
    position: absolute;
    bottom: 70px;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

.fab-menu.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
}

.fab-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: white;
    color: #333;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 0.9rem;
    min-width: 140px;
    justify-content: flex-start;
}

.fab-option:hover:not(:disabled) {
    transform: translateX(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    background: #f8f9fa;
}

.fab-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.fab-option-icon {
    font-size: 1.2rem;
    min-width: 20px;
    display: flex;
    justify-content: center;
}

.fab-option-icon.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.fab-option-text {
    font-weight: 500;
}

.fab-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1001;
    backdrop-filter: blur(2px);
}

/* Animações de entrada escalonadas */
.fab-menu.open .fab-option:nth-child(1) {
    animation: slideInRight 0.3s ease 0.1s both;
}

.fab-menu.open .fab-option:nth-child(2) {
    animation: slideInRight 0.3s ease 0.2s both;
}

.fab-menu.open .fab-option:nth-child(3) {
    animation: slideInRight 0.3s ease 0.3s both;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .fab-container {
        bottom: 20px;
        right: 15px;
    }

    .fab-main {
        width: 55px;
        height: 55px;
        font-size: 1.3rem;
    }

    .fab-option {
        padding: 10px 16px;
        font-size: 0.85rem;
        min-width: 120px;
    }

    .fab-option-icon {
        font-size: 1.1rem;
    }
}
</style>