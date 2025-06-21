<template>
    <div class="perfil-simples">
        <div class="container">
            <h1>👤 Teste de Perfil</h1>
            
            <!-- Loading -->
            <div v-if="carregando" class="loading">
                <div class="spinner"></div>
                <p>Carregando perfil...</p>
            </div>
            
            <!-- Erro -->
            <div v-if="erro" class="erro">
                <h3>❌ Erro</h3>
                <p>{{ erro }}</p>
                <button @click="carregarPerfil" class="btn-retry">🔄 Tentar Novamente</button>
            </div>
            
            <!-- Sucesso -->
            <div v-if="perfil && !carregando" class="sucesso">
                <h3>✅ Perfil Carregado!</h3>
                <div class="perfil-info">
                    <p><strong>ID:</strong> {{ perfil.id }}</p>
                    <p><strong>Nome:</strong> {{ perfil.nome }}</p>
                    <p><strong>Email:</strong> {{ perfil.email }}</p>
                    <p><strong>Status:</strong> {{ perfil.status }} ({{ formatarStatus(perfil.status) }})</p>
                </div>
                
                <div class="acoes">
                    <button @click="carregarPerfil" class="btn-reload">🔄 Recarregar</button>
                    <button @click="$router.push('/main')" class="btn-voltar">← Voltar</button>
                </div>
            </div>
            
            <!-- Debug Info -->
            <div class="debug-info">
                <h4>🔍 Debug Info</h4>
                <p><strong>Token:</strong> {{ tokenInfo }}</p>
                <p><strong>User Local:</strong> {{ userLocal?.nome || 'Não encontrado' }}</p>
                <p><strong>Tentativas:</strong> {{ tentativas }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import userService from '@/services/userService'

export default {
    name: "PerfilUsuarioView",
    data() {
        return {
            carregando: false,
            erro: null,
            perfil: null,
            tentativas: 0,
            tokenInfo: 'Verificando...',
            userLocal: null
        }
    },
    mounted() {
        this.verificarStatus()
        this.carregarPerfil()
    },
    methods: {
        verificarStatus() {
            // Verificar token
            const token = localStorage.getItem('token')
            this.tokenInfo = token ? 'Existe ✅' : 'Não encontrado ❌'
            
            // Verificar usuário local
            try {
                const userData = localStorage.getItem('user')
                this.userLocal = userData ? JSON.parse(userData) : null
            } catch (error) {
                this.userLocal = null
            }
        },

        async carregarPerfil() {
            this.carregando = true
            this.erro = null
            this.tentativas++

            console.log(`🔄 Tentativa ${this.tentativas} de carregar perfil...`)

            try {
                console.log('📞 Chamando userService.obterPerfilLogado()...')
                const perfil = await userService.obterPerfilLogado()
                
                this.perfil = perfil
                console.log('✅ Perfil carregado com sucesso:', perfil)
                
            } catch (error) {
                console.error('❌ Erro ao carregar perfil:', error)
                this.erro = error.message || 'Erro desconhecido ao carregar perfil'
                
                // Debug detalhado
                console.log('Debug do erro:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                })
                
            } finally {
                this.carregando = false
            }
        },

        formatarStatus(status) {
            switch (Number(status)) {
                case 1: return 'Administrador'
                case 2: return 'Usuário'
                default: return 'Desconhecido'
            }
        }
    }
}
</script>

<style scoped>
.perfil-simples {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 20px;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

.loading {
    text-align: center;
    padding: 40px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2E8B57;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.erro {
    text-align: center;
    padding: 20px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    margin-bottom: 20px;
}

.erro h3 {
    color: #856404;
    margin: 0 0 10px 0;
}

.erro p {
    color: #856404;
    margin: 0 0 15px 0;
    word-break: break-word;
}

.sucesso {
    text-align: center;
}

.sucesso h3 {
    color: #28a745;
    margin-bottom: 20px;
}

.perfil-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
}

.perfil-info p {
    margin: 10px 0;
    font-size: 1.1rem;
}

.acoes {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}

.btn-retry, .btn-reload, .btn-voltar {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-retry, .btn-reload {
    background: #2E8B57;
    color: white;
}

.btn-retry:hover, .btn-reload:hover {
    background: #246b47;
}

.btn-voltar {
    background: #6c757d;
    color: white;
}

.btn-voltar:hover {
    background: #5a6268;
}

.debug-info {
    margin-top: 30px;
    padding: 20px;
    background: #f1f3f4;
    border-radius: 8px;
    border-left: 4px solid #17a2b8;
}

.debug-info h4 {
    margin: 0 0 15px 0;
    color: #17a2b8;
}

.debug-info p {
    margin: 8px 0;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    word-break: break-all;
}

@media (max-width: 600px) {
    .perfil-simples {
        padding: 15px;
    }
    
    .container {
        padding: 20px;
    }
    
    .acoes {
        flex-direction: column;
    }
}
</style>