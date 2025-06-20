<template>
    <div class="editar-cliente-container">
        <div class="header">
            <h1>Editar Cliente</h1>
            <button @click="goToMain" class="btn-voltar">Voltar para Main</button>
        </div>

        <form @submit.prevent="atualizarCliente" class="form-editar">
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input 
                    type="text" 
                    id="nome" 
                    v-model="cliente.name" 
                    required 
                    maxlength="100"
                />
            </div>
            
            <div class="form-group">
                <label for="cpfCnpj">CPF/CNPJ:</label>
                <input 
                    type="text" 
                    id="cpfCnpj" 
                    v-model="cliente.cpfCnpj" 
                    required 
                    maxlength="18"
                />
            </div>
            
            <div class="form-group">
                <label for="telefone">Telefone:</label>
                <input 
                    type="text" 
                    id="telefone" 
                    v-model="cliente.phone" 
                    required 
                    maxlength="15"
                />
            </div>
            
            <div class="button-group">
                <button type="submit" class="btn-atualizar">Atualizar Cliente</button>
                <button type="button" @click="cancelarEdicao" class="btn-cancelar">Cancelar</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: "EditarClienteView",
    data() {
        return {
            cliente: {
                id: null,
                name: '',
                cpfCnpj: '',
                phone: '',
            }
        };
    },
    
    mounted() {
        this.carregarCliente()
    },
    
    methods: {
        goToMain() {
            this.$router.push({ name: 'main' });
        },

        carregarCliente() {
            // Pegar dados do cliente do localStorage ou da rota
            const clientId = this.$route.params.clientId || this.$route.query.clientId;
            
            if (clientId) {
                // Buscar cliente no localStorage
                const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
                const clienteEncontrado = clientes.find(c => c.id == clientId);
                
                if (clienteEncontrado) {
                    this.cliente = { ...clienteEncontrado };
                } else {
                    console.error("Cliente não encontrado");
                    alert("Cliente não encontrado!");
                    this.goToMain();
                }
            } else {
                console.error("ID do cliente não fornecido");
                alert("ID do cliente não fornecido!");
                this.goToMain();
            }
        },

        atualizarCliente() {
            try {
                // Validações
                if (!this.cliente.name || !this.cliente.cpfCnpj || !this.cliente.phone) {
                    alert('Preencha todos os campos obrigatórios!');
                    return;
                }

                // Atualizar no localStorage
                const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
                const clientIndex = clientes.findIndex(c => c.id == this.cliente.id);
                
                if (clientIndex !== -1) {
                    clientes[clientIndex] = { ...this.cliente };
                    localStorage.setItem('clientes', JSON.stringify(clientes));
                    
                    alert('Cliente atualizado com sucesso!');
                    this.goToMain();
                } else {
                    alert('Erro: Cliente não encontrado para atualização!');
                }
            } catch (error) {
                console.error('Erro ao atualizar cliente:', error);
                alert('Erro ao atualizar cliente!');
            }
        },

        cancelarEdicao() {
            if (confirm('Deseja cancelar a edição? As alterações serão perdidas.')) {
                this.goToMain();
            }
        }
    }
};
</script>

<style scoped>
.editar-cliente-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h1 {
    margin: 0;
    color: #333;
}

.btn-voltar {
    padding: 8px 16px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-voltar:hover {
    background-color: #5a6268;
}

.form-editar {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
}

.form-group input:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.button-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}

.btn-atualizar {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.btn-atualizar:hover {
    background-color: #218838;
}

.btn-cancelar {
    padding: 10px 20px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.btn-cancelar:hover {
    background-color: #c82333;
}

@media (max-width: 600px) {
    .editar-cliente-container {
        margin: 10px;
        padding: 15px;
    }

    .header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .button-group {
        flex-direction: column;
    }

    .button-group button {
        width: 100%;
    }
}
</style>