<template>
    <div class="perfil-container">
        <!-- Header -->
        <div class="perfil-header">
            <div class="header-content">
                <div class="user-avatar">
                    <span class="avatar-text">{{ avatarText }}</span>
                </div>
                <div class="user-info">
                    <h1>{{ perfilUsuario.nome || 'Carregando...' }}</h1>
                    <p class="user-email">{{ perfilUsuario.email }}</p>
                    <span class="user-badge" :style="{ backgroundColor: getCorStatus(perfilUsuario.status) }">
                        {{ formatarStatus(perfilUsuario.status) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Loading Principal -->
        <div v-if="carregandoPerfil" class="loading-section">
            <div class="loading-spinner"></div>
            <p>Carregando perfil...</p>
        </div>

        <!-- Erro Principal -->
        <div v-if="erroPrincipal && !carregandoPerfil" class="error-section">
            <div class="error-card">
                <h3>⚠️ Erro ao carregar perfil</h3>
                <p>{{ erroPrincipal }}</p>
                <button @click="carregarPerfil" class="btn-retry">Tentar Novamente</button>
            </div>
        </div>

        <!-- Conteúdo Principal -->
        <div v-if="!carregandoPerfil && !erroPrincipal" class="perfil-content">
            
            <!-- Seção: Meu Perfil -->
            <div class="section-card">
                <div class="section-header">
                    <h2>👤 Meu Perfil</h2>
                    <button v-if="!editandoPerfil" @click="iniciarEdicaoPerfil" class="btn-edit">
                        ✏️ Editar
                    </button>
                </div>

                <!-- Formulário de Edição do Perfil -->
                <form v-if="editandoPerfil" @submit.prevent="salvarPerfil" class="form-perfil">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nome">Nome:</label>
                            <input 
                                type="text" 
                                id="nome" 
                                v-model="perfilEdicao.nome" 
                                required 
                                maxlength="100"
                                :class="{ error: errors.nome }"
                                @blur="validarNome"
                            />
                            <span v-if="errors.nome" class="error-message">{{ errors.nome }}</span>
                        </div>

                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input 
                                type="email" 
                                id="email" 
                                v-model="perfilEdicao.email" 
                                required 
                                maxlength="255"
                                :class="{ error: errors.email }"
                                @blur="validarEmail"
                            />
                            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-save" :disabled="salvandoPerfil || !isPerfilValido">
                            {{ salvandoPerfil ? '💾 Salvando...' : '✅ Salvar' }}
                        </button>
                        <button type="button" @click="cancelarEdicaoPerfil" class="btn-cancel">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>

                <!-- Visualização do Perfil -->
                <div v-else class="perfil-view">
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Nome:</strong>
                            <span>{{ perfilUsuario.nome }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Email:</strong>
                            <span>{{ perfilUsuario.email }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Tipo:</strong>
                            <span>{{ formatarStatus(perfilUsuario.status) }}</span>
                        </div>
                        <div class="info-item">
                            <strong>ID:</strong>
                            <span>#{{ perfilUsuario.id }}</span>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button @click="abrirModalSenha" class="btn-password">
                            🔒 Alterar Senha
                        </button>
                    </div>
                </div>
            </div>

            <!-- Seção: Gerenciar Usuários (ADMIN) -->
            <div v-if="isAdmin" class="section-card">
                <div class="section-header">
                    <h2>👥 Gerenciar Usuários</h2>
                    <button @click="abrirModalNovoUsuario" class="btn-add">
                        ➕ Novo Usuário
                    </button>
                </div>

                <!-- Busca de Usuários -->
                <div class="search-section">
                    <input 
                        type="text" 
                        v-model="buscaUsuarios" 
                        placeholder="Buscar por nome ou email..."
                        class="search-input"
                        @input="filtrarUsuarios"
                    />
                </div>

                <!-- Loading Usuários -->
                <div v-if="carregandoUsuarios" class="loading-mini">
                    <div class="spinner-mini"></div>
                    <span>Carregando usuários...</span>
                </div>

                <!-- Lista de Usuários -->
                <div v-if="!carregandoUsuarios" class="usuarios-grid">
                    <div v-for="usuario in usuariosFiltrados" :key="usuario.id" class="usuario-card">
                        <div class="usuario-header">
                            <div class="usuario-avatar">
                                <span>{{ getInitials(usuario.nome) }}</span>
                            </div>
                            <div class="usuario-info">
                                <h4>{{ usuario.nome }}</h4>
                                <p>{{ usuario.email }}</p>
                                <span class="status-badge" :style="{ backgroundColor: getCorStatus(usuario.status) }">
                                    {{ formatarStatus(usuario.status) }}
                                </span>
                            </div>
                        </div>

                        <div class="usuario-actions">
                            <button @click="editarUsuario(usuario)" class="btn-icon" title="Editar">
                                ✏️
                            </button>
                            <button @click="deletarUsuario(usuario)" class="btn-icon danger" title="Deletar"
                                    :disabled="usuario.id === perfilUsuario.id">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="!carregandoUsuarios && usuariosFiltrados.length === 0" class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>{{ buscaUsuarios ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado' }}</h3>
                    <p>{{ buscaUsuarios ? 'Tente ajustar a busca' : 'Comece criando o primeiro usuário' }}</p>
                </div>
            </div>
        </div>

        <!-- Modal: Alterar Senha -->
        <div v-if="modalSenhaAberto" class="modal-overlay" @click="fecharModalSenha">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>🔒 Alterar Senha</h3>
                    <button @click="fecharModalSenha" class="btn-close">✕</button>
                </div>

                <form @submit.prevent="alterarSenha" class="modal-form">
                    <div class="form-group">
                        <label for="senhaAtual">Senha Atual:</label>
                        <input 
                            type="password" 
                            id="senhaAtual" 
                            v-model="dadosSenha.atual" 
                            required 
                            minlength="6"
                            :class="{ error: errors.senhaAtual }"
                        />
                        <span v-if="errors.senhaAtual" class="error-message">{{ errors.senhaAtual }}</span>
                    </div>

                    <div class="form-group">
                        <label for="novaSenha">Nova Senha:</label>
                        <input 
                            type="password" 
                            id="novaSenha" 
                            v-model="dadosSenha.nova" 
                            required 
                            minlength="6"
                            :class="{ error: errors.novaSenha }"
                        />
                        <span v-if="errors.novaSenha" class="error-message">{{ errors.novaSenha }}</span>
                    </div>

                    <div class="form-group">
                        <label for="confirmarSenha">Confirmar Nova Senha:</label>
                        <input 
                            type="password" 
                            id="confirmarSenha" 
                            v-model="dadosSenha.confirmar" 
                            required 
                            minlength="6"
                            :class="{ error: errors.confirmarSenha }"
                        />
                        <span v-if="errors.confirmarSenha" class="error-message">{{ errors.confirmarSenha }}</span>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn-save" :disabled="alterandoSenha">
                            {{ alterandoSenha ? '🔒 Alterando...' : '✅ Alterar Senha' }}
                        </button>
                        <button type="button" @click="fecharModalSenha" class="btn-cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal: Novo/Editar Usuário -->
        <div v-if="modalUsuarioAberto" class="modal-overlay" @click="fecharModalUsuario">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>{{ usuarioEdicao.id ? '✏️ Editar Usuário' : '➕ Novo Usuário' }}</h3>
                    <button @click="fecharModalUsuario" class="btn-close">✕</button>
                </div>

                <form @submit.prevent="salvarUsuario" class="modal-form">
                    <div class="form-group">
                        <label for="usuarioNome">Nome:</label>
                        <input 
                            type="text" 
                            id="usuarioNome" 
                            v-model="usuarioEdicao.nome" 
                            required 
                            maxlength="100"
                            :class="{ error: errors.usuarioNome }"
                        />
                        <span v-if="errors.usuarioNome" class="error-message">{{ errors.usuarioNome }}</span>
                    </div>

                    <div class="form-group">
                        <label for="usuarioEmail">Email:</label>
                        <input 
                            type="email" 
                            id="usuarioEmail" 
                            v-model="usuarioEdicao.email" 
                            required 
                            maxlength="255"
                            :class="{ error: errors.usuarioEmail }"
                        />
                        <span v-if="errors.usuarioEmail" class="error-message">{{ errors.usuarioEmail }}</span>
                    </div>

                    <div v-if="!usuarioEdicao.id" class="form-group">
                        <label for="usuarioSenha">Senha:</label>
                        <input 
                            type="password" 
                            id="usuarioSenha" 
                            v-model="usuarioEdicao.senha" 
                            required 
                            minlength="6"
                            :class="{ error: errors.usuarioSenha }"
                        />
                        <span v-if="errors.usuarioSenha" class="error-message">{{ errors.usuarioSenha }}</span>
                    </div>

                    <div class="form-group">
                        <label for="usuarioStatus">Tipo:</label>
                        <select 
                            id="usuarioStatus" 
                            v-model="usuarioEdicao.status" 
                            required
                            class="form-select"
                        >
                            <option value="2">Usuário</option>
                            <option value="1">Administrador</option>
                        </select>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn-save" :disabled="salvandoUsuario">
                            {{ salvandoUsuario ? '💾 Salvando...' : '✅ Salvar' }}
                        </button>
                        <button type="button" @click="fecharModalUsuario" class="btn-cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import userService from '@/services/userService'

export default {
    name: "PerfilUsuarioView",
    setup() {
        // Estados principais
        const carregandoPerfil = ref(false)
        const carregandoUsuarios = ref(false)
        const erroPrincipal = ref(null)
        
        // Dados do perfil
        const perfilUsuario = ref({})
        const perfilEdicao = ref({})
        const editandoPerfil = ref(false)
        const salvandoPerfil = ref(false)
        
        // Gerenciamento de usuários
        const usuarios = ref([])
        const usuariosFiltrados = ref([])
        const buscaUsuarios = ref('')
        
        // Modais
        const modalSenhaAberto = ref(false)
        const modalUsuarioAberto = ref(false)
        const usuarioEdicao = ref({})
        const salvandoUsuario = ref(false)
        
        // Alterar senha
        const dadosSenha = ref({
            atual: '',
            nova: '',
            confirmar: ''
        })
        const alterandoSenha = ref(false)
        
        // Erros de validação
        const errors = ref({})

        // Computeds
        const isAdmin = computed(() => {
            return perfilUsuario.value.status === 1
        })

        const avatarText = computed(() => {
            const nome = perfilUsuario.value.nome || ''
            return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        })

        const isPerfilValido = computed(() => {
            return perfilEdicao.value.nome && 
                   perfilEdicao.value.email && 
                   !Object.values(errors.value).some(error => error)
        })

        // Métodos principais
        const carregarPerfil = async () => {
            carregandoPerfil.value = true
            erroPrincipal.value = null

            try {
                console.log('👤 Carregando perfil...')
                const dadosPerfil = await userService.obterPerfilLogado()
                perfilUsuario.value = dadosPerfil
                console.log('✅ Perfil carregado:', dadosPerfil)

                // Se for admin, carregar usuários também
                if (dadosPerfil.status === 1) {
                    await carregarUsuarios()
                }
            } catch (error) {
                console.error('❌ Erro ao carregar perfil:', error)
                erroPrincipal.value = error.message || 'Erro ao carregar perfil'
            } finally {
                carregandoPerfil.value = false
            }
        }

        const carregarUsuarios = async () => {
            if (!isAdmin.value) return

            carregandoUsuarios.value = true

            try {
                console.log('👥 Carregando usuários...')
                const listaUsuarios = await userService.listarUsuarios()
                usuarios.value = listaUsuarios
                usuariosFiltrados.value = listaUsuarios
                console.log('✅ Usuários carregados:', listaUsuarios.length)
            } catch (error) {
                console.error('❌ Erro ao carregar usuários:', error)
                // Não bloquear a interface por erro nos usuários
            } finally {
                carregandoUsuarios.value = false
            }
        }

        // Edição de perfil
        const iniciarEdicaoPerfil = () => {
            perfilEdicao.value = { ...perfilUsuario.value }
            editandoPerfil.value = true
            errors.value = {}
        }

        const cancelarEdicaoPerfil = () => {
            editandoPerfil.value = false
            perfilEdicao.value = {}
            errors.value = {}
        }

        const salvarPerfil = async () => {
            // Validar antes de salvar
            validarNome()
            validarEmail()

            if (!isPerfilValido.value) {
                alert('Por favor, corrija os erros no formulário')
                return
            }

            salvandoPerfil.value = true

            try {
                const perfilAtualizado = await userService.atualizarPerfil(perfilUsuario.value.id, perfilEdicao.value)
                perfilUsuario.value = perfilAtualizado
                editandoPerfil.value = false
                alert('Perfil atualizado com sucesso!')
            } catch (error) {
                console.error('❌ Erro ao salvar perfil:', error)
                alert('Erro ao atualizar perfil: ' + (error.message || 'Tente novamente'))
            } finally {
                salvandoPerfil.value = false
            }
        }

        // Validações
        const validarNome = () => {
            if (!perfilEdicao.value.nome || !perfilEdicao.value.nome.trim()) {
                errors.value.nome = 'Nome é obrigatório'
            } else if (perfilEdicao.value.nome.length < 2) {
                errors.value.nome = 'Nome deve ter pelo menos 2 caracteres'
            } else if (perfilEdicao.value.nome.length > 100) {
                errors.value.nome = 'Nome deve ter no máximo 100 caracteres'
            } else {
                errors.value.nome = ''
            }
        }

        const validarEmail = () => {
            if (!perfilEdicao.value.email || !perfilEdicao.value.email.trim()) {
                errors.value.email = 'Email é obrigatório'
            } else if (!userService.validarEmail(perfilEdicao.value.email)) {
                errors.value.email = 'Email inválido'
            } else if (perfilEdicao.value.email.length > 255) {
                errors.value.email = 'Email deve ter no máximo 255 caracteres'
            } else {
                errors.value.email = ''
            }
        }

        // Modais
        const abrirModalSenha = () => {
            dadosSenha.value = { atual: '', nova: '', confirmar: '' }
            errors.value = {}
            modalSenhaAberto.value = true
        }

        const fecharModalSenha = () => {
            modalSenhaAberto.value = false
            dadosSenha.value = { atual: '', nova: '', confirmar: '' }
            errors.value = {}
        }

        const alterarSenha = async () => {
            // Validar senhas
            if (dadosSenha.value.nova !== dadosSenha.value.confirmar) {
                errors.value.confirmarSenha = 'Senhas não conferem'
                return
            }

            if (dadosSenha.value.nova.length < 6) {
                errors.value.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres'
                return
            }

            alterandoSenha.value = true

            try {
                await userService.alterarSenha(
                    perfilUsuario.value.id, 
                    dadosSenha.value.atual, 
                    dadosSenha.value.nova
                )
                
                alert('Senha alterada com sucesso!')
                fecharModalSenha()
            } catch (error) {
                console.error('❌ Erro ao alterar senha:', error)
                alert('Erro ao alterar senha: ' + (error.message || 'Verifique a senha atual'))
            } finally {
                alterandoSenha.value = false
            }
        }

        // Usuários
        const filtrarUsuarios = () => {
            const termo = buscaUsuarios.value.toLowerCase().trim()
            
            if (!termo) {
                usuariosFiltrados.value = usuarios.value
                return
            }

            usuariosFiltrados.value = usuarios.value.filter(usuario => 
                usuario.nome.toLowerCase().includes(termo) ||
                usuario.email.toLowerCase().includes(termo)
            )
        }

        const abrirModalNovoUsuario = () => {
            usuarioEdicao.value = { nome: '', email: '', senha: '', status: 2 }
            errors.value = {}
            modalUsuarioAberto.value = true
        }

        const editarUsuario = (usuario) => {
            usuarioEdicao.value = { ...usuario }
            errors.value = {}
            modalUsuarioAberto.value = true
        }

        const fecharModalUsuario = () => {
            modalUsuarioAberto.value = false
            usuarioEdicao.value = {}
            errors.value = {}
        }

        const salvarUsuario = async () => {
            salvandoUsuario.value = true

            try {
                if (usuarioEdicao.value.id) {
                    // Atualizar usuário existente
                    await userService.atualizarUsuario(usuarioEdicao.value.id, usuarioEdicao.value)
                    alert('Usuário atualizado com sucesso!')
                } else {
                    // Criar novo usuário
                    await userService.criarUsuario(usuarioEdicao.value)
                    alert('Usuário criado com sucesso!')
                }

                await carregarUsuarios()
                fecharModalUsuario()
            } catch (error) {
                console.error('❌ Erro ao salvar usuário:', error)
                alert('Erro ao salvar usuário: ' + (error.message || 'Tente novamente'))
            } finally {
                salvandoUsuario.value = false
            }
        }

        const deletarUsuario = async (usuario) => {
            if (usuario.id === perfilUsuario.value.id) {
                alert('Você não pode deletar seu próprio usuário!')
                return
            }

            if (!confirm(`Deseja realmente deletar o usuário "${usuario.nome}"?`)) {
                return
            }

            try {
                await userService.deletarUsuario(usuario.id)
                await carregarUsuarios()
                alert('Usuário deletado com sucesso!')
            } catch (error) {
                console.error('❌ Erro ao deletar usuário:', error)
                alert('Erro ao deletar usuário: ' + (error.message || 'Tente novamente'))
            }
        }

        // Utilitários
        const formatarStatus = (status) => {
            return userService.formatarStatus(status)
        }

        const getCorStatus = (status) => {
            return userService.getCorStatus(status)
        }

        const getInitials = (nome) => {
            return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        }

        // Lifecycle
        onMounted(() => {
            carregarPerfil()
        })

        return {
            // Estados
            carregandoPerfil,
            carregandoUsuarios,
            erroPrincipal,
            perfilUsuario,
            perfilEdicao,
            editandoPerfil,
            salvandoPerfil,
            usuarios,
            usuariosFiltrados,
            buscaUsuarios,
            modalSenhaAberto,
            modalUsuarioAberto,
            usuarioEdicao,
            salvandoUsuario,
            dadosSenha,
            alterandoSenha,
            errors,
            
            // Computeds
            isAdmin,
            avatarText,
            isPerfilValido,
            
            // Métodos
            carregarPerfil,
            iniciarEdicaoPerfil,
            cancelarEdicaoPerfil,
            salvarPerfil,
            validarNome,
            validarEmail,
            abrirModalSenha,
            fecharModalSenha,
            alterarSenha,
            filtrarUsuarios,
            abrirModalNovoUsuario,
            editarUsuario,
            fecharModalUsuario,
            salvarUsuario,
            deletarUsuario,
            formatarStatus,
            getCorStatus,
            getInitials
        }
    }
}
</script>

<style scoped>
.perfil-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
}

/* Header do Perfil */
.perfil-header {
    background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    color: white;
    box-shadow: 0 4px 20px rgba(46, 139, 87, 0.3);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 25px;
}

.user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-info h1 {
    margin: 0 0 8px 0;
    font-size: 2.2rem;
    font-weight: 700;
}

.user-email {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0 0 12px 0;
}

.user-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Loading e Error States */
.loading-section {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2E8B57;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-section {
    margin-bottom: 30px;
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

/* Cards de Seção */
.section-card {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
}

/* Botões */
.btn-edit, .btn-add {
    background: #2E8B57;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn-edit:hover, .btn-add:hover {
    background: #246b47;
}

.btn-save {
    background: #28a745;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn-save:hover:not(:disabled) {
    background: #218838;
}

.btn-save:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.btn-cancel {
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.btn-cancel:hover {
    background: #5a6268;
}

.btn-password {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.btn-password:hover {
    background: #138496;
}

/* Formulários */
.form-perfil {
    margin-top: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
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

.form-group input, .form-select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.form-group input:focus, .form-select:focus {
    outline: none;
    border-color: #2E8B57;
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
}

.form-group input.error, .form-select.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 12px;
    margin-top: 5px;
    display: block;
}

.form-actions {
    display: flex;
    gap: 15px;
    margin-top: 25px;
}

/* Visualização do Perfil */
.perfil-view {
    margin-top: 20px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-item strong {
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item span {
    color: #333;
    font-size: 1.1rem;
    font-weight: 500;
}

.profile-actions {
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
}

/* Busca */
.search-section {
    margin-bottom: 25px;
}

.search-input {
    width: 100%;
    max-width: 400px;
    padding: 12px 20px;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.search-input:focus {
    outline: none;
    border-color: #2E8B57;
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
}

/* Loading Mini */
.loading-mini {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
}

.spinner-mini {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #2E8B57;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Grid de Usuários */
.usuarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.usuario-card {
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    background: white;
}

.usuario-card:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.usuario-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

.usuario-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #2E8B57;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
}

.usuario-info h4 {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 1.1rem;
}

.usuario-info p {
    margin: 0 0 8px 0;
    color: #666;
    font-size: 0.9rem;
}

.status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.usuario-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-icon {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.3s;
}

.btn-icon:hover {
    background: #e9ecef;
}

.btn-icon.danger:hover {
    background: #ffebee;
}

.btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 40px 20px;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
}

.empty-state h3 {
    color: #6c757d;
    margin: 0 0 8px 0;
}

.empty-state p {
    color: #6c757d;
    margin: 0;
}

/* Modais */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    background: #f8f9fa;
    color: #333;
}

.modal-form {
    padding: 25px;
}

.modal-actions {
    display: flex;
    gap: 15px;
    margin-top: 25px;
    justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
    .perfil-container {
        padding: 15px;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }

    .user-avatar {
        width: 70px;
        height: 70px;
        font-size: 1.8rem;
    }

    .user-info h1 {
        font-size: 1.8rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .usuarios-grid {
        grid-template-columns: 1fr;
    }

    .form-actions, .modal-actions {
        flex-direction: column;
    }
}
</style>