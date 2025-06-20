<template>
    <div class="main-container">
        <div class="header">
            <div class="search-container">
                <input type="text" v-model="searchQuery" placeholder="Buscar clientes ou placas..." />
                <button @click="searchClient" class="search-button">🔍</button>
            </div>
            <button @click="addClient" class="new-client-button">+ Novo Cadastro</button>
            <div class="user-profile">
                <span>{{ userName }}</span>
                <router-link to="/perfil-usuario" class="profile-icon">👤</router-link>
            </div>
        </div>
        <div class="client-section">
            <h2>Clientes Cadastrados</h2>
            <div v-for="(client, index) in filteredClients" :key="client.id" class="accordion-item">
                <button @click="toggleAccordion(index)">
                    {{ client.name }}
                </button>
                <div v-if="activeAccordion === index" class="accordion-content">
                    <template v-if="editingClient && editingClient.id === client.id">
                        <form @submit.prevent="saveClient">
                            <p><strong>Nome:</strong></p>
                            <input v-model="editingClient.name" required />
                            <p><strong>CPF/CNPJ:</strong></p>
                            <input v-model="editingClient.cpfCnpj" required />
                            <p><strong>Telefone:</strong></p>
                            <input v-model="editingClient.phone" required />
                            <button type="submit" class="save-button">Salvar</button>
                            <button @click="cancelEdit" type="button" class="cancel-button">Cancelar</button>
                        </form>
                    </template>
                    <template v-else>
                        <p><strong>Nome:</strong> {{ client.name }}</p>
                        <p><strong>CPF/CNPJ:</strong> {{ client.cpfCnpj }}</p>
                        <p><strong>Telefone:</strong> {{ client.phone }}</p>
                    </template>

                    <h4>Veículos Registrados</h4>
                    <ul>
                        <li v-for="(vehicle, vehicleIndex) in client.vehicles" :key="vehicleIndex">
                            <template v-if="editingVehicle && editingVehicle.index === vehicleIndex">
                                <form @submit.prevent="saveVehicle(client.id, vehicleIndex)">
                                    <p><strong>Placa:</strong></p>
                                    <input v-model="editingVehicle.plate" required />
                                    <p><strong>RENAVAM:</strong></p>
                                    <input v-model="editingVehicle.renavam" required />
                                    <button type="submit" class="save-button">Salvar Veículo</button>
                                    <button @click="cancelVehicleEdit" type="button"
                                        class="cancel-button">Cancelar</button>
                                </form>
                            </template>
                            <template v-else>
                                Placa: {{ vehicle.plate }}, RENAVAM: {{ vehicle.renavam }}
                                <button @click="editVehicle(vehicleIndex, vehicle)">Editar Veículo</button>
                                <button @click="removeVehicle(client, vehicleIndex)">remover</button>
                            </template>
                        </li>
                    </ul>
                    <button @click="goToAddVehicle(client)" class="add-vehicle-button">Adicionar Veículo</button>
                    <button @click="editClient(client)" class="edit-client-button">Editar Cliente</button>
                </div>
            </div>
        </div>

        <button class="logout" @click="logout">Logout</button>
    </div>
</template>

<script>
export default {
    name: "MainView",
    data() {
        return {
            searchQuery: "",
            activeAccordion: null,
            clients: [
                {
                    name: "Cliente 1",
                    cpfCnpj: "123.456.789-00",
                    phone: "123456789",
                    id: 1,
                    vehicles: [{ plate: "Placa 1", renavam: "000000000" }, { plate: "Placa 2", renavam: "111111111" }],
                },
                {
                    name: "Cliente 2",
                    cpfCnpj: "987.654.321-00",
                    phone: "987654321",
                    id: 2,
                    vehicles: [],
                },
            ],
            editingClient: null,
            editingVehicle: null,
            userName: "Nome do Usuário",
        };
    },
    computed: {
        filteredClients() {
            return this.clients.filter(client => {
                const nameMatch = client.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                const plateMatch = client.vehicles.some(vehicle => vehicle.plate.toLowerCase().includes(this.searchQuery.toLowerCase()));
                return nameMatch || plateMatch;
            });
        },
    },
    methods: {
        logout() {
            this.$router.app.config.globalProperties.isAuthenticated = false;
            this.$router.push('/');
        },
        searchClient() {
            alert("Resultados filtrados com base na busca!");
        },
        addClient() {
            this.$router.push('/cadastro-cliente-veiculo');
        },
        toggleAccordion(index) {
            this.activeAccordion = this.activeAccordion === index ? null : index;
        },
        editClient(client) {
            this.editingClient = { ...client }; // Clona o cliente para edição
        },
        saveClient() {
            const index = this.clients.findIndex(c => c.id === this.editingClient.id);
            if (index !== -1) {
                this.clients[index] = { ...this.editingClient }; // Atualiza os dados do cliente
                this.editingClient = null; // Cancela a edição
                alert('Cliente atualizado com sucesso!');
            }
        },
        editVehicle(vehicleIndex, vehicle) {
            this.editingVehicle = { ...vehicle, index: vehicleIndex }; // Clona o veículo para edição
        },
        saveVehicle(clientId, vehicleIndex) { // Adiciona clientId como parâmetro
            const clientIndex = this.clients.findIndex(c => c.id === clientId); // Usa clientId para encontrar o cliente
            if (clientIndex !== -1) {
                this.clients[clientIndex].vehicles[vehicleIndex] = { ...this.editingVehicle }; // Atualiza os dados do veículo
                this.editingVehicle = null; // Cancela a edição
                alert('Veículo atualizado com sucesso!');
            }
        },
        cancelEdit() {
            this.editingClient = null; // Cancela a edição do cliente
        },
        cancelVehicleEdit() {
            this.editingVehicle = null; // Cancela a edição do veículo
        },
        goToAddVehicle(client) {
            this.$router.push({ name: 'cadastro-veiculo', query: { clientId: client.id } });
        },
        removeVehicle(client, vehicleIndex) {
            client.vehicles.splice(vehicleIndex, 1);
        },
    },
};
</script>

<style scoped>
.main-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.search-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 250px;
}

.search-button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
}

.new-client-button {
    padding: 10px 15px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
}

.new-client-button:hover {
    background-color: #36a471;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 10px;
}

.profile-icon {
    text-decoration: none;
    font-size: 24px;
}

.client-section {
    margin-top: 20px;
}

.accordion-item {
    margin-bottom: 10px;
}

.accordion-content {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 5px;
}

.add-vehicle-button,
.edit-client-button {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
}

.add-vehicle-button:hover,
.edit-client-button:hover {
    background-color: #36a471;
}

.logout {
    margin-top: 20px;
    background-color: #d9534f;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
}
</style>