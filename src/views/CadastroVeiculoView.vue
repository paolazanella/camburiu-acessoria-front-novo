<template>
    <div>
        <h1>Cadastro de Veículo</h1>
        <button @click="goToMain">Voltar para a Página Principal</button>
        <form @submit.prevent="cadastrarVeiculo">
            <div>
                <label for="placa">Placa:</label>
                <input type="text" id="placa" v-model="veiculo.placa" required maxlength="7" />
            </div>
            <div>
                <label for="renavam">Renavam:</label>
                <input type="text" id="renavam" v-model="veiculo.renavam" required maxlength="9" />
            </div>
            <button type="submit">Cadastrar Veículo</button>
        </form>
    </div>
</template>

<script>
export default {
    name: "CadastroVeiculoView",
    mounted() {
        // Acessando o clientId da query
        this.clientId = this.$route.query.clientId;

        // Aqui você pode fazer uma chamada para obter os dados do cliente, se necessário
        console.log("ID do cliente:", this.clientId);
    },

    methods: {
        goToMain() {
            this.$router.push({ name: 'main' });
        },
        cadastrarVeiculo() {
            if (!this.clientId) {
                alert("ID do cliente não encontrado!");
                return;
            }

            if (!this.veiculo.placa || !this.veiculo.renavam) {
                alert("Preencha todos os campos!");
                return;
            }

            // Simulação de registro de veículo
            const novoVeiculo = {
                placa: this.veiculo.placa,
                renavam: this.veiculo.renavam,
                clientId: this.clientId,
            };

            console.log("Veículo cadastrado:", novoVeiculo);
            alert("Veículo cadastrado com sucesso!");

            // Redirecionar de volta para a página principal
            this.$router.push('/main'); // Ajuste para a rota da página principal
        },
    },

    data() {
        return {
            clientId: null,
            veiculo: {
                placa: "",
                renavam: "",
            },
        };
    }
};
</script>

<style scoped>
h1 {
    font-size: 24px;
    margin-bottom: 20px;
}

form {
    display: flex;
    flex-direction: column;
}

div {
    margin-bottom: 10px;
}

label {
    margin-bottom: 5px;
}

input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 10px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>