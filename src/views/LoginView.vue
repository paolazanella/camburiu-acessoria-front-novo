<template>
    <div class="login-view">
        <AuthCard>
            <template #logo>
                <img src="../assets/camboriuassessoria.png" alt="Camboriú Assessoria" class="logo">
            </template>

            <HighlightTitle mainText="Acesso" highlightText="Restrito" />
            <p class="subtitle">Sistema Corporativo</p>

            <form @submit.prevent="handleLogin">
                <TextInput 
                    label="Usuário" 
                    v-model="username" 
                    placeholder="admin@email.com" 
                    :error="usernameError"
                    @blur="validateUsername" 
                />

                <TextInput 
                    label="Senha" 
                    type="password" 
                    v-model="password" 
                    placeholder="Digite sua senha"
                    :error="passwordError" 
                    @blur="validatePassword" 
                />

                <PrimaryButton 
                    type="submit" 
                    :label="loading ? 'Carregando...' : 'Acessar'" 
                    :loading="loading"
                    class="login-button" 
                />
            </form>
        </AuthCard>
    </div>
</template>

<script>
import AuthService from '@/services/authService'
import AuthCard from '@/components/ui/Cards/AuthCard.vue'
import HighlightTitle from '@/components/branding/HighlightTitle.vue'
import TextInput from '@/components/ui/Forms/TextInput.vue'
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton.vue'

export default {
    name: 'LoginView',
    components: {
        AuthCard,
        HighlightTitle,
        TextInput,
        PrimaryButton
    },
    data() {
        return {
            username: '',
            password: '',
            usernameError: '',
            passwordError: '',
            loading: false
        }
    },
    methods: {
        validateUsername() {
            if (!this.username) {
                this.usernameError = 'Usuário é obrigatório'
            } else if (!this.username.includes('@')) {
                this.usernameError = 'Digite um email válido'
            } else {
                this.usernameError = ''
            }
        },
        
        validatePassword() {
            if (!this.password) {
                this.passwordError = 'Senha é obrigatória'
            } else if (this.password.length < 6) {
                this.passwordError = 'Senha deve ter pelo menos 6 caracteres'
            } else {
                this.passwordError = ''
            }
        },

        async handleLogin() {
            this.validateUsername()
            this.validatePassword()

            if (this.usernameError || this.passwordError) return

            this.loading = true

            try {
                const response = await AuthService.login(this.username, this.password)
                const token = response.data.token
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                this.$router.push({ name: 'main' }) // Corrigido de 'Main' para 'main'
            } catch (error) {
                console.error('Erro ao fazer login:', error)
                
                // Login de desenvolvimento (remover em produção)
                if (this.username === 'admin@email.com' && this.password === '123456') {
                    localStorage.setItem('token', 'dev-token')
                    localStorage.setItem('user', JSON.stringify({
                        name: 'Administrador',
                        email: 'admin@email.com',
                        role: 'admin'
                    }))
                    this.$router.push({ name: 'main' })
                } else {
                    alert('Usuário ou senha inválidos!')
                }
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
.login-view {
    background: #F8F1E8;
    min-height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    margin: 0;
    position: fixed;
    top: 0;
    left: 0;
}

.subtitle {
    color: #1C1C1C;
    opacity: 0.7;
    font-size: 0.9rem;
    letter-spacing: 1px;
    margin-bottom: 2rem;
}

.logo {
    max-width: 180px;
    height: auto;
}

.login-button {
    margin-top: 1rem;
}
</style>