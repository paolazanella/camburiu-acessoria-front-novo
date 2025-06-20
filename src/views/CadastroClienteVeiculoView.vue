<template>
    <div class="container">
        <h1>Cadastro de Cliente com Veículo</h1>
        <button @click="goToMain">Voltar para a Página Principal</button>
        <form @submit.prevent="cadastrarCliente">
            <h2>Dados do Cliente</h2>
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" v-model="cliente.nome" required maxlength="100" />
            </div>
            <div class="form-group">
                <label for="cpfCnpj">CPF ou CNPJ:</label>
                <input type="text" id="cpfCnpj" v-model="cliente.cpf_ou_cnpj" required maxlength="18" />
            </div>
            <div class="form-group">
                <label for="telefone">Telefone:</label>
                <input type="text" id="telefone" v-model="cliente.telefone" required maxlength="15" />
            </div>

            <h2>Dados do Veículo</h2>
            <div class="form-group">
                <label for="placa">Placa:</label>
                <input type="text" id="placa" v-model="veiculo.placa" required minlength="7" maxlength="7" />
            </div>
            <div class="form-group">
                <label for="renavam">Renavam:</label>
                <input type="text" id="renavam" v-model="veiculo.renavam" required minlength="9" maxlength="9" />
            </div>

            <button type="submit">Cadastrar Cliente</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: "CadastroClienteVeiculoView",
    methods: {
        goToMain() {
            this.$router.push({ name: 'main' });
        },
    },
    setup() {
        const router = useRouter();

        const cliente = ref({
            nome: "",
            cpf_ou_cnpj: "",
            telefone: "",
        });

        const veiculo = ref({
            placa: "",
            renavam: "",
            vencimento: null,
        });

        const cadastrarCliente = () => {
            // Validações para a placa
            const placaRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
            if (!placaRegex.test(veiculo.value.placa)) {
                alert('Placa inválida. O formato deve ser ABC1D23.');
                return;
            }

            // Validações para o Renavam
            const renavamRegex = /^\d{9}$/;
            if (!renavamRegex.test(veiculo.value.renavam)) {
                alert('Renavam inválido. Deve conter exatamente 9 dígitos.');
                return;
            }

            // Salvar dados no localStorage
            const dadosCliente = {
                nome: cliente.value.nome,
                cpf_ou_cnpj: cliente.value.cpf_ou_cnpj,
                telefone: cliente.value.telefone,
                vehicles: [{
                    plate: veiculo.value.placa,
                    renavam: veiculo.value.renavam,
                }],
            };

            // Adicionar ou atualizar o cliente no localStorage
            const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            clientes.push(dadosCliente);
            localStorage.setItem('clientes', JSON.stringify(clientes));

            // Redirecionar para a página "main"
            router.push({ name: 'main' });
        };

        // Expondo as variáveis e métodos
        return {
            cliente,
            veiculo,
            cadastrarCliente,
        };
    },
};
</script>

<style scoped>
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 15px;
}

label {
    margin-bottom: 5px;
    font-weight: bold;
}

input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
}

button {
    padding: 10px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #0056b3;
}

@media (max-width: 600px) {
    .container {
        padding: 15px;
    }

    h1 {
        font-size: 20px;
    }

    input {
        font-size: 14px;
    }

    button {
        font-size: 14px;
    }
}
</style>