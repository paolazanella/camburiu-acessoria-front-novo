// src/services/api.js - VERSÃO COM DEBUG DETALHADO
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 10000,
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
        
        console.log('📡 [REQUEST] Fazendo requisição:', {
            method: config.method?.toUpperCase(),
            url: config.baseURL + config.url,
            hasToken: !!token,
            headers: config.headers,
            data: config.data
        })
        
        return config
    },
    error => {
        console.error('❌ [REQUEST] Erro na configuração da requisição:', error)
        return Promise.reject(error)
    }
)

// Interceptor para tratar respostas - COM DEBUG DETALHADO
api.interceptors.response.use(
    response => {
        console.log('✅ [RESPONSE] Resposta recebida:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            headers: response.headers,
            dataType: typeof response.data,
            dataLength: response.data ? JSON.stringify(response.data).length : 0,
            data: response.data
        })
        
        // Verificar se a resposta tem dados válidos
        if (response.data === undefined) {
            console.warn('⚠️ [RESPONSE] Resposta com data undefined!')
        }
        
        if (response.data === null) {
            console.warn('⚠️ [RESPONSE] Resposta com data null!')
        }
        
        if (response.data === '') {
            console.warn('⚠️ [RESPONSE] Resposta com data vazia!')
        }
        
        return response
    },
    error => {
        console.error('❌ [RESPONSE] Erro na resposta:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message,
            responseData: error.response?.data,
            responseHeaders: error.response?.headers
        })
        
        // Debug adicional para erros específicos
        if (error.response?.status === 401) {
            console.log('🚨 [RESPONSE] Token inválido ou expirado')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            
            if (window.location.pathname !== '/') {
                console.log('🔄 [RESPONSE] Redirecionando para login...')
                window.location.href = '/'
            }
        }
        
        // Se a resposta for vazia ou inválida
        if (error.message.includes('JSON')) {
            console.error('🚨 [RESPONSE] Erro de JSON parsing:', {
                rawResponse: error.response?.data,
                responseText: error.response?.statusText
            })
        }
        
        return Promise.reject(error)
    }
)

export default api