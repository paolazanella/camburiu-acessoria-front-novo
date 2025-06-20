// src/services/authService.js
import api from './api'

export default {
    async login(email, password) {
        try {
            console.log('🔍 Tentando fazer login com:', email)
            
            const response = await api.post('/api/authenticate', {
                username: email, // 🔥 Backend espera 'username', não 'email'
                password: password
            })
            
            console.log('✅ Resposta do login:', response.data)
            
            // Salvar token no localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify({
                    email: email,
                    name: 'Usuário'
                }))
                console.log('✅ Token salvo:', response.data.token)
            }
            
            return response
        } catch (error) {
            console.error('❌ Erro no login:', error.response?.data || error.message)
            throw error
        }
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        console.log('🔓 Logout realizado')
    },

    isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    },

    getUser() {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },

    getToken() {
        return localStorage.getItem('token')
    },

    // Método para registrar usuário
    async register(userData) {
        try {
            console.log('🔍 Registrando usuário:', userData)
            
            const response = await api.post('/usuarios', {
                nome: userData.nome,
                email: userData.email,
                senha: userData.senha,
                status: 2 // Usuário comum por padrão
            })
            
            console.log('✅ Usuário registrado:', response.data)
            return response
        } catch (error) {
            console.error('❌ Erro no cadastro:', error.response?.data || error.message)
            throw error
        }
    },

    // Método para atualizar perfil
    async updateProfile(userData) {
        try {
            const response = await api.put('/usuarios/' + userData.id, userData)
            return response
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            throw error
        }
    }
}