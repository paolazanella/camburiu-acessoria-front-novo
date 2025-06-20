<template>
    <div class="main-container">
        <h1>Sistema de Clientes</h1>
        
        <!-- Botão para testar a conexão -->
        <div class="test-section">
            <button @click="testarConexaoSimples" :disabled="testando">
                {{ testando ? 'Testando...' : 'Testar Conexão Backend' }}
            </button>
            
            <div v-if="resultadoTeste" class="resultado">
                <h3>Resultado do Teste:</h3>
                <pre>{{ JSON.stringify(resultadoTeste, null, 2) }}</pre>
            </div>
        </div>

        <!-- Seção de clientes -->
        <div class="clientes-section">
            <div class="header-clientes">
                <h2>Clientes Cadastrados</h2>
                <button @click="carregarClientesAgora" :disabled="carregando">
                    {{ carregando ? 'Carregando...' : 'Carregar Clientes' }}
                </button>
            </div>

            <!-- Loading -->
            <div v-if="carregando" class="loading">
                Carregando clientes...
            </div>

            <!-- Erro -->
            <div v-if="erro" class="erro">
                <strong>Erro:</strong> {{ erro }}
            </div>

            <!-- Lista de clientes -->
            <div v-if="!carregando && !erro && clientes.length > 0" class="lista-clientes">
                <div v-for="cliente in clientes" :key="cliente.id" class="cliente-card">
                    <h3>{{ cliente.nome }}</h3>
                    <p><strong>ID:</strong> {{ cliente.id }}</p>
                    <p><strong>CPF/CNPJ:</strong> {{ cliente.cpfOuCnpj }}</p>
                    <p><strong>Telefone:</strong> {{ cliente.telefone }}</p>
                    
                    <div v-if="cliente.veiculos && cliente.veiculos.length > 0">
                        <h4>Veículos:</h4>
                        <ul>
                            <li v-for="veiculo in cliente.veiculos" :key="veiculo.id">
                                Placa: {{ veiculo.placa }} | RENAVAM: {{ veiculo.renavam }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Sem clientes -->
            <div v-if="!carregando && !erro && clientes.length === 0" class="sem-clientes">
                <p>Nenhum cliente encontrado ou ainda não carregado.</p>
            </div>
        </div>

        <!-- Debug de token -->
        <div class="debug-token">
            <h3>Debug Token:</h3>
            <p><strong>Token existe:</strong> {{ !!token }}</p>
            <p v-if="token"><strong>Token:</strong> {{ token.substring(0, 50) }}...</p>
            <p><strong>URL da API:</strong> http://localhost:3333/clientes</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: "MainView",
    data() {
        return {
            clientes: [],
            carregando: false,
            erro: null,
            testando: false,
            resultadoTeste: null
        }
    },
    computed: {
        token() {
            return localStorage.getItem('token')
        }
    },
    async mounted() {
        console.log('🔄 MainView montado')
        console.log('🔑 Token:', this.token ? 'Existe' : 'Não existe')
        
        // Carregar clientes automaticamente
        await this.carregarClientesAgora()
    },
    methods: {
        async testarConexaoSimples() {
            this.testando = true
            this.resultadoTeste = null

            try {
                console.log('🧪 Testando conexão direta...')
                
                const response = await fetch('http://localhost:3333/clientes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                console.log('📡 Response status:', response.status)
                console.log('📡 Response headers:', response.headers)

                if (response.ok) {
                    const data = await response.json()
                    console.log('✅ Dados recebidos:', data)
                    
                    this.resultadoTeste = {
                        sucesso: true,
                        status: response.status,
                        dados: data
                    }
                } else {
                    const errorText = await response.text()
                    console.log('❌ Erro na resposta:', errorText)
                    
                    this.resultadoTeste = {
                        sucesso: false,
                        status: response.status,
                        erro: errorText
                    }
                }

            } catch (error) {
                console.error('❌ Erro na requisição:', error)
                this.resultadoTeste = {
                    sucesso: false,
                    erro: error.message
                }
            } finally {
                this.testando = false
            }
        },

        async carregarClientesAgora() {
            this.carregando = true
            this.erro = null

            try {
                console.log('👥 Carregando clientes...')
                console.log('🔑 Usando token:', this.token ? 'Sim' : 'Não')

                // Método 1: Usando fetch direto
                const response = await fetch('http://localhost:3333/clientes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                console.log('📡 Status da resposta:', response.status)

                if (response.ok) {
                    const clientes = await response.json()
                    console.log('✅ Clientes recebidos:', clientes)
                    this.clientes = clientes
                } else {
                    const errorText = await response.text()
                    console.log('❌ Erro:', response.status, errorText)
                    this.erro = `Erro ${response.status}: ${errorText}`
                }

            } catch (error) {
                console.error('❌ Erro ao carregar clientes:', error)
                this.erro = `Erro de conexão: ${error.message}`
            } finally {
                this.carregando = false
            }
        }
    }
}
</script>

<style scoped>
.main-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.test-section {
    background: #e9ecef;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
}

.test-section button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.test-section button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.resultado {
    margin-top: 15px;
    background: white;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.resultado pre {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 3px;
    overflow-x: auto;
    white-space: pre-wrap;
}

.clientes-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-clientes {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-clientes button {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

.header-clientes button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-size: 18px;
}

.erro {
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #f5c6cb;
}

.lista-clientes {
    display: grid;
    gap: 20px;
}

.cliente-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background: #f8f9fa;
}

.cliente-card h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
}

.cliente-card p {
    margin: 8px 0;
}

.cliente-card h4 {
    margin: 15px 0 10px 0;
    color: #495057;
}

.cliente-card ul {
    margin: 0;
    padding-left: 20px;
}

.cliente-card li {
    margin: 5px 0;
}

.sem-clientes {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
}

.debug-token {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 15px;
    margin-top: 30px;
}

.debug-token h3 {
    margin: 0 0 10px 0;
    color: #856404;
}

.debug-token p {
    margin: 5px 0;
    color: #856404;
}
</style>