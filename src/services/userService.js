// src/services/userService.js - BASEADO NO SEU BACKEND REAL
import api from './api'

export default {
    // 👤 OBTER PERFIL DO USUÁRIO LOGADO (usando o novo endpoint /me)
    async obterPerfilLogado() {
        try {
            console.log('🔍 Obtendo perfil do usuário logado...')
            
            const response = await api.get('/usuarios/me')
            console.log('✅ Perfil obtido:', response.data)
            
            // Atualizar localStorage com dados atualizados
            const userAtualizado = {
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                ...response.data
            }
            localStorage.setItem('user', JSON.stringify(userAtualizado))
            
            return response.data
        } catch (error) {
            console.error('❌ Erro ao obter perfil:', error)
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/'
            }
            
            throw error
        }
    },

    // ✏️ ATUALIZAR PERFIL (usando PUT /usuarios/{id})
    async atualizarPerfil(userId, dadosUsuario) {
        try {
            console.log('💾 Atualizando perfil ID:', userId, dadosUsuario)
            
            const payload = {
                nome: dadosUsuario.nome?.trim(),
                email: dadosUsuario.email?.trim(),
                status: dadosUsuario.status || 2
            }

            const response = await api.put(`/usuarios/${userId}`, payload)
            
            console.log('✅ Perfil atualizado:', response.data)
            
            // Atualizar localStorage
            const userAtualizado = {
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                ...response.data
            }
            localStorage.setItem('user', JSON.stringify(userAtualizado))
            
            return response.data
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error)
            this.handleError(error, 'Erro ao atualizar perfil')
            throw error
        }
    },

    // 🔒 ALTERAR SENHA (usando PUT /usuarios/{id}/senha)
    async alterarSenha(userId, senhaAtual, novaSenha) {
        try {
            console.log('🔒 Alterando senha do usuário ID:', userId)
            
            const payload = {
                senhaAtual: senhaAtual,
                novaSenha: novaSenha
            }
            
            const response = await api.put(`/usuarios/${userId}/senha`, payload)
            console.log('✅ Senha alterada com sucesso')
            return response.data
        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error)
            
            if (error.response?.status === 400) {
                if (error.response.data.includes('Senha atual incorreta')) {
                    throw new Error('Senha atual incorreta')
                } else if (error.response.data.includes('pelo menos 6 caracteres')) {
                    throw new Error('Nova senha deve ter pelo menos 6 caracteres')
                }
            }
            
            throw new Error('Erro ao alterar senha')
        }
    },

    // 👥 LISTAR TODOS OS USUÁRIOS (GET /usuarios - só admin)
    async listarUsuarios() {
        try {
            console.log('👥 Listando todos os usuários...')
            const response = await api.get('/usuarios')
            console.log('✅ Usuários listados:', response.data.length)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error)
            this.handleError(error, 'Erro ao carregar usuários')
            throw error
        }
    },

    // 🔍 BUSCAR USUÁRIO POR ID (GET /usuarios/{id})
    async buscarUsuarioPorId(userId) {
        try {
            console.log('🔍 Buscando usuário ID:', userId)
            const response = await api.get(`/usuarios/${userId}`)
            console.log('✅ Usuário encontrado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error)
            this.handleError(error, 'Erro ao buscar usuário')
            throw error
        }
    },

    // ➕ CRIAR NOVO USUÁRIO (POST /usuarios)
    async criarUsuario(dadosUsuario) {
        try {
            console.log('➕ Criando novo usuário:', dadosUsuario)
            
            this.validarDadosUsuario(dadosUsuario)
            
            const payload = {
                nome: dadosUsuario.nome?.trim(),
                email: dadosUsuario.email?.trim(),
                senha: dadosUsuario.senha,
                status: dadosUsuario.status || 2
            }

            const response = await api.post('/usuarios', payload)
            console.log('✅ Usuário criado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error)
            this.handleError(error, 'Erro ao criar usuário')
            throw error
        }
    },

    // ✏️ ATUALIZAR USUÁRIO (PUT /usuarios/{id} - para admin)
    async atualizarUsuario(userId, dadosUsuario) {
        try {
            console.log('💾 Atualizando usuário ID:', userId, dadosUsuario)
            
            const payload = {
                nome: dadosUsuario.nome?.trim(),
                email: dadosUsuario.email?.trim(),
                status: dadosUsuario.status
            }

            const response = await api.put(`/usuarios/${userId}`, payload)
            console.log('✅ Usuário atualizado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error)
            this.handleError(error, 'Erro ao atualizar usuário')
            throw error
        }
    },

    // 🗑️ DELETAR USUÁRIO (DELETE /usuarios/{id} - só admin)
    async deletarUsuario(userId) {
        try {
            console.log('🗑️ Deletando usuário ID:', userId)
            const response = await api.delete(`/usuarios/${userId}`)
            console.log('✅ Usuário deletado com sucesso')
            return response.data
        } catch (error) {
            console.error('❌ Erro ao deletar usuário:', error)
            this.handleError(error, 'Erro ao deletar usuário')
            throw error
        }
    },

    // 🔧 MÉTODOS AUXILIARES

    // 📊 Verificar se usuário atual é admin
    isUsuarioAdmin() {
        try {
            const userData = localStorage.getItem('user')
            if (!userData) return false
            
            const user = JSON.parse(userData)
            return Number(user.status) === 1
        } catch {
            return false
        }
    },

    // 📊 Obter dados do usuário logado
    getUsuarioLogado() {
        try {
            const userData = localStorage.getItem('user')
            return userData ? JSON.parse(userData) : null
        } catch {
            return null
        }
    },

    // ✅ Validar dados do usuário
    validarDadosUsuario(dadosUsuario) {
        const erros = []

        if (!dadosUsuario.nome || !dadosUsuario.nome.trim()) {
            erros.push('Nome é obrigatório')
        } else if (dadosUsuario.nome.length < 2) {
            erros.push('Nome deve ter pelo menos 2 caracteres')
        } else if (dadosUsuario.nome.length > 100) {
            erros.push('Nome deve ter no máximo 100 caracteres')
        }

        if (!dadosUsuario.email || !dadosUsuario.email.trim()) {
            erros.push('Email é obrigatório')
        } else if (!this.validarEmail(dadosUsuario.email)) {
            erros.push('Email inválido')
        } else if (dadosUsuario.email.length > 255) {
            erros.push('Email deve ter no máximo 255 caracteres')
        }

        if (dadosUsuario.senha) {
            if (dadosUsuario.senha.length < 6) {
                erros.push('Senha deve ter pelo menos 6 caracteres')
            } else if (dadosUsuario.senha.length > 50) {
                erros.push('Senha deve ter no máximo 50 caracteres')
            }
        }

        if (dadosUsuario.status && ![1, 2].includes(Number(dadosUsuario.status))) {
            erros.push('Status deve ser 1 (Admin) ou 2 (Usuário)')
        }

        if (erros.length > 0) {
            throw new Error(erros.join(', '))
        }
    },

    // 📧 Validar email
    validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    },

    // 🔧 Formatar status para exibição
    formatarStatus(status) {
        switch (Number(status)) {
            case 1: return 'Administrador'
            case 2: return 'Usuário'
            default: return 'Desconhecido'
        }
    },

    // 🎨 Obter cor do status
    getCorStatus(status) {
        switch (Number(status)) {
            case 1: return '#dc3545' // Vermelho para admin
            case 2: return '#28a745' // Verde para usuário
            default: return '#6c757d' // Cinza para desconhecido
        }
    },

    // 🛠️ Tratamento de erros
    handleError(error, mensagemPadrao) {
        let mensagem = mensagemPadrao

        if (error.response?.data) {
            // Se a resposta é uma string (como do seu backend)
            if (typeof error.response.data === 'string') {
                mensagem = error.response.data
            } else if (error.response.data.message) {
                mensagem = error.response.data.message
            }
        } else if (error.response?.status === 400) {
            mensagem = 'Dados inválidos. Verifique as informações.'
        } else if (error.response?.status === 401) {
            mensagem = 'Sessão expirada. Faça login novamente.'
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        } else if (error.response?.status === 403) {
            mensagem = 'Sem permissão para realizar esta operação.'
        } else if (error.response?.status === 404) {
            mensagem = 'Usuário não encontrado.'
        } else if (error.response?.status === 500) {
            mensagem = 'Erro interno do servidor. Tente novamente.'
        } else if (error.message) {
            mensagem = error.message
        }

        console.error('Erro detalhado:', {
            status: error.response?.status,
            data: error.response?.data,
            mensagemFinal: mensagem
        })

        return mensagem
    }
}