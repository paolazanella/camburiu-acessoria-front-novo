// src/services/userService.js - VERSÃO COM DEBUG EXTRA
import api from './api'

export default {
    // 👤 OBTER PERFIL DO USUÁRIO LOGADO - COM DEBUG DETALHADO
    async obterPerfilLogado() {
        try {
            console.log('🔍 [userService] Iniciando obterPerfilLogado()')
            
            // Verificar se há token
            const token = localStorage.getItem('token')
            console.log('🔍 [userService] Token check:', token ? 'Existe' : 'Não existe')
            
            if (!token) {
                throw new Error('Token não encontrado. Faça login novamente.')
            }
            
            console.log('📤 [userService] Fazendo requisição para /usuarios/me...')
            
            // Fazer a requisição
            const response = await api.get('/usuarios/me')
            
            console.log('📥 [userService] Resposta recebida:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                dataType: typeof response.data,
                dataString: JSON.stringify(response.data)
            })
            
            // Verificar se response.data existe e é válido
            if (!response.data) {
                console.error('❌ [userService] response.data está vazio ou undefined')
                throw new Error('Resposta vazia do servidor')
            }
            
            if (typeof response.data !== 'object') {
                console.error('❌ [userService] response.data não é um objeto:', typeof response.data)
                throw new Error('Resposta inválida do servidor')
            }
            
            console.log('✅ [userService] Dados válidos recebidos:', response.data)
            
            // Atualizar localStorage com dados atualizados
            try {
                const userAtualizado = {
                    ...JSON.parse(localStorage.getItem('user') || '{}'),
                    ...response.data
                }
                localStorage.setItem('user', JSON.stringify(userAtualizado))
                console.log('✅ [userService] localStorage atualizado')
            } catch (localStorageError) {
                console.warn('⚠️ [userService] Erro ao atualizar localStorage:', localStorageError)
                // Não falhar por causa disso
            }
            
            return response.data
        } catch (error) {
            console.error('❌ [userService] Erro detalhado:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                response: error.response,
                request: error.request,
                config: error.config
            })
            
            // Se for erro de rede
            if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                console.error('🌐 [userService] Erro de rede - servidor pode estar offline')
                throw new Error('Erro de conexão. Verifique se o servidor está rodando.')
            }
            
            // Se for erro de token
            if (error.response?.status === 401) {
                console.log('🚨 [userService] Token expirado ou inválido - fazendo logout')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                
                if (window.location.pathname !== '/') {
                    window.location.href = '/'
                }
                throw new Error('Sessão expirada. Redirecionando para login...')
            }
            
            // Se for erro de parsing JSON
            if (error.message.includes('JSON') || error.message.includes('undefined')) {
                console.error('🚨 [userService] Erro de JSON parsing - resposta inválida do servidor')
                throw new Error('Resposta inválida do servidor. Verifique se a API está funcionando.')
            }
            
            // Erro genérico
            throw new Error(error.message || 'Erro desconhecido ao carregar perfil')
        }
    },

    // Outros métodos permanecem os mesmos...
    formatarStatus(status) {
        switch (Number(status)) {
            case 1: return 'Administrador'
            case 2: return 'Usuário'
            default: return 'Desconhecido'
        }
    },

    getCorStatus(status) {
        switch (Number(status)) {
            case 1: return '#dc3545'
            case 2: return '#28a745'
            default: return '#6c757d'
        }
    }
}