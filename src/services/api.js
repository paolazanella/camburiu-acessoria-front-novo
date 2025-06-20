// src/services/api.js
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3333', // 🔥 Porta do seu backend Spring Boot
    timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        console.log('📡 Fazendo requisição:', {
            method: config.method?.toUpperCase(),
            url: config.baseURL + config.url,
            hasToken: !!token,
            data: config.data
        })
        
        return config
    },
    error => {
        console.error('❌ Erro na configuração da requisição:', error)
        return Promise.reject(error)
    }
)

// Interceptor para tratar respostas
api.interceptors.response.use(
    response => {
        console.log('✅ Resposta recebida:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        })
        return response
    },
    error => {
        console.error('❌ Erro na resposta:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        })
        
        // Se token inválido, fazer logout
        if (error.response?.status === 401) {
            console.log('🔓 Token inválido, fazendo logout...')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            
            // Redirecionar para login se necessário
            if (window.location.pathname !== '/') {
                window.location.href = '/'
            }
        }
        
        return Promise.reject(error)
    }
)

export default api