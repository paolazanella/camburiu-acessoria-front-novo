async save<template>
    <div class="main-container">
        <!-- Header com busca e ações -->
        <div class="header">
            <div class="search-container">
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Buscar clientes ou placas..." 
                    @keyup.enter="searchClient"
                />
                <button @click="searchClient" class="search-button">🔍</button>
            </div>
            <button @click="addClient" class="new-client-button">+ Novo Cadastro</button>
            <div class="user-profile">
                <span>{{ userName }}</span>
                <router-link to="/perfil-usuario" class="profile-icon">👤</router-link>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>Carregando clientes...</span>
        </div>

        <!-- Erro -->
        <div v-if="error" class="error">
            <p>❌ {{ error }}</p>
            <button @click="carregarClientes" class="btn-retry">Tentar Novamente</button>
        </div>

        <!-- Lista de Clientes -->
        <div v-if="!loading && !error" class="client-section">
            <h2>Clientes Cadastrados ({{ filteredClients.length }})</h2>
            
            <div v-if="filteredClients.length === 0" class="empty-state">
                <p>Nenhum cliente encontrado.</p>
                <button @click="addClient" class="btn-primary">Cadastrar Primeiro Cliente</button>
            </div>

            <div v-for="(client, index) in filteredClients" :key="client.id" class="accordion-item">
                <button 
                    @click="toggleAccordion(index)" 
                    class="accordion-header"
                    :class="{ active: activeAccordion === index }"
                >
                    <span>{{ client.nome }}</span>
                    <span class="toggle-icon">{{ activeAccordion === index ? '▼' : '▶' }}</span>
                </button>

                <div v-if="activeAccordion === index" class="accordion-content">
                    <!-- Modo Edição Cliente -->
                    <template v-if="editingClient && editingClient.id === client.id">
                        <form @submit.prevent="saveClient" class="edit-form">
                            <div class="form-group">
                                <label>Nome:</label>
                                <input v-model="editingClient.nome" required />
                            </div>
                            <div class="form-group">
                                <label>CPF/CNPJ:</label>
                                <input v-model="editingClient.cpfOuCnpj" required />
                            </div>
                            <div class="form-group">
                                <label>Telefone:</label>
                                <input v-model="editingClient.telefone" required />
                            </div>
                            <div class="button-group">
                                <button type="submit" class="save-button" :disabled="savingClient">
                                    {{ savingClient ? 'Salvando...' : 'Salvar' }}
                                </button>
                                <button @click="cancelEdit" type="button" class="cancel-button">Cancelar</button>
                            </div>
                        </form>
                    </template>

                    <!-- Modo Visualização Cliente -->
                    <template v-else>
                        <div class="client-info">
                            <p><strong>Nome:</strong> {{ client.nome }}</p>
                            <p><strong>CPF/CNPJ:</strong> {{ client.cpfOuCnpj }}</p>
                            <p><strong>Telefone:</strong> {{ client.telefone }}</p>
                        </div>
                    </template>

                    <!-- Veículos -->
                    <div class="vehicles-section">
                        <h4>Veículos Registrados ({{ client.veiculos ? client.veiculos.length : 0 }})</h4>
                        
                        <div v-if="!client.veiculos || client.veiculos.length === 0" class="no-vehicles">
                            <p>Nenhum veículo cadastrado.</p>
                        </div>

                        <ul v-else class="vehicles-list">
                            <li v-for="(vehicle, vehicleIndex) in client.veiculos" :key="vehicle.id || vehicleIndex" class="vehicle-item">
                                <!-- Modo Edição Veículo -->
                                <template v-if="editingVehicle && editingVehicle.index === vehicleIndex && editingVehicle.clientId === client.id">
                                    <form @submit.prevent="saveVehicle(client.id, vehicleIndex)" class="edit-vehicle-form">
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Placa:</label>
                                                <input v-model="editingVehicle.placa" required maxlength="8" />
                                            </div>
                                            <div class="form-group">
                                                <label>RENAVAM:</label>
                                                <input v-model="editingVehicle.renavam" required maxlength="11" />
                                            </div>
                                        </div>
                                        <div class="button-group">
                                            <button type="submit" class="save-button" :disabled="savingVehicle">
                                                {{ savingVehicle ? 'Salvando...' : 'Salvar' }}
                                            </button>
                                            <button @click="cancelVehicleEdit" type="button" class="cancel-button">Cancelar</button>
                                        </div>
                                    </form>
                                </template>

                                <!-- Modo Visualização Veículo -->
                                <template v-else>
                                    <div class="vehicle-info">
                                        <div class="vehicle-details">
                                            <strong>Placa:</strong> {{ vehicle.placa }} | 
                                            <strong>RENAVAM:</strong> {{ vehicle.renavam }}
                                            <span v-if="vehicle.vencimento" class="vencimento">
                                                | <strong>Vencimento:</strong> {{ formatDate(vehicle.vencimento) }}
                                            </span>
                                        </div>
                                        <div class="vehicle-actions">
                                            <button @click="editVehicle(vehicleIndex, vehicle, client.id)" class="btn-edit">✏️</button>
                                            <button @click="removeVehicle(client.id, vehicleIndex)" class="btn-delete">🗑️</button>
                                        </div>
                                    </div>
                                </template>
                            </li>
                        </ul>
                    </div>

                    <!-- Ações do Cliente -->
                    <div class="client-actions">
                        <button @click="addVehicleToClient(client)" class="add-vehicle-button">➕ Adicionar Veículo</button>
                        <button @click="editClient(client)" class="edit-client-button">✏️ Editar Cliente</button>
                        <button @click="deleteClient(client.id)" class="delete-client-button">🗑️ Excluir Cliente</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import clienteService from '@/services/clienteService'
import veiculoService from '@/services/veiculoService'

export default {
    name: "MainView",
    data() {
        return {
            searchQuery: "",
            activeAccordion: null,
            clients: [],
            editingClient: null,
            editingVehicle: null,
            userName: "Usuário",
            loading: false,
            error: null,
            savingClient: false,
            savingVehicle: false
        };
    },
    computed: {
        filteredClients() {
            if (!this.searchQuery) return this.clients;
            
            return this.clients.filter(client => {
                const nameMatch = client.nome?.toLowerCase().includes(this.searchQuery.toLowerCase());
                const cpfMatch = client.cpfOuCnpj?.toLowerCase().includes(this.searchQuery.toLowerCase());
                const phoneMatch = client.telefone?.toLowerCase().includes(this.searchQuery.toLowerCase());
                
                let plateMatch = false;
                if (client.veiculos && client.veiculos.length > 0) {
                    plateMatch = client.veiculos.some(vehicle => 
                        vehicle.placa?.toLowerCase().includes(this.searchQuery.toLowerCase())
                    );
                }
                
                return nameMatch || cpfMatch || phoneMatch || plateMatch;
            });
        },
    },
    async mounted() {
        this.carregarUsuario();
        await this.carregarClientes();
    },
    methods: {
        carregarUsuario() {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                this.userName = userData.name || userData.nome || 'Usuário';
            }
        },

        async carregarClientes() {
            this.loading = true;
            this.error = null;
            
            try {
                console.log('🔍 Carregando clientes...');
                const clientes = await clienteService.listarClientes();
                
                console.log('✅ Clientes carregados:', clientes);
                this.clients = clientes || [];
                
            } catch (error) {
                console.error('❌ Erro ao carregar clientes:', error);
                this.error = 'Erro ao carregar clientes. Verifique sua conexão.';
                
                // Fallback para dados locais em desenvolvimento
                if (process.env.NODE_ENV === 'development') {
                    this.clients = JSON.parse(localStorage.getItem('clientes') || '[]');
                    if (this.clients.length === 0) {
                        this.clients = [
                            {
                                id: 1,
                                nome: "Cliente Exemplo",
                                cpfOuCnpj: "123.456.789-00",
                                telefone: "(11) 99999-9999",
                                veiculos: [
                                    { id: 1, placa: "ABC1234", renavam: "123456789", vencimento: "2024-12-31" }
                                ]
                            }
                        ];
                    }
                    this.error = null;
                }
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.$router.push('/');
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        },

        searchClient() {
            // A busca é reativa através do computed filteredClients
            console.log('🔍 Buscando por:', this.searchQuery);
        },

        addClient() {
            this.$router.push('/cadastro-cliente-veiculo');
        },

        toggleAccordion(index) {
            this.activeAccordion = this.activeAccordion === index ? null : index;
            this.cancelEdit();
            this.cancelVehicleEdit();
        },

        editClient(client) {
            this.editingClient = { ...client };
        },

        async saveClient() {
            if (!this.editingClient) return;
            
            this.savingClient = true;
            try {
                console.log('💾 Salvando cliente:', this.editingClient);
                
                const clienteAtualizado = await clienteService.atualizarCliente(this.editingClient.id, {
                    nome: this.editingClient.nome,
                    cpfOuCnpj: this.editingClient.cpfOuCnpj,
                    telefone: this.editingClient.telefone
                });
                
                console.log('✅ Cliente salvo:', clienteAtualizado);
                
                // Atualizar cliente na lista local
                const index = this.clients.findIndex(c => c.id === this.editingClient.id);
                if (index !== -1) {
                    this.clients[index] = { ...this.clients[index], ...clienteAtualizado };
                }
                
                this.editingClient = null;
                alert('Cliente atualizado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao salvar cliente:', error);
                alert('Erro ao salvar cliente. Tente novamente.');
            } finally {
                this.savingClient = false;
            }
        },

        editVehicle(vehicleIndex, vehicle, clientId) {
            this.editingVehicle = { 
                ...vehicle, 
                index: vehicleIndex,
                clientId: clientId
            };
        },

        async saveVehicle(clientId, vehicleIndex) {
            if (!this.editingVehicle) return;
            
            this.savingVehicle = true;
            try {
                console.log('💾 Salvando veículo:', this.editingVehicle);
                
                const client = this.clients.find(c => c.id === clientId);
                const vehicle = client.veiculos[vehicleIndex];
                
                const veiculoAtualizado = await veiculoService.atualizarVeiculo(vehicle.id, {
                    placa: this.editingVehicle.placa,
                    renavam: this.editingVehicle.renavam
                });
                
                console.log('✅ Veículo salvo:', veiculoAtualizado);
                
                // Atualizar veículo na lista local
                const clientIndex = this.clients.findIndex(c => c.id === clientId);
                if (clientIndex !== -1) {
                    this.clients[clientIndex].veiculos[vehicleIndex] = { 
                        ...this.clients[clientIndex].veiculos[vehicleIndex], 
                        ...veiculoAtualizado 
                    };
                }
                
                this.editingVehicle = null;
                alert('Veículo atualizado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao salvar veículo:', error);
                alert('Erro ao salvar veículo. Tente novamente.');
            } finally {
                this.savingVehicle = false;
            }
        },

        cancelEdit() {
            this.editingClient = null;
        },

        cancelVehicleEdit() {
            this.editingVehicle = null;
        },

        addVehicleToClient(client) {
            this.$router.push({ 
                name: 'cadastro-veiculo', 
                query: { clientId: client.id } 
            });
        },

        async removeVehicle(clientId, vehicleIndex) {
            if (!confirm('Tem certeza que deseja remover este veículo?')) return;
            
            try {
                const client = this.clients.find(c => c.id === clientId);
                const vehicle = client.veiculos[vehicleIndex];
                
                await veiculoService.excluirVeiculo(vehicle.id);
                
                // Remover da lista local
                const clientIndex = this.clients.findIndex(c => c.id === clientId);
                if (clientIndex !== -1) {
                    this.clients[clientIndex].veiculos.splice(vehicleIndex, 1);
                }
                
                alert('Veículo removido com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao remover veículo:', error);
                alert('Erro ao remover veículo. Tente novamente.');
            }
        },

        async deleteClient(clientId) {
            if (!confirm('Tem certeza que deseja excluir este cliente e todos os seus veículos?')) return;
            
            try {
                await clienteService.excluirCliente(clientId);
                
                // Remover da lista local
                this.clients = this.clients.filter(c => c.id !== clientId);
                this.activeAccordion = null;
                
                alert('Cliente excluído com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao excluir cliente:', error);
                alert('Erro ao excluir cliente. Tente novamente.');
            }
        },

        formatDate(dateString) {
            if (!dateString) return '';
            try {
                return new Date(dateString).toLocaleDateString('pt-BR');
            } catch {
                return dateString;
            }
        }
    },
};
</script>

<style scoped>
.main-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
    min-height: 100vh;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-container {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    max-width: 400px;
}

.search-container input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
}

.search-button {
    background: #2E8B57;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
}

.search-button:hover {
    background: #246b47;
}

.new-client-button {
    padding: 12px 20px;
    background-color: #F37021;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-left: 15px;
}

.new-client-button:hover {
    background-color: #d85c1a;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 15px;
}

.profile-icon {
    text-decoration: none;
    font-size: 24px;
    padding: 8px;
    border-radius: 50%;
    background: #f0f0f0;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2E8B57;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
}

.btn-retry {
    background: #dc3545;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
}

.client-section h2 {
    margin-bottom: 20px;
    color: #333;
    font-size: 24px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.btn-primary {
    background: #2E8B57;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.accordion-item {
    margin-bottom: 15px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.accordion-header {
    width: 100%;
    padding: 20px;
    background: white;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    transition: background-color 0.3s;
}

.accordion-header:hover {
    background-color: #f8f9fa;
}

.accordion-header.active {
    background-color: #e9ecef;
}

.toggle-icon {
    font-size: 14px;
    color: #666;
}

.accordion-content {
    padding: 20px;
    border-top: 1px solid #e9ecef;
    background: #fafafa;
}

.client-info {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
}

.client-info p {
    margin: 8px 0;
    font-size: 16px;
}

.edit-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.button-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 15px;
}

.save-button {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.save-button:hover {
    background: #218838;
}

.save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cancel-button {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}

.cancel-button:hover {
    background: #5a6268;
}

.vehicles-section {
    margin: 20px 0;
}

.vehicles-section h4 {
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
}

.no-vehicles {
    padding: 15px;
    background: white;
    border-radius: 8px;
    text-align: center;
    color: #666;
    font-style: italic;
}

.vehicles-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.vehicle-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 10px;
    overflow: hidden;
}

.vehicle-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
}

.vehicle-details {
    flex: 1;
    font-size: 14px;
}

.vencimento {
    color: #666;
}

.vehicle-actions {
    display: flex;
    gap: 8px;
}

.btn-edit, .btn-delete {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
}

.btn-edit {
    background: #ffc107;
}

.btn-edit:hover {
    background: #e0a800;
}

.btn-delete {
    background: #dc3545;
}

.btn-delete:hover {
    background: #c82333;
}

.edit-vehicle-form {
    padding: 15px;
    background: #f8f9fa;
}

.client-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 20px;
}

.add-vehicle-button, .edit-client-button, .delete-client-button {
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
}

.add-vehicle-button {
    background: #2E8B57;
    color: white;
}

.add-vehicle-button:hover {
    background: #246b47;
}

.edit-client-button {
    background: #ffc107;
    color: #333;
}

.edit-client-button:hover {
    background: #e0a800;
}

.delete-client-button {
    background: #dc3545;
    color: white;
}

.delete-client-button:hover {
    background: #c82333;
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        gap: 15px;
    }

    .search-container {
        max-width: 100%;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .vehicle-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .vehicle-actions {
        align-self: flex-end;
    }

    .client-actions {
        flex-direction: column;
    }

    .button-group {
        flex-direction: column;
    }
}
</style>