<template>
    <div class="cadastro-usuario">
        <button @click="goToMain">Voltar para a Página Principal</button>
        <h1>Cadastro de Usuário</h1>
        <form @submit.prevent="handleCadastro">
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" v-model="nome" required minlength="1" maxlength="100" />
                <span v-if="nome.length < 1 || nome.length > 100" class="error">O nome deve ter entre 1 e 100
                    caracteres.</span>
            </div>
            <div class="form-group">
                <label for="email">E-mail:</label>
                <input type="email" id="email" v-model="email" required minlength="5" maxlength="255" />
                <span v-if="email.length < 5 || email.length > 255" class="error">O e-mail deve ter entre 5 e 255
                    caracteres.</span>
            </div>
            <div class="form-group">
                <label for="senha">Senha:</label>
                <input type="password" id="senha" v-model="senha" required />
            </div>
            <button type="submit">Cadastrar</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            nome: '',
            email: '',
            senha: ''
        };
    },
    methods: {
        goToMain() {
            this.$router.push({ name: 'main' });
        },
        handleCadastro() {
            if (this.nome.length >= 1 && this.nome.length <= 100 && this.email.length >= 5 && this.email.length <= 255) {
                console.log('Cadastrando usuário:', this.nome, this.email, this.senha);
                // Aqui você pode implementar a lógica para salvar os dados do usuário

                // Redireciona para outra página após o cadastro, se necessário
                this.$router.push({ name: 'perfil-usuario' }); // Redireciona para a tela de login
            } else {
                alert('Por favor, preencha os campos corretamente.');
            }
        }
    }
};
</script>

<style scoped>
.cadastro-usuario {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

.error {
    color: red;
    font-size: 0.9em;
}
</style>