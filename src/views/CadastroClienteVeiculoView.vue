<template>
    <div class="container">
        <div class="header">
            <h1>Cadastro de Cliente com Veículo</h1>
            <button @click="goToMain" class="btn-voltar">← Voltar</button>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>Salvando...</span>
        </div>

        <form v-if="!loading" @submit.prevent="cadastrarCliente" class="form-cadastro">
            <!-- Dados do Cliente -->
            <div class="section">
                <h2>📋 Dados do Cliente</h2>
                <div class="form-group">
                    <label for="nome">Nome Completo:</label>
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
                    <label for="cpfCnpj">CPF ou CNPJ:</label>
                    <input 
                        type="text" 
                        id="cpfCnpj" 
                        v-model="cliente.cpfOuCnpj" 
                        required 
                        maxlength="18"
                        :class="{ error: errors.cpfOuCnpj }"
                        @input="formatCpfCnpj"
                        @blur="validateCpfCnpj"
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
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
                        placeholder="(11) 99999-9999"
                    />
                    <span v-if="errors.telefone" class="error-message">{{ errors.telefone }}</span>
                </div>
            </div>

            <!-- Dados do Veículo -->
            <div class="section">
                <h2>🚗 Dados do Veículo</h2>
                <div class="form-row">
                    <div class="form-group">
                        <label for="placa">Placa:</label>
                        <input 
                            type="text" 
                            id="placa" 
                            v-model="veiculo.placa" 
                            required 
                            maxlength="8"
                            :class="{ error: errors.placa }"
                            @input="formatPlaca"
                            @blur="validatePlaca"
                            placeholder="ABC1234 ou ABC1D23"
                        />
                        <span v-if="errors.placa" class="error-message">{{ errors.placa }}</span>
                    </div>

                    <div class="form-group">
                        <label for="renavam">RENAVAM:</label>
                        <input 
                            type="text" 
                            id="renavam" 
                            v-model="veiculo.renavam" 
                            required 
                            maxlength="11"
                            :class="{ error: errors.renavam }"
                            @input="formatRenavam"
                            @blur="validateRenavam"
                            placeholder="123456789"
                        />
                        <span v-if="errors.renavam" class="error-message">{{ errors.renavam }}</span>
                    </div>
                </div>
            </div>

            <div class="button-group">
                <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
                    💾 Cadastrar Cliente
                </button>
                <button type="button" @click="limparFormulario" class="btn-secondary">
                    🗑️ Limpar
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import clienteService from '@/services/clienteService';
import veiculoService from '@/services/veiculoService';

export default {
    name: "CadastroClienteVeiculoView",
    setup() {
        const router = useRouter();

        // Estados reativos
        const loading = ref(false);
        const cliente = ref({
            nome: "",
            cpfOuCnpj: "",
            telefone: "",
        });

        const veiculo = ref({
            placa: "",
            renavam: "",
        });

        const errors = ref({
            nome: '',
            cpfOuCnpj: '',
            telefone: '',
            placa: '',
            renavam: ''
        });

        // Computed para validação do formulário
        const isFormValid = computed(() => {
            return cliente.value.nome && 
                   cliente.value.cpfOuCnpj && 
                   cliente.value.telefone && 
                   veiculo.value.placa && 
                   veiculo.value.renavam &&
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

        const formatPlaca = () => {
            veiculo.value.placa = veiculoService.formatarPlaca(veiculo.value.placa);
        };

        const formatRenavam = () => {
            veiculo.value.renavam = veiculoService.formatarRenavam(veiculo.value.renavam);
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

        const validatePlaca = () => {
            if (!veiculo.value.placa) {
                errors.value.placa = 'Placa é obrigatória';
            } else if (!veiculoService.validarPlaca(veiculo.value.placa)) {
                errors.value.placa = 'Placa inválida. Use formato ABC1234 ou ABC1D23';
            } else {
                errors.value.placa = '';
            }
        };

        const validateRenavam = () => {
            if (!veiculo.value.renavam) {
                errors.value.renavam = 'RENAVAM é obrigatório';
            } else if (!veiculoService.validarRenavam(veiculo.value.renavam)) {
                errors.value.renavam = 'RENAVAM deve ter entre 9 e 11 dígitos';
            } else {
                errors.value.renavam = '';
            }
        };

        // Métodos principais
        const cadastrarCliente = async () => {
            // Validar todos os campos
            validateNome();
            validateCpfCnpj();
            validateTelefone();
            validatePlaca();
            validateRenavam();

            if (!isFormValid.value) {
                alert('Por favor, corrija os erros no formulário');
                return;
            }

            loading.value = true;

            try {
                console.log('📝 Iniciando cadastro de cliente com veículo...');

                // Criar cliente com veículo
                const clienteData = {
                    nome: cliente.value.nome.trim(),
                    cpfOuCnpj: cliente.value.cpfOuCnpj,
                    telefone: cliente.value.telefone,
                    veiculos: [{
                        placa: veiculo.value.placa,
                        renavam: veiculo.value.renavam
                    }]
                };

                const clienteCriado = await clienteService.criarCliente(clienteData);
                
                console.log('✅ Cliente cadastrado com sucesso:', clienteCriado);
                
                alert('Cliente e veículo cadastrados com sucesso!');
                router.push({ name: 'main' });

            } catch (error) {
                console.error('❌ Erro ao cadastrar cliente:', error);
                
                let errorMessage = 'Erro ao cadastrar cliente. ';
                
                if (error.response?.data?.message) {
                    errorMessage += error.response.data.message;
                } else if (error.response?.status === 400) {
                    errorMessage += 'Verifique os dados informados.';
                } else if (error.response?.status === 409) {
                    errorMessage += 'Cliente ou placa já cadastrada.';
                } else {
                    errorMessage += 'Tente novamente.';
                }
                
                alert(errorMessage);
            } finally {
                loading.value = false;
            }
        };

        const limparFormulario = () => {
            if (confirm('Deseja limpar todos os campos do formulário?')) {
                cliente.value = { nome: "", cpfOuCnpj: "", telefone: "" };
                veiculo.value = { placa: "", renavam: "" };
                errors.value = { nome: '', cpfOuCnpj: '', telefone: '', placa: '', renavam: '' };
            }
        };

        const goToMain = () => {
            if (cliente.value.nome || cliente.value.cpfOuCnpj || veiculo.value.placa) {
                if (confirm('Há dados não salvos. Deseja realmente sair?')) {
                    router.push({ name: 'main' });
                }
            } else {
                router.push({ name: 'main' });
            }
        };

        return {
            loading,
            cliente,
            veiculo,
            errors,
            isFormValid,
            formatCpfCnpj,
            formatTelefone,
            formatPlaca,
            formatRenavam,
            validateNome,
            validateCpfCnpj,
            validateTelefone,
            validatePlaca,
            validateRenavam,
            cadastrarCliente,
            limparFormulario,
            goToMain
        };
    },
};
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: 0 auto;
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

.form-cadastro {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.section {
    padding: 30px;
    border-bottom: 1px solid #e9ecef;
}

.section:last-child {
    border-bottom: none;
}

.section h2 {
    margin: 0 0 25px 0;
    color: #333;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.button-group {
    padding: 30px;
    background: #f8f9fa;
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn-primary {
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

.btn-primary:hover:not(:disabled) {
    background: #246b47;
}

.btn-primary:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
}

.btn-secondary:hover {
    background: #5a6268;
}

@media (max-width: 768px) {
    .container {
        padding: 15px;
    }

    .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .button-group {
        flex-direction: column;
    }

    .section {
        padding: 20px;
    }
}
</style>