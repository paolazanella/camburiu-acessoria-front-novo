<template>
    <div class="teste-perfil">
        <div class="debug-container">
            <h1>🔍 Debug - Teste de Perfil</h1>
            
            <!-- Status da Conexão -->
            <div class="status-section">
                <h2>📡 Status da Conexão</h2>
                <div class="status-card">
                    <p><strong>Token:</strong> {{ tokenStatus }}</p>
                    <p><strong>API URL:</strong> {{ apiUrl }}</p>
                    <p><strong>Usuário Local:</strong> {{ usuarioLocal?.nome || 'Não encontrado' }}</p>
                </div>
            </div>

            <!-- Teste Manual -->
            <div class="teste-section">
                <h2>🧪 Teste Manual</h2>
                <div class="button-grid">
                    <button @click="testarConexaoAPI" class="btn-test" :disabled="testando">
                        {{ testando ? '⏳ Testando...' : '🔗 Testar Conexão API' }}
                    </button>
                    
                    <button @click="testarLogin" class="btn-test">
                        🔑 Testar Login
                    </button>
                    
                    <button @click="testarPerfilAPI" class="btn-test" :disabled="carregandoPerfil">
                        {{ carregandoPerfil ? '⏳ Carregando...' : '👤 Testar Perfil API' }}
                    </button>
                    
                    <button @click="limparDados" class="btn-clear">
                        🗑️ Limpar Dados
                    </button>
                </div>
            </div>

            <!-- Logs -->
            <div class="logs-section">
                <h2>📋 Logs</h2>
                <div class="logs-container">
                    <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-message">{{ log.message }}</span>
                    </div>
                </div>
                <button @click="limparLogs" class="btn-clear-logs">Limpar Logs</button>
            </div>

            <!-- Resultado do Perfil -->
            <div v-if="perfilTeste" class="perfil-section">
                <h2>👤 Dados do Perfil</h2>
                <div class="perfil-card">
                    <pre>{{ JSON.stringify(perfilTeste, null, 2) }}</pre>
                </div>
            </div>

            <!-- Voltar -->
            <div class="nav-section">
                <button @click="$router.push('/main')" class="btn-voltar">
                    ← Voltar para Main
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import userService from '@/services/userService'
import authService from '@/services/authService'
import api from '@/services/api'

export default {
    name: "TestePerfilView",
    data() {
        return {
            testando: false,
            carregandoPerfil: false,
            perfilTeste: null,
            logs: [],
            tokenStatus: 'Verificando...',
            apiUrl: 'http://localhost:3333',
            usuarioLocal: null
        }
    },
    mounted() {
        this.verificarStatus()
    },
    methods: {
        verificarStatus() {
            // Verificar token
            const token = localStorage.getItem('token')
            this.tokenStatus = token ? `✅ Existe (${token.substring(0, 20)}...)` : '❌ Não encontrado'
            
            // Verificar usuário local
            try {
                const userData = localStorage.getItem('user')
                this.usuarioLocal = userData ? JSON.parse(userData) : null
            } catch (error) {
                this.usuarioLocal = null
            }
            
            this.addLog('info', 'Status verificado')
        },

        async testarConexaoAPI() {
            this.testando = true
            this.addLog('info', 'Testando conexão com a API...')
            
            try {
                // Teste simples - endpoint público
                const response = await fetch('http://localhost:3333/api/authenticate', {
                    method: 'OPTIONS'
                })
                
                this.addLog('success', `✅ API respondeu - Status: ${response.status}`)
                
                // Teste com token
                const token = localStorage.getItem('token')
                if (token) {
                    const testResponse = await api.get('/usuarios/me')
                    this.addLog('success', '✅ Endpoint /usuarios/me acessível')
                } else {
                    this.addLog('warning', '⚠️ Sem token para testar endpoints protegidos')
                }
                
            } catch (error) {
                this.addLog('error', `❌ Erro de conexão: ${error.message}`)
                console.error('Erro de conexão:', error)
            } finally {
                this.testando = false
            }
        },

        async testarLogin() {
            this.addLog('info', 'Testando login...')
            
            try {
                const response = await authService.login('admin@email.com', '123456')
                this.addLog('success', '✅ Login realizado com sucesso')
                this.verificarStatus()
            } catch (error) {
                this.addLog('error', `❌ Erro no login: ${error.message}`)
            }
        },

        async testarPerfilAPI() {
            this.carregandoPerfil = true
            this.addLog('info', 'Testando carregamento do perfil...')
            
            try {
                const perfil = await userService.obterPerfilLogado()
                this.perfilTeste = perfil
                this.addLog('success', `✅ Perfil carregado: ${perfil.nome}`)
            } catch (error) {
                this.addLog('error', `❌ Erro ao carregar perfil: ${error.message}`)
                console.error('Erro detalhado:', error)
            } finally {
                this.carregandoPerfil = false
            }
        },

        limparDados() {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.perfilTeste = null
            this.verificarStatus()
            this.addLog('info', '🗑️ Dados locais limpos')
        },

        addLog(type, message) {
            const time = new Date().toLocaleTimeString()
            this.logs.unshift({ type, message, time })
            
            // Manter apenas os últimos 50 logs
            if (this.logs.length > 50) {
                this.logs = this.logs.slice(0, 50)
            }
        },

        limparLogs() {
            this.logs = []
        }
    }
}
</script>

<style scoped>
.teste-perfil {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
}

.debug-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.debug-container > div {
    padding: 25px;
    border-bottom: 1px solid #e9ecef;
}

.debug-container > div:last-child {
    border-bottom: none;
}

h1 {
    margin: 0 0 20px 0;
    color: #333;
    text-align: center;
}

h2 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.2rem;
}

.status-card, .perfil-card {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #2E8B57;
}

.button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.btn-test, .btn-clear, .btn-voltar, .btn-clear-logs {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-test {
    background: #2E8B57;
    color: white;
}

.btn-test:hover:not(:disabled) {
    background: #246b47;
}

.btn-test:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.btn-clear {
    background: #dc3545;
    color: white;
}

.btn-clear:hover {
    background: #c82333;
}

.btn-voltar {
    background: #6c757d;
    color: white;
}

.btn-voltar:hover {
    background: #5a6268;
}

.btn-clear-logs {
    background: #17a2b8;
    color: white;
    margin-top: 10px;
}

.logs-container {
    max-height: 300px;
    overflow-y: auto;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
}

.log-item {
    display: flex;
    gap: 15px;
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
}

.log-item.success {
    background: #d4edda;
    border-left: 3px solid #28a745;
}

.log-item.error {
    background: #f8d7da;
    border-left: 3px solid #dc3545;
}

.log-item.warning {
    background: #fff3cd;
    border-left: 3px solid #ffc107;
}

.log-item.info {
    background: #cce7ff;
    border-left: 3px solid #17a2b8;
}

.log-time {
    color: #6c757d;
    min-width: 80px;
}

.log-message {
    flex: 1;
}

.perfil-card pre {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0;
    white-space: pre-wrap;
}

@media (max-width: 768px) {
    .teste-perfil {
        padding: 15px;
    }
    
    .button-grid {
        grid-template-columns: 1fr;
    }
}
</style>