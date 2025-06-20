<template>
    <div class="perfil-container">
        <h1>Perfil do Usuário</h1>
        <button @click="goToMain">Voltar para a Página Principal</button>
        <!-- Exibir informações do usuário logado -->
        <div class="usuario-info">
            <h2>Suas Informações</h2>
            <p><strong>Nome:</strong> {{ usuario.nome }}</p>
            <p><strong>Email:</strong> {{ usuario.email }}</p>
            <p><strong>Tipo de Acesso:</strong> {{ usuario.nivelAcesso }}</p>
            <p><strong>Senha:</strong> <span>{{ mostrarSenha ? usuario.senha : '********' }}</span>
                <button type="button" @click="mostrarSenha = !mostrarSenha">{{ mostrarSenha ? 'Ocultar' : 'Ver'
                    }}</button>
            </p>
            <button @click="habilitarEdicao" v-if="!editando && !usuarioEditando" class="btn">Editar Suas
                Informações</button>
        </div>

        <!-- Apenas para administradores -->
        <div v-if="isAdmin" class="usuarios-cadastrados">
            <h2>
                Usuários Cadastrados
                <button @click="adicionarUsuario" class="btn">Adicionar Usuário</button>
            </h2>
            <ul>
                <li v-for="user in usuarios" :key="user.id" class="usuario-item">
                    <p><strong>Nome:</strong> {{ user.nome }}</p>
                    <p><strong>Email:</strong> {{ user.email }}</p>
                    <p><strong>Nível de Acesso:</strong> {{ user.nivelAcesso }}</p>
                    <button @click="habilitarEdicaoUsuario(user)" class="btn">Editar</button>
                </li>
            </ul>
        </div>

        <!-- Formulário para edição do perfil do usuário logado -->
        <form v-if="editando" @submit.prevent="atualizarPerfil" class="form">
            <h3>Editar Suas Informações</h3>
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" v-model="usuario.nome" required maxlength="100" />
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="usuario.email" required maxlength="255" />
            </div>
            <div class="form-group">
                <label for="nivelAcesso">Nível de Acesso:</label>
                <input type="text" id="nivelAcesso" v-model="usuario.nivelAcesso" required />
            </div>
            <div class="form-group">
                <label for="senha">Senha:</label>
                <input :type="mostrarSenha ? 'text' : 'password'" id="senha" v-model="usuario.senha" required
                    maxlength="50" />
                <button type="button" @click="mostrarSenha = !mostrarSenha">{{ mostrarSenha ? 'Ocultar' : 'Ver'
                    }}</button>
            </div>
            <div class="button-group">
                <button type="submit" class="btn">Atualizar Suas Informações</button>
                <button type="button" @click="cancelarEdicao" class="btn btn-cancel">Cancelar</button>
            </div>
        </form>

        <!-- Formulário para edição de outros usuários -->
        <form v-if="usuarioEditando" @submit.prevent="atualizarUsuario(usuarioEditando)" class="form edit-usuario">
            <h3>Editar Usuário: {{ usuarioEditando.nome }}</h3>
            <div class="form-group">
                <label for="nomeEdit">Nome:</label>
                <input type="text" id="nomeEdit" v-model="usuarioEditando.nome" required maxlength="100" />
            </div>
            <div class="form-group">
                <label for="emailEdit">Email:</label>
                <input type="email" id="emailEdit" v-model="usuarioEditando.email" required maxlength="255" />
            </div>
            <div class="form-group">
                <label for="nivelAcessoEdit">Nível de Acesso:</label>
                <input type="text" id="nivelAcessoEdit" v-model="usuarioEditando.nivelAcesso" required />
            </div>
            <div class="form-group">
                <label for="senhaEdit">Senha:</label>
                <input :type="mostrarSenha ? 'text' : 'password'" id="senhaEdit" v-model="usuarioEditando.senha"
                    required maxlength="50" />
                <button type="button" @click="mostrarSenha = !mostrarSenha">{{ mostrarSenha ? 'Ocultar' : 'Ver'
                    }}</button>
            </div>
            <div class="button-group">
                <button type="submit" class="btn">Atualizar Usuário</button>
                <button type="button" @click="cancelarEdicaoUsuario" class="btn btn-cancel">Cancelar</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: "PerfilUsuarioView",
    data() {
        return {
            isAdmin: false, // Inicialmente falso, será atualizado após verificação
            editando: false, // Controle para edição do perfil do usuário logado
            usuarioEditando: null, // Armazena o usuário que está sendo editado
            mostrarSenha: false, // Controle para mostrar/ocultar senha
            usuario: {
                nome: "",
                email: "",
                nivelAcesso: "", // "Usuário" ou "Admin"
                senha: "", // Adicionando campo de senha
            },
            usuarios: [], // Armazena a lista de usuários
        };
    },
    mounted() {
        this.carregarPerfil();
        this.verificarAdmin(); // Verifica se o usuário logado é admin
    },
    methods: {
        goToMain() {
            this.$router.push({ name: 'main' });
        },
        carregarPerfil() {
            // Simulação de carregamento de dados do usuário logado (substitua pela chamada à API)
            this.usuario = {
                nome: "Seu Nome",
                email: "seu.email@exemplo.com",
                nivelAcesso: "Admin", // Altere para "Admin" se for um administrador
                senha: "suaSenhaSecreta", // Simulação de senha
            };
        },
        verificarAdmin() {
            // Atualiza a variável isAdmin com base no nível de acesso do usuário logado
            this.isAdmin = this.usuario.nivelAcesso === "Admin"; // Verifica se o nível de acesso é Admin
            if (this.isAdmin) {
                this.carregarUsuarios(); // Carrega usuários apenas se for admin
            }
        },
        carregarUsuarios() {
            // Simulação de carregamento de usuários (substitua pela chamada à API)
            this.usuarios = [
                { id: 1, nome: "João", email: "joao@email.com", nivelAcesso: "Usuário", senha: "senhaJoao" },
                { id: 2, nome: "Maria", email: "maria@email.com", nivelAcesso: "Admin", senha: "senhaMaria" },
            ];
        },
        habilitarEdicao() {
            this.editando = true;
        },
        cancelarEdicao() {
            this.editando = false;
        },
        habilitarEdicaoUsuario(user) {
            this.usuarioEditando = { ...user }; // Cria uma cópia do usuário que será editado
        },
        atualizarPerfil() {
            // Envie os dados do usuário logado para a API para atualização
            console.log("Perfil atualizado:", this.usuario);
            alert("Suas informações foram atualizadas com sucesso!");
            this.editando = false; // Desabilita a edição após atualizar
        },
        atualizarUsuario(user) {
            // Envie os dados do usuário editado para a API para atualização
            console.log("Usuário atualizado:", user);
            alert("Usuário atualizado com sucesso!");
            this.usuarioEditando = null; // Reseta o usuário editado
        },
        cancelarEdicaoUsuario() {
            this.usuarioEditando = null; // Reseta o usuário editado
        },
        adicionarUsuario() {
            // Redireciona para a página de cadastro de usuário
            this.$router.push('/cadastro-usuario') // Supondo que a rota de cadastro tenha o nome 'CadastroUsuario'
        },
    },
};
</script>

<style scoped>
html,
body {
    height: 100%;
    margin: 0;
}

.perfil-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #f9f9f9;
}

h1 {
    font-size: 28px;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
}

.usuario-info {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #e9f5ff;
    /* Cor de fundo diferente para destaque */
    border: 1px solid #b0d4ff;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
}

h2 {
    font-size: 24px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form {
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    width: 100%;
    max-width: 600px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}

input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
}

.button-group {
    display: flex;
    justify-content: space-between;
}

.btn {
    padding: 10px 15px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #0056b3;
}

.btn-cancel {
    background-color: #dc3545;
    /* Cor para o botão cancelar */
}

.btn-cancel:hover {
    background-color: #c82333;
    /* Efeito hover para o botão cancelar */
}

.usuarios-cadastrados {
    margin-top: 20px;
}

.usuarios-cadastrados h2 {
    margin-bottom: 10px;
}

.usuarios-cadastrados ul {
    list-style-type: none;
    padding: 0;
}

.usuario-item {
    background: #f9f9f9;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
}
</style>