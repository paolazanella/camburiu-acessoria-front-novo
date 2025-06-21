<template>
    <div class="main-container">
        <!-- Header Principal -->
        <div class="header-section">
            <div class="welcome-area">
                <h1>Sistema de Gestão</h1>
                <p class="subtitle">Gerencie clientes e veículos de forma eficiente</p>
            </div>

            <!-- Estatísticas Rápidas -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>{{ clientes.length }}</h3>
                        <p>Clientes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🚗</div>
                    <div class="stat-info">
                        <h3>{{ totalVeiculos }}</h3>
                        <p>Veículos</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-info">
                        <h3>{{ veiculosVencendo }}</h3>
                        <p>Vencendo</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="actions-section">
            <h2>Ações Rápidas</h2>
            <div class="actions-grid">
                <button @click="$router.push('/cadastro-cliente-veiculo')" class="action-btn primary">
                    <span class="action-icon">➕</span>
                    <div class="action-text">
                        <strong>Novo Cliente</strong>
                        <small>Cadastrar cliente com veículo</small>
                    </div>
                </button>

                <button @click="carregarClientesAgora" class="action-btn accent" :disabled="carregando">
                    <span class="action-icon">🔄</span>
                    <div class="action-text">
                        <strong>{{ carregando ? 'Atualizando...' : 'Atualizar' }}</strong>
                        <small>Recarregar dados</small>
                    </div>
                </button>
            </div>
        </div>

        <!-- Busca -->
        <div class="search-section">
            <div class="search-container">
                <input type="text" v-model="termoBusca" placeholder="Buscar por nome, CPF/CNPJ ou placa..."
                    class="search-input" @input="filtrarClientes" />
                <span class="search-icon">🔍</span>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="carregando" class="loading-section">
            <div class="loading-spinner"></div>
            <p>Carregando dados...</p>
        </div>

        <!-- Error State -->
        <div v-if="erro && !carregando" class="error-section">
            <div class="error-card">
                <h3>⚠️ Erro ao carregar dados</h3>
                <p>{{ erro }}</p>
                <button @click="carregarClientesAgora" class="btn-retry">Tentar Novamente</button>
            </div>
        </div>

        <!-- Lista de Clientes -->
        <div v-if="!carregando && !erro" class="clientes-section">
            <div class="section-header">
                <h2>Clientes Cadastrados</h2>
                <span class="result-count">{{ clientesFiltrados.length }} resultado(s)</span>
            </div>

            <!-- Empty State -->
            <div v-if="clientesFiltrados.length === 0" class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>{{ termoBusca ? 'Nenhum resultado encontrado' : 'Nenhum cliente cadastrado' }}</h3>
                <p>{{ termoBusca ? 'Tente ajustar os termos da busca' : 'Comece cadastrando seu primeiro cliente' }}</p>
                <button v-if="!termoBusca" @click="$router.push('/cadastro-cliente-veiculo')" class="btn-empty-action">
                    Cadastrar Primeiro Cliente
                </button>
            </div>

            <!-- Cards dos Clientes -->
            <div v-else class="clientes-grid">
                <div v-for="cliente in clientesFiltrados" :key="cliente.id" class="cliente-card"
                    :class="{ 'has-vehicles': cliente.veiculos && cliente.veiculos.length > 0 }">
                    <div class="card-header">
                        <h3>{{ cliente.nome }}</h3>
                        <div class="card-actions">
                            <button @click="editarCliente(cliente)" class="btn-icon" title="Editar">
                                ✏️
                            </button>
                            <button @click="excluirCliente(cliente)" class="btn-icon danger" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="info-row">
                            <strong>CPF/CNPJ:</strong> {{ formatarCpfCnpj(cliente.cpfOuCnpj) }}
                        </div>
                        <div class="info-row">
                            <strong>Telefone:</strong> {{ formatarTelefone(cliente.telefone) }}
                        </div>

                        <!-- Veículos do Cliente -->
                        <div v-if="cliente.veiculos && cliente.veiculos.length > 0" class="veiculos-section">
                            <h4>🚗 Veículos ({{ cliente.veiculos.length }})</h4>
                            <div class="veiculos-list">
                                <!-- AQUI É O LOOP DOS VEÍCULOS - ESTAVA FALTANDO! -->
                                <div v-for="veiculo in cliente.veiculos" :key="veiculo.id" 
                                     class="veiculo-item" :class="{ 'vencendo': isVencendo(veiculo.vencimento) }">
                                    
                                    <!-- Se estiver editando este veículo -->
                                    <div v-if="veiculoEditando && veiculoEditando.id === veiculo.id" class="veiculo-edit-form">
                                        <div class="veiculo-edit-inputs">
                                            <div class="input-group">
                                                <label>Placa:</label>
                                                <input v-model="veiculoEditando.placa" @input="formatarPlacaEdicao"
                                                    maxlength="8" placeholder="ABC1234" class="edit-input" />
                                            </div>
                                            <div class="input-group">
                                                <label>RENAVAM:</label>
                                                <input v-model="veiculoEditando.renavam" @input="formatarRenavamEdicao"
                                                    maxlength="11" placeholder="123456789" class="edit-input" />
                                            </div>
                                        </div>
                                        <div class="veiculo-edit-actions">
                                            <button @click="salvarEdicaoVeiculo" class="btn-save-edit"
                                                :disabled="salvandoVeiculo">
                                                {{ salvandoVeiculo ? '💾' : '✅' }} Salvar
                                            </button>
                                            <button @click="cancelarEdicaoVeiculo" class="btn-cancel-edit">
                                                ❌ Cancelar
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Visualização normal do veículo -->
                                    <div v-else class="veiculo-display">
                                        <div class="veiculo-info">
                                            <strong>{{ veiculo.placa }}</strong>
                                            <small>RENAVAM: {{ veiculo.renavam }}</small>
                                        </div>
                                        <div class="veiculo-actions">
                                            <div class="veiculo-vencimento">
                                                <span class="vencimento-date">
                                                    {{ formatarData(veiculo.vencimento) }}
                                                </span>
                                                <span v-if="isVencendo(veiculo.vencimento)" class="status-alert">
                                                    Vencendo!
                                                </span>
                                            </div>
                                            <div class="veiculo-buttons">
                                                <button @click="editarVeiculo(veiculo)" class="btn-edit-veiculo"
                                                    title="Editar Veículo">
                                                    ✏️
                                                </button>
                                                <button @click="excluirVeiculo(veiculo, cliente)" class="btn-delete-veiculo"
                                                    title="Excluir Veículo">
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button @click="adicionarVeiculo(cliente)" class="btn-add-vehicle">
                                + Adicionar Veículo
                            </button>
                        </div>
                        
                        <!-- Cliente sem veículos -->
                        <div v-else class="no-vehicles">
                            <p>Nenhum veículo cadastrado</p>
                            <button @click="adicionarVeiculo(cliente)" class="btn-add-first-vehicle">
                                Cadastrar Primeiro Veículo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Debug Panel (apenas em desenvolvimento) -->
        <div v-if="showDebug" class="debug-panel">
            <h3>🐛 Debug Info</h3>
            <div class="debug-info">
                <p><strong>Token:</strong> {{ token ? 'Presente ✅' : 'Ausente ❌' }}</p>
                <p><strong>Total Clientes:</strong> {{ clientes.length }}</p>
                <p><strong>Status Conexão:</strong> {{ erro ? 'Erro ❌' : 'OK ✅' }}</p>
                <p><strong>Última Atualização:</strong> {{ ultimaAtualizacao }}</p>
                <button @click="showDebug = false" class="btn-close-debug">Fechar Debug</button>
            </div>
        </div>

        <!-- Botão Debug (canto da tela) -->
        <button @click="showDebug = !showDebug" class="debug-toggle" title="Toggle Debug">
            🐛
        </button>

        <!-- Floating Action Button -->
        <FloatingActionButton :loading="carregando" @refresh="carregarClientesAgora" />
    </div>
</template>

<script>
import veiculoService from '@/services/veiculoService'
import clienteService from '@/services/clienteService'
import FloatingActionButton from '@/components/ui/FloatingActionButton.vue'

export default {
    name: "MainView",
    components: {
        FloatingActionButton
    },
    data() {
        return {
            clientes: [],
            clientesFiltrados: [],
            carregando: false,
            erro: null,
            termoBusca: '',
            showDebug: false,
            ultimaAtualizacao: null,
            // 🔥 ADICIONE ESTAS DUAS LINHAS QUE ESTAVAM FALTANDO:
            veiculoEditando: null,
            salvandoVeiculo: false
        }
    },
    computed: {
        token() {
            return localStorage.getItem('token')
        },
        totalVeiculos() {
            return this.clientes.reduce((total, cliente) => {
                return total + (cliente.veiculos ? cliente.veiculos.length : 0)
            }, 0)
        },
        veiculosVencendo() {
            let count = 0
            this.clientes.forEach(cliente => {
                if (cliente.veiculos) {
                    cliente.veiculos.forEach(veiculo => {
                        if (this.isVencendo(veiculo.vencimento)) {
                            count++
                        }
                    })
                }
            })
            return count
        }
    },
    async mounted() {
        console.log('🔄 MainView montado')
        await this.carregarClientesAgora()
    },
    methods: {
        async carregarClientesAgora() {
            this.carregando = true
            this.erro = null

            try {
                console.log('👥 Carregando clientes...')
                const clientes = await clienteService.listarClientes()
                this.clientes = clientes
                this.clientesFiltrados = clientes
                this.ultimaAtualizacao = new Date().toLocaleTimeString()
                console.log('✅ Clientes carregados:', clientes.length)
            } catch (error) {
                console.error('❌ Erro ao carregar clientes:', error)
                this.erro = this.formatarErro(error)
            } finally {
                this.carregando = false
            }
        },

        filtrarClientes() {
            if (!this.termoBusca.trim()) {
                this.clientesFiltrados = this.clientes
                return
            }

            const termo = this.termoBusca.toLowerCase()
            this.clientesFiltrados = this.clientes.filter(cliente => {
                // Busca por nome, CPF/CNPJ
                const matchCliente = cliente.nome.toLowerCase().includes(termo) ||
                    cliente.cpfOuCnpj.toLowerCase().includes(termo)

                // Busca por placa dos veículos
                const matchVeiculo = cliente.veiculos?.some(veiculo =>
                    veiculo.placa.toLowerCase().includes(termo)
                ) || false

                return matchCliente || matchVeiculo
            })
        },

        editarCliente(cliente) {
            this.$router.push({
                name: 'editar-cliente',
                query: { clientId: cliente.id }
            })
        },

        async excluirCliente(cliente) {
            if (confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`)) {
                try {
                    await clienteService.excluirCliente(cliente.id)
                    await this.carregarClientesAgora()
                    alert('Cliente excluído com sucesso!')
                } catch (error) {
                    console.error('Erro ao excluir cliente:', error)
                    alert('Erro ao excluir cliente!')
                }
            }
        },

        adicionarVeiculo(cliente) {
            this.$router.push({
                name: 'cadastro-veiculo',
                query: { clientId: cliente.id }
            })
        },

        // 🔥 MÉTODOS QUE ESTAVAM FALTANDO - ADICIONE ESTES:
        
        // 🚗 EDITAR VEÍCULO
        editarVeiculo(veiculo) {
            this.veiculoEditando = {
                id: veiculo.id,
                placa: veiculo.placa,
                renavam: veiculo.renavam
            }
        },

        cancelarEdicaoVeiculo() {
            this.veiculoEditando = null
        },

        formatarPlacaEdicao() {
            if (this.veiculoEditando) {
                this.veiculoEditando.placa = veiculoService.formatarPlaca(this.veiculoEditando.placa)
            }
        },

        formatarRenavamEdicao() {
            if (this.veiculoEditando) {
                this.veiculoEditando.renavam = veiculoService.formatarRenavam(this.veiculoEditando.renavam)
            }
        },

        async salvarEdicaoVeiculo() {
            if (!this.veiculoEditando) return

            // Validar dados
            if (!veiculoService.validarPlaca(this.veiculoEditando.placa)) {
                alert('Placa inválida! Use formato ABC1234 ou ABC1D23')
                return
            }

            if (!veiculoService.validarRenavam(this.veiculoEditando.renavam)) {
                alert('RENAVAM inválido! Deve ter entre 9 e 11 dígitos')
                return
            }

            this.salvandoVeiculo = true

            try {
                console.log('💾 Atualizando veículo:', this.veiculoEditando)
                
                await veiculoService.atualizarVeiculo(this.veiculoEditando.id, {
                    placa: this.veiculoEditando.placa,
                    renavam: this.veiculoEditando.renavam
                })

                console.log('✅ Veículo atualizado com sucesso')
                
                // Recarregar dados
                await this.carregarClientesAgora()
                
                // Limpar estado de edição
                this.veiculoEditando = null
                
                alert('Veículo atualizado com sucesso!')

            } catch (error) {
                console.error('❌ Erro ao atualizar veículo:', error)
                
                let errorMessage = 'Erro ao atualizar veículo. '
                if (error.response?.data?.message) {
                    errorMessage += error.response.data.message
                } else if (error.response?.status === 409) {
                    errorMessage += 'Placa já cadastrada para outro veículo.'
                } else {
                    errorMessage += 'Tente novamente.'
                }
                
                alert(errorMessage)
            } finally {
                this.salvandoVeiculo = false
            }
        },

        // 🗑️ EXCLUIR VEÍCULO
        async excluirVeiculo(veiculo, cliente) {
            const confirmar = confirm(`Deseja realmente excluir o veículo ${veiculo.placa} de ${cliente.nome}?`)
            
            if (!confirmar) return

            try {
                console.log('🗑️ Excluindo veículo:', veiculo.id)
                
                await veiculoService.excluirVeiculo(veiculo.id)
                
                console.log('✅ Veículo excluído com sucesso')
                
                // Recarregar dados
                await this.carregarClientesAgora()
                
                alert('Veículo excluído com sucesso!')

            } catch (error) {
                console.error('❌ Erro ao excluir veículo:', error)
                
                let errorMessage = 'Erro ao excluir veículo. '
                if (error.response?.data?.message) {
                    errorMessage += error.response.data.message
                } else if (error.response?.status === 404) {
                    errorMessage += 'Veículo não encontrado.'
                } else {
                    errorMessage += 'Tente novamente.'
                }
                
                alert(errorMessage)
            }
        },

        // 🔧 MÉTODOS EXISTENTES (mantém como estão):
        formatarCpfCnpj(cpfCnpj) {
            if (!cpfCnpj) return ''
            const clean = cpfCnpj.replace(/\D/g, '')
            if (clean.length === 11) {
                return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
            } else if (clean.length === 14) {
                return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
            }
            return cpfCnpj
        },

        formatarTelefone(telefone) {
            if (!telefone) return ''
            const clean = telefone.replace(/\D/g, '')
            if (clean.length === 11) {
                return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            } else if (clean.length === 10) {
                return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
            }
            return telefone
        },

        formatarData(data) {
            if (!data) return ''
            try {
                return new Date(data).toLocaleDateString('pt-BR')
            } catch {
                return data
            }
        },

        isVencendo(vencimento) {
            if (!vencimento) return false
            const hoje = new Date()
            const dataVencimento = new Date(vencimento)
            const diffTime = dataVencimento - hoje
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays <= 30 && diffDays >= 0
        },

        formatarErro(error) {
            if (error.response?.data?.message) {
                return error.response.data.message
            } else if (error.response?.status === 401) {
                return 'Token expirado. Faça login novamente.'
            } else if (error.response?.status === 500) {
                return 'Erro interno do servidor. Tente novamente.'
            } else if (error.message) {
                return error.message
            }
            return 'Erro desconhecido ao carregar dados.'
        }
    }
}
</script>

<style scoped>
/* SEUS ESTILOS EXISTENTES + NOVOS ESTILOS PARA VEÍCULOS */

.main-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
}

/* Header Section */
.header-section {
    background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    color: white;
    box-shadow: 0 4px 20px rgba(46, 139, 87, 0.3);
}

.welcome-area h1 {
    font-size: 2.5rem;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0 0 30px 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
    font-size: 2.5rem;
    opacity: 0.8;
}

.stat-info h3 {
    font-size: 2rem;
    margin: 0;
    font-weight: 700;
}

.stat-info p {
    margin: 0;
    opacity: 0.8;
    font-size: 0.9rem;
}

/* Actions Section */
.actions-section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.actions-section h2 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.5rem;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    font-family: inherit;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.action-btn.primary {
    background: #2E8B57;
    color: white;
}

.action-btn.secondary {
    background: #F37021;
    color: white;
}

.action-btn.accent {
    background: #17a2b8;
    color: white;
}

.action-icon {
    font-size: 1.8rem;
    min-width: 40px;
}

.action-text strong {
    display: block;
    font-size: 1.1rem;
    margin-bottom: 4px;
}

.action-text small {
    opacity: 0.8;
    font-size: 0.9rem;
}

/* Search Section */
.search-section {
    margin-bottom: 30px;
}

.search-container {
    position: relative;
    max-width: 500px;
}

.search-input {
    width: 100%;
    padding: 15px 50px 15px 20px;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    font-size: 16px;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.search-input:focus {
    outline: none;
    border-color: #2E8B57;
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
}

.search-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    opacity: 0.5;
}

/* Loading and Error States */
.loading-section {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
    width: 50px;
    height: 50px;
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

.error-section {
    margin-bottom: 30px;
}

.error-card {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
}

.error-card h3 {
    color: #856404;
    margin: 0 0 15px 0;
}

.error-card p {
    color: #856404;
    margin: 0 0 20px 0;
}

.btn-retry {
    background: #856404;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
}

/* Clientes Section */
.clientes-section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.section-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
}

.result-count {
    color: #6c757d;
    font-size: 0.9rem;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-state h3 {
    color: #6c757d;
    margin: 0 0 10px 0;
}

.empty-state p {
    color: #6c757d;
    margin: 0 0 25px 0;
}

.btn-empty-action {
    background: #2E8B57;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
}

/* Cliente Cards */
.clientes-grid {
    display: grid;
    gap: 20px;
}

.cliente-card {
    border: 1px solid #e9ecef;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: white;
}

.cliente-card:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
}

.card-actions {
    display: flex;
    gap: 10px;
}

.btn-icon {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.3s;
}

.btn-icon:hover {
    background: #e9ecef;
}

.btn-icon.danger:hover {
    background: #ffebee;
}

.card-body {
    padding: 20px;
}

.info-row {
    margin-bottom: 10px;
    color: #555;
}

.info-row strong {
    color: #333;
}

/* 🔥 ESTILOS PARA VEÍCULOS - ADICIONE ESTES: */

.veiculos-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
}

.veiculos-section h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.1rem;
}

.veiculos-list {
    margin-bottom: 15px;
}

.veiculo-item {
    padding: 15px;
    margin-bottom: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #28a745;
    transition: all 0.3s ease;
}

.veiculo-item.vencendo {
    border-left-color: #dc3545;
    background: #fff5f5;
}

.veiculo-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.veiculo-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.veiculo-buttons {
    display: flex;
    gap: 8px;
}

.btn-edit-veiculo, .btn-delete-veiculo {
    background: none;
    border: none;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.btn-edit-veiculo:hover {
    background: #e3f2fd;
}

.btn-delete-veiculo:hover {
    background: #ffebee;
}

/* Estilos para edição inline */
.veiculo-edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.veiculo-edit-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.input-group label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.edit-input {
    padding: 8px 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.3s;
}

.edit-input:focus {
    outline: none;
    border-color: #2E8B57;
    box-shadow: 0 0 0 2px rgba(46, 139, 87, 0.1);
}

.veiculo-edit-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-save-edit {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn-save-edit:hover:not(:disabled) {
    background: #218838;
}

.btn-save-edit:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.btn-cancel-edit {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
}

.btn-cancel-edit:hover {
    background: #5a6268;
}

.veiculo-info strong {
    display: block;
    color: #333;
}

.veiculo-info small {
    color: #6c757d;
    font-size: 0.85rem;
}

.vencimento-date {
    font-weight: 500;
    color: #555;
}

.status-alert {
    display: block;
    color: #dc3545;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-add-vehicle, .btn-add-first-vehicle {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    width: 100%;
}

.no-vehicles {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
    text-align: center;
}

.no-vehicles p {
    color: #6c757d;
    margin: 0 0 15px 0;
    font-style: italic;
}

/* Debug Panel */
.debug-panel {
    position: fixed;
    bottom: 60px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 12px;
    max-width: 300px;
    z-index: 1000;
}

.debug-panel h3 {
    margin: 0 0 15px 0;
    font-size: 1rem;
}

.debug-info p {
    margin: 5px 0;
    font-size: 0.85rem;
}

.btn-close-debug {
    background: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    margin-top: 10px;
}

.debug-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
    .main-container {
        padding: 15px;
    }

    .header-section {
        padding: 20px;
    }

    .welcome-area h1 {
        font-size: 2rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .actions-grid {
        grid-template-columns: 1fr;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .veiculo-display {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .veiculo-actions {
        width: 100%;
        justify-content: space-between;
    }

    .veiculo-edit-inputs {
        grid-template-columns: 1fr;
    }
}
</style>