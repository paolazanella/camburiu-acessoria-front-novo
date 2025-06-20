// src/services/clienteService.js - Versão Otimizada
import api from './api'

export default {
    // 📋 Listar todos os clientes
    async listarClientes() {
        try {
            console.log('🔍 Buscando lista de clientes...')
            const response = await api.get('/clientes')
            console.log('✅ Clientes encontrados:', response.data.length)
            
            // Garantir que todos os clientes tenham a estrutura correta
            const clientesFormatados = response.data.map(cliente => ({
                ...cliente,
                veiculos: cliente.veiculos || [] // Garantir que veiculos existe
            }))
            
            return clientesFormatados
        } catch (error) {
            console.error('❌ Erro ao buscar clientes:', error)
            this.handleError(error, 'Erro ao carregar clientes')
            throw error
        }
    },

    // 🔍 Buscar cliente por ID
    async buscarClientePorId(id) {
        try {
            console.log('🔍 Buscando cliente ID:', id)
            const response = await api.get(`/clientes/${id}`)
            console.log('✅ Cliente encontrado:', response.data)
            
            // Garantir estrutura consistente
            const cliente = {
                ...response.data,
                veiculos: response.data.veiculos || []
            }
            
            return cliente
        } catch (error) {
            console.error('❌ Erro ao buscar cliente:', error)
            this.handleError(error, 'Erro ao buscar cliente')
            throw error
        }
    },

    // ➕ Criar novo cliente
    async criarCliente(clienteData) {
        try {
            console.log('➕ Criando cliente:', clienteData)
            
            // Validar dados obrigatórios
            this.validarDadosCliente(clienteData)
            
            // Preparar dados para envio
            const payload = {
                nome: clienteData.nome?.trim(),
                cpfOuCnpj: this.limparCpfCnpj(clienteData.cpfOuCnpj),
                telefone: this.limparTelefone(clienteData.telefone),
                veiculos: clienteData.veiculos || []
            }
            
            const response = await api.post('/clientes', payload)
            console.log('✅ Cliente criado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao criar cliente:', error)
            this.handleError(error, 'Erro ao cadastrar cliente')
            throw error
        }
    },

    // ✏️ Atualizar cliente existente
    async atualizarCliente(id, clienteData) {
        try {
            console.log('💾 Atualizando cliente ID:', id, clienteData)
            
            // Validar dados obrigatórios
            this.validarDadosCliente(clienteData)
            
            const payload = {
                nome: clienteData.nome?.trim(),
                cpfOuCnpj: this.limparCpfCnpj(clienteData.cpfOuCnpj),
                telefone: this.limparTelefone(clienteData.telefone)
            }
            
            const response = await api.put(`/clientes/${id}`, payload)
            console.log('✅ Cliente atualizado:', response.data)
            return response.data
        } catch (error) {
            console.error('❌ Erro ao atualizar cliente:', error)
            this.handleError(error, 'Erro ao atualizar cliente')
            throw error
        }
    },

    // 🗑️ Excluir cliente
    async excluirCliente(id) {
        try {
            console.log('🗑️ Excluindo cliente ID:', id)
            const response = await api.delete(`/clientes/${id}`)
            console.log('✅ Cliente excluído com sucesso')
            return response.data
        } catch (error) {
            console.error('❌ Erro ao excluir cliente:', error)
            this.handleError(error, 'Erro ao excluir cliente')
            throw error
        }
    },

    // 🔍 Buscar clientes por termo (nome, CPF/CNPJ, placa)
    async buscarClientes(termo) {
        try {
            const clientes = await this.listarClientes()
            
            if (!termo || !termo.trim()) {
                return clientes
            }
            
            const termoBusca = termo.toLowerCase().trim()
            
            return clientes.filter(cliente => {
                // Busca por nome
                const nomeMatch = cliente.nome?.toLowerCase().includes(termoBusca)
                
                // Busca por CPF/CNPJ
                const cpfCnpjMatch = cliente.cpfOuCnpj?.toLowerCase().includes(termoBusca)
                
                // Busca por telefone
                const telefoneMatch = cliente.telefone?.toLowerCase().includes(termoBusca)
                
                // Busca por placa dos veículos
                const placaMatch = cliente.veiculos?.some(veiculo => 
                    veiculo.placa?.toLowerCase().includes(termoBusca)
                ) || false
                
                return nomeMatch || cpfCnpjMatch || telefoneMatch || placaMatch
            })
        } catch (error) {
            console.error('❌ Erro ao buscar clientes:', error)
            throw error
        }
    },

    // 📊 Obter estatísticas dos clientes
    async obterEstatisticas() {
        try {
            const clientes = await this.listarClientes()
            
            const stats = {
                totalClientes: clientes.length,
                totalVeiculos: 0,
                clientesComVeiculos: 0,
                clientesSemVeiculos: 0,
                veiculosVencendo: 0
            }
            
            clientes.forEach(cliente => {
                const temVeiculos = cliente.veiculos && cliente.veiculos.length > 0
                
                if (temVeiculos) {
                    stats.clientesComVeiculos++
                    stats.totalVeiculos += cliente.veiculos.length
                    
                    // Contar veículos vencendo
                    cliente.veiculos.forEach(veiculo => {
                        if (this.isVeiculoVencendo(veiculo.vencimento)) {
                            stats.veiculosVencendo++
                        }
                    })
                } else {
                    stats.clientesSemVeiculos++
                }
            })
            
            return stats
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error)
            throw error
        }
    },

    // 🔧 Métodos auxiliares de validação
    validarDadosCliente(clienteData) {
        const erros = []
        
        if (!clienteData.nome || !clienteData.nome.trim()) {
            erros.push('Nome é obrigatório')
        }
        
        if (!clienteData.cpfOuCnpj || !clienteData.cpfOuCnpj.trim()) {
            erros.push('CPF ou CNPJ é obrigatório')
        } else if (!this.validarCpfCnpj(clienteData.cpfOuCnpj)) {
            erros.push('CPF ou CNPJ inválido')
        }
        
        if (!clienteData.telefone || !clienteData.telefone.trim()) {
            erros.push('Telefone é obrigatório')
        } else if (!this.validarTelefone(clienteData.telefone)) {
            erros.push('Telefone inválido')
        }
        
        if (erros.length > 0) {
            throw new Error(erros.join(', '))
        }
    },

    // 📝 Validar CPF/CNPJ
    validarCpfCnpj(cpfCnpj) {
        if (!cpfCnpj) return false
        
        const numeros = cpfCnpj.replace(/\D/g, '')
        
        // Validar tamanho (11 para CPF, 14 para CNPJ)
        if (numeros.length !== 11 && numeros.length !== 14) {
            return false
        }
        
        // Validar se não são todos os dígitos iguais
        if (/^(\d)\1+$/.test(numeros)) {
            return false
        }
        
        return true // Validação básica (você pode implementar validação completa depois)
    },

    // 📱 Validar telefone
    validarTelefone(telefone) {
        if (!telefone) return false
        
        const numeros = telefone.replace(/\D/g, '')
        
        // Aceitar telefones com 10 ou 11 dígitos
        return numeros.length >= 10 && numeros.length <= 11
    },

    // 🧹 Limpar CPF/CNPJ (manter apenas números)
    limparCpfCnpj(cpfCnpj) {
        return cpfCnpj ? cpfCnpj.replace(/\D/g, '') : ''
    },

    // 🧹 Limpar telefone (manter apenas números)
    limparTelefone(telefone) {
        return telefone ? telefone.replace(/\D/g, '') : ''
    },

    // ⏰ Verificar se veículo está vencendo (próximos 30 dias)
    isVeiculoVencendo(vencimento) {
        if (!vencimento) return false
        
        try {
            const hoje = new Date()
            const dataVencimento = new Date(vencimento)
            const diffTime = dataVencimento - hoje
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            return diffDays <= 30 && diffDays >= 0
        } catch {
            return false
        }
    },

    // 🛠️ Tratamento de erros
    handleError(error, mensagemPadrao) {
        let mensagem = mensagemPadrao
        
        if (error.response?.data?.message) {
            mensagem = error.response.data.message
        } else if (error.response?.status === 400) {
            mensagem = 'Dados inválidos. Verifique as informações.'
        } else if (error.response?.status === 401) {
            mensagem = 'Acesso negado. Faça login novamente.'
        } else if (error.response?.status === 403) {
            mensagem = 'Sem permissão para realizar esta operação.'
        } else if (error.response?.status === 404) {
            mensagem = 'Cliente não encontrado.'
        } else if (error.response?.status === 409) {
            mensagem = 'Cliente já existe ou dados duplicados.'
        } else if (error.response?.status === 500) {
            mensagem = 'Erro interno do servidor. Tente novamente.'
        } else if (error.message) {
            mensagem = error.message
        }
        
        console.error('Erro detalhado:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        })
        
        // Você pode mostrar um toast ou alert aqui se desejar
        // toast.error(mensagem)
    },

    // 🎨 Métodos de formatação para exibição
    formatarCpfCnpj(cpfCnpj) {
        if (!cpfCnpj) return ''
        
        const numeros = cpfCnpj.replace(/\D/g, '')
        
        if (numeros.length === 11) {
            // CPF: 000.000.000-00
            return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        } else if (numeros.length === 14) {
            // CNPJ: 00.000.000/0000-00
            return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        }
        
        return cpfCnpj
    },

    formatarTelefone(telefone) {
        if (!telefone) return ''
        
        const numeros = telefone.replace(/\D/g, '')
        
        if (numeros.length === 11) {
            // Celular: (00) 00000-0000
            return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        } else if (numeros.length === 10) {
            // Fixo: (00) 0000-0000
            return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        }
        
        return telefone
    },

    formatarData(data) {
        if (!data) return ''
        
        try {
            return new Date(data).toLocaleDateString('pt-BR')
        } catch {
            return data
        }
    }
}