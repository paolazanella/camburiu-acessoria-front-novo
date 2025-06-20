// src/services/veiculoService.js
import api from './api'

export default {
    // Listar todos os veículos
    async listarVeiculos() {
        try {
            console.log('🔍 Buscando lista de veículos...')
            const response = await api.get('/veiculos')
            console.log('✅ Veículos encontrados:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar veículos:', error)
            throw error
        }
    },

    // Buscar veículo por ID
    async buscarVeiculoPorId(id) {
        try {
            console.log('🔍 Buscando veículo ID:', id)
            const response = await api.get(`/veiculos/${id}`)
            console.log('✅ Veículo encontrado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar veículo:', error)
            throw error
        }
    },

    // Criar novo veículo
    async criarVeiculo(veiculoData) {
        try {
            console.log('➕ Criando veículo:', veiculoData)
            
            // Preparar dados conforme esperado pelo backend
            const payload = {
                placa: veiculoData.placa,
                renavam: veiculoData.renavam,
                cliente: {
                    id: veiculoData.clienteId
                }
            }
            
            const response = await api.post('/veiculos', payload)
            console.log('✅ Veículo criado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao criar veículo:', error)
            throw error
        }
    },

    // Atualizar veículo existente
    async atualizarVeiculo(id, veiculoData) {
        try {
            console.log('💾 Atualizando veículo ID:', id, veiculoData)
            
            const payload = {
                placa: veiculoData.placa,
                renavam: veiculoData.renavam
            }
            
            const response = await api.put(`/veiculos/${id}`, payload)
            console.log('✅ Veículo atualizado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao atualizar veículo:', error)
            throw error
        }
    },

    // Excluir veículo
    async excluirVeiculo(id) {
        try {
            console.log('🗑️ Excluindo veículo ID:', id)
            const response = await api.delete(`/veiculos/${id}`)
            console.log('✅ Veículo excluído com sucesso')
            return response.data
        } catch (error) {
            console.error('❌ Erro ao excluir veículo:', error)
            throw error
        }
    },

    // Validar placa
    validarPlaca(placa) {
        const placaRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/
        return placaRegex.test(placa?.toUpperCase())
    },

    // Validar RENAVAM
    validarRenavam(renavam) {
        const renavamRegex = /^\d{9,11}$/
        return renavamRegex.test(renavam)
    },

    // Formatar placa
    formatarPlaca(placa) {
        if (!placa) return ''
        return placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
    },

    // Formatar RENAVAM
    formatarRenavam(renavam) {
        if (!renavam) return ''
        return renavam.replace(/[^0-9]/g, '')
    }
}