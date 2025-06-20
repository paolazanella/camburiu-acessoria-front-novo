// src/services/authService.js
import api from './api'

export default {
    async login(email, password) {
        try {
            const response = await api.post('/api/authenticate', {
                email,
                password
            })
            return response
        } catch (error) {
            console.error('Erro no login:', error)
            throw error
        }
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
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
            const response = await api.post('/api/users', userData)
            return response
        } catch (error) {
            console.error('Erro no cadastro:', error)
            throw error
        }
    },

    // Método para atualizar perfil
    async updateProfile(userData) {
        try {
            const response = await api.put('/api/profile', userData)
            return response
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            throw error
        }
    }
}