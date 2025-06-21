<template>
    <div class="editar-cliente-container">
        <div class="header">
            <h1>Editar Cliente</h1>
            <button @click="goToMain" class="btn-voltar">← Voltar</button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>Carregando dados do cliente...</span>
        </div>

        <!-- Formulário -->
        <form v-if="!loading && cliente.id" @submit.prevent="atualizarCliente" class="form-editar">
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input 
                    type="text" 
                    id="nome" 
                    v-model="cliente.nome" 
                    required 
                    maxlength="100"
                    :class="{ error: errors.nome }"
                    @blur="validateNome"
                />
                <span v-if="errors.nome" class="error-message">{{ errors.nome }}</span>
            </div>
            
            <div class="form-group">
                <label for="cpfCnpj">CPF/CNPJ:</label>
                <input 
                    type="text" 
                    id="cpfCnpj" 
                    v-model="cliente.cpfOuCnpj" 
                    required 
                    maxlength="18"
                    :class="{ error: errors.cpfOuCnpj }"
                    @input="formatCpfCnpj"
                    @blur="validateCpfCnpj"
                />
                <span v-if="errors.cpfOuCnpj" class="error-message">{{ errors.cpfOuCnpj }}</span>
            </div>
            
            <div class="form-group">
                <label for="telefone">Telefone:</label>
                <input 
                    type="text" 
                    id="telefone" 
                    v-model="cliente.telefone" 
                    required 
                    maxlength="15"
                    :class="{ error: errors.telefone }"
                    @input="formatTelefone"
                    @blur="validateTelefone"
                />
                <span v-if="errors.telefone" class="error-message">{{ errors.telefone }}</span>
            </div>
            
            <div class="button-group">
                <button type="submit" class="btn-atualizar" :disabled="!isFormValid || updating">
                    {{ updating ? 'Atualizando...' : '💾 Atualizar Cliente' }}
                </button>
                <button type="button" @click="cancelarEdicao" class="btn-cancelar">
                    ❌ Cancelar
                </button>
            </div>
        </form>

        <!-- Estado de erro -->
        <div v-if="erro && !loading" class="error-card">
            <h3>⚠️ Erro</h3>
            <p>{{ erro }}</p>
            <button @click="carregarCliente" class="btn-retry">Tentar Novamente</button>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import clienteService from '@/services/clienteService';

export default {
    name: "EditarClienteView",
    setup() {
        const router = useRouter();
        const route = useRoute();

        // Estados reativos
        const loading = ref(false);
        const updating = ref(false);
        const erro = ref(null);
        
        const cliente = ref({
            id: null,
            nome: '',
            cpfOuCnpj: '',
            telefone: ''
        });

        const errors = ref({
            nome: '',
            cpfOuCnpj: '',
            telefone: ''
        });

        // Computed para validação
        const isFormValid = computed(() => {
            return cliente.value.nome && 
                   cliente.value.cpfOuCnpj && 
                   cliente.value.telefone &&
                   !Object.values(errors.value).some(error => error);
        });

        // Métodos de formatação
        const formatCpfCnpj = () => {
            let value = cliente.value.cpfOuCnpj.replace(/\D/g, '');
            if (value.length <= 11) {
                // CPF
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                // CNPJ
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }
            cliente.value.cpfOuCnpj = value;
        };

        const formatTelefone = () => {
            let value = cliente.value.telefone.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            cliente.value.telefone = value;
        };

        // Métodos de validação
        const validateNome = () => {
            if (!cliente.value.nome.trim()) {
                errors.value.nome = 'Nome é obrigatório';
            } else if (cliente.value.nome.length < 2) {
                errors.value.nome = 'Nome deve ter pelo menos 2 caracteres';
            } else {
                errors.value.nome = '';
            }
        };

        const validateCpfCnpj = () => {
            const value = cliente.value.cpfOuCnpj.replace(/\D/g, '');
            if (!value) {
                errors.value.cpfOuCnpj = 'CPF ou CNPJ é obrigatório';
            } else if (value.length !== 11 && value.length !== 14) {
                errors.value.cpfOuCnpj = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
            } else {
                errors.value.cpfOuCnpj = '';
            }
        };

        const validateTelefone = () => {
            const value = cliente.value.telefone.replace(/\D/g, '');
            if (!value) {
                errors.value.telefone = 'Telefone é obrigatório';
            } else if (value.length < 10) {
                errors.value.telefone = 'Telefone deve ter pelo menos 10 dígitos';
            } else {
                errors.value.telefone = '';
            }
        };

        // Carregar dados do cliente
        const carregarCliente = async () => {
            loading.value = true;
            erro.value = null;

            try {
                const clienteId = route.query.clientId || route.params.clientId;
                
                if (!clienteId) {
                    throw new Error('ID do cliente não fornecido');
                }

                console.log('🔍 Carregando cliente ID:', clienteId);
                
                const clienteData = await clienteService.buscarClientePorId(clienteId);
                
                cliente.value = {
                    id: clienteData.id,
                    nome: clienteData.nome,
                    cpfOuCnpj: clienteData.cpfOuCnpj,
                    telefone: clienteData.telefone
                };

                console.log('✅ Cliente carregado:', cliente.value);
                
            } catch (error) {
                console.error('❌ Erro ao carregar cliente:', error);
                erro.value = error.response?.data?.message || error.message || 'Erro ao carregar dados do cliente';
            } finally {
                loading.value = false;
            }
        };

        // Atualizar cliente
        const atualizarCliente = async () => {
            // Validar todos os campos
            validateNome();
            validateCpfCnpj();
            validateTelefone();

            if (!isFormValid.value) {
                alert('Por favor, corrija os erros no formulário');
                return;
            }

            updating.value = true;

            try {
                console.log('💾 Atualizando cliente:', cliente.value);

                const clienteAtualizado = await clienteService.atualizarCliente(cliente.value.id, {
                    nome: cliente.value.nome.trim(),
                    cpfOuCnpj: cliente.value.cpfOuCnpj,
                    telefone: cliente.value.telefone
                });

                console.log('✅ Cliente atualizado:', clienteAtualizado);
                
                alert('Cliente atualizado com sucesso!');
                router.push({ name: 'main' });

            } catch (error) {
                console.error('❌ Erro ao atualizar cliente:', error);
                
                let errorMessage = 'Erro ao atualizar cliente. ';
                if (error.response?.data?.message) {
                    errorMessage += error.response.data.message;
                } else if (error.response?.status === 404) {
                    errorMessage += 'Cliente não encontrado.';
                } else if (error.response?.status === 400) {
                    errorMessage += 'Dados inválidos.';
                } else {
                    errorMessage += 'Tente novamente.';
                }
                
                alert(errorMessage);
            } finally {
                updating.value = false;
            }
        };

        const cancelarEdicao = () => {
            if (confirm('Deseja cancelar a edição? As alterações serão perdidas.')) {
                router.push({ name: 'main' });
            }
        };

        const goToMain = () => {
            router.push({ name: 'main' });
        };

        // Carregar cliente ao montar componente
        onMounted(() => {
            carregarCliente();
        });

        return {
            loading,
            updating,
            erro,
            cliente,
            errors,
            isFormValid,
            formatCpfCnpj,
            formatTelefone,
            validateNome,
            validateCpfCnpj,
            validateTelefone,
            carregarCliente,
            atualizarCliente,
            cancelarEdicao,
            goToMain
        };
    }
};
</script>

<style scoped>
.editar-cliente-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f8f9fa;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header h1 {
    margin: 0;
    color: #333;
    font-size: 24px;
}

.btn-voltar {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.btn-voltar:hover {
    background: #5a6268;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2E8B57;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.form-editar {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.form-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: #2E8B57;
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
}

.form-group input.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 12px;
    margin-top: 5px;
    display: block;
}

.button-group {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
}

.btn-atualizar {
    background: #2E8B57;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn-atualizar:hover:not(:disabled) {
    background: #246b47;
}

.btn-atualizar:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.btn-cancelar {
    background: #dc3545;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
}

.btn-cancelar:hover {
    background: #c82333;
}

.error-card {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
}

.error-card h3 {
    color: #856404;
    margin: 0 0 15px 0;
}

.error-card p {
    color: #856404;
    margin: 0 0 20px 0;
}

.btn-retry {
    background: #856404;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
}

@media (max-width: 600px) {
    .editar-cliente-container {
        margin: 10px;
        padding: 15px;
    }

    .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .button-group {
        flex-direction: column;
    }

    .form-editar {
        padding: 20px;
    }
}
</style>