<template>
    <div class="container">
        <div class="header">
            <h1>Cadastro de Veículo</h1>
            <button @click="goToMain" class="btn-voltar">← Voltar</button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>{{ loadingMessage }}</span>
        </div>

        <!-- Informações do Cliente -->
        <div v-if="cliente && !loading" class="cliente-info">
            <h2>📋 Cliente Selecionado</h2>
            <div class="cliente-card">
                <h3>{{ cliente.nome }}</h3>
                <p><strong>CPF/CNPJ:</strong> {{ formatarCpfCnpj(cliente.cpfOuCnpj) }}</p>
                <p><strong>Telefone:</strong> {{ formatarTelefone(cliente.telefone) }}</p>
            </div>
        </div>

        <!-- Formulário -->
        <form v-if="!loading && cliente" @submit.prevent="cadastrarVeiculo" class="form-cadastro">
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
                <button type="submit" class="btn-primary" :disabled="!isFormValid || salvando">
                    {{ salvando ? '💾 Salvando...' : '💾 Cadastrar Veículo' }}
                </button>
                <button type="button" @click="limparFormulario" class="btn-secondary">
                    🗑️ Limpar
                </button>
            </div>
        </form>

        <!-- Error State -->
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
import veiculoService from '@/services/veiculoService';
import clienteService from '@/services/clienteService';

export default {
    name: "CadastroVeiculoView",
    setup() {
        const router = useRouter();
        const route = useRoute();

        // Estados reativos
        const loading = ref(false);
        const salvando = ref(false);
        const erro = ref(null);
        const loadingMessage = ref('Carregando...');
        
        const cliente = ref(null);
        
        const veiculo = ref({
            placa: "",
            renavam: "",
        });

        const errors = ref({
            placa: '',
            renavam: ''
        });

        // Computed para validação
        const isFormValid = computed(() => {
            return veiculo.value.placa && 
                   veiculo.value.renavam &&
                   !Object.values(errors.value).some(error => error);
        });

        // Métodos de formatação
        const formatPlaca = () => {
            veiculo.value.placa = veiculoService.formatarPlaca(veiculo.value.placa);
        };

        const formatRenavam = () => {
            veiculo.value.renavam = veiculoService.formatarRenavam(veiculo.value.renavam);
        };

        // Métodos de validação
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

        // Métodos de formatação para exibição
        const formatarCpfCnpj = (cpfCnpj) => {
            if (!cpfCnpj) return '';
            const clean = cpfCnpj.replace(/\D/g, '');
            if (clean.length === 11) {
                return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (clean.length === 14) {
                return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }
            return cpfCnpj;
        };

        const formatarTelefone = (telefone) => {
            if (!telefone) return '';
            const clean = telefone.replace(/\D/g, '');
            if (clean.length === 11) {
                return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (clean.length === 10) {
                return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return telefone;
        };

        // Carregar dados do cliente
        const carregarCliente = async () => {
            loading.value = true;
            erro.value = null;
            loadingMessage.value = 'Carregando dados do cliente...';

            try {
                const clienteId = route.query.clientId || route.params.clientId;
                
                if (!clienteId) {
                    throw new Error('ID do cliente não fornecido. Redirecionando...');
                }

                console.log('🔍 Carregando cliente ID:', clienteId);
                
                const clienteData = await clienteService.buscarClientePorId(clienteId);
                cliente.value = clienteData;
                
                console.log('✅ Cliente carregado:', cliente.value);
                
            } catch (error) {
                console.error('❌ Erro ao carregar cliente:', error);
                erro.value = error.message || 'Erro ao carregar dados do cliente';
                
                // Se não tem clienteId, redirecionar após 3 segundos
                if (error.message && error.message.includes('não fornecido')) {
                    setTimeout(() => {
                        router.push({ name: 'main' });
                    }, 3000);
                }
            } finally {
                loading.value = false;
            }
        };

        // Cadastrar veículo
        const cadastrarVeiculo = async () => {
            // Validar todos os campos
            validatePlaca();
            validateRenavam();

            if (!isFormValid.value) {
                alert('Por favor, corrija os erros no formulário');
                return;
            }

            if (!cliente.value?.id) {
                alert('Cliente não encontrado!');
                return;
            }

            salvando.value = true;

            try {
                console.log('📝 Iniciando cadastro de veículo...');

                const veiculoData = {
                    placa: veiculo.value.placa,
                    renavam: veiculo.value.renavam,
                    clienteId: cliente.value.id
                };

                console.log('📤 Dados do veículo:', veiculoData);

                const veiculoCriado = await veiculoService.criarVeiculo(veiculoData);
                
                console.log('✅ Veículo cadastrado com sucesso:', veiculoCriado);
                
                alert(`Veículo ${veiculo.value.placa} cadastrado com sucesso para ${cliente.value.nome}!`);
                
                // Redirecionar para a home
                router.push({ name: 'main' });

            } catch (error) {
                console.error('❌ Erro ao cadastrar veículo:', error);
                
                let errorMessage = 'Erro ao cadastrar veículo. ';
                
                if (error.response?.data?.message) {
                    errorMessage += error.response.data.message;
                } else if (error.response?.status === 400) {
                    errorMessage += 'Verifique os dados informados.';
                } else if (error.response?.status === 409) {
                    errorMessage += 'Placa já cadastrada.';
                } else if (error.response?.status === 404) {
                    errorMessage += 'Cliente não encontrado.';
                } else {
                    errorMessage += 'Tente novamente.';
                }
                
                alert(errorMessage);
            } finally {
                salvando.value = false;
            }
        };

        const limparFormulario = () => {
            if (confirm('Deseja limpar todos os campos do formulário?')) {
                veiculo.value = { placa: "", renavam: "" };
                errors.value = { placa: '', renavam: '' };
            }
        };

        const goToMain = () => {
            if (veiculo.value.placa || veiculo.value.renavam) {
                if (confirm('Há dados não salvos. Deseja realmente sair?')) {
                    router.push({ name: 'main' });
                }
            } else {
                router.push({ name: 'main' });
            }
        };

        // Carregar cliente ao montar componente
        onMounted(() => {
            carregarCliente();
        });

        return {
            loading,
            salvando,
            erro,
            loadingMessage,
            cliente,
            veiculo,
            errors,
            isFormValid,
            formatPlaca,
            formatRenavam,
            validatePlaca,
            validateRenavam,
            formatarCpfCnpj,
            formatarTelefone,
            carregarCliente,
            cadastrarVeiculo,
            limparFormulario,
            goToMain
        };
    }
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

.cliente-info {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.cliente-info h2 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.3rem;
}

.cliente-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    border-left: 4px solid #2E8B57;
}

.cliente-card h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.2rem;
}

.cliente-card p {
    margin: 5px 0;
    color: #555;
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