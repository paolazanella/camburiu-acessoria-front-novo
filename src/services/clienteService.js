// src/services/clienteService.js
import api from './api'

export default {
    // Listar todos os clientes
    async listarClientes() {
        try {
            console.log('🔍 Buscando lista de clientes...')
            const response = await api.get('/clientes')
            console.log('✅ Clientes encontrados:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar clientes:', error)
            throw error
        }
    },

    // Buscar cliente por ID
    async buscarClientePorId(id) {
        try {
            console.log('🔍 Buscando cliente ID:', id)
            const response = await api.get(`/clientes/${id}`)
            console.log('✅ Cliente encontrado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar cliente:', error)
            throw error
        }
    },

    // Criar novo cliente
    async criarCliente(clienteData) {
        try {
            console.log('➕ Criando cliente:', clienteData)
            const response = await api.post('/clientes', {
                nome: clienteData.nome,
                cpfOuCnpj: clienteData.cpfOuCnpj,
                telefone: clienteData.telefone,
                veiculos: clienteData.veiculos || []
            })
            console.log('✅ Cliente criado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao criar cliente:', error)
            throw error
        }
    },

    // Atualizar cliente existente
    async atualizarCliente(id, clienteData) {
        try {
            console.log('💾 Atualizando cliente ID:', id, clienteData)
            const response = await api.put(`/clientes/${id}`, {
                nome: clienteData.nome,
                cpfOuCnpj: clienteData.cpfOuCnpj,
                telefone: clienteData.telefone
            })
            console.log('✅ Cliente atualizado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao atualizar cliente:', error)
            throw error
        }
    },

    // Excluir cliente
    async excluirCliente(id) {
        try {
            console.log('🗑️ Excluindo cliente ID:', id)
            const response = await api.delete(`/clientes/${id}`)
            console.log('✅ Cliente excluído com sucesso')
            return response.data
        } catch (error) {
            console.error('❌ Erro ao excluir cliente:', error)
            throw error
        }
    }
}