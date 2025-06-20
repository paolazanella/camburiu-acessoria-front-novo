# 🏢 Camboriú Assessoria - Sistema de Gestão

Sistema de gestão de clientes e veículos desenvolvido em Vue.js 3 para a Camboriú Assessoria.

## 🚀 Funcionalidades

- **🔐 Autenticação** - Login/logout seguro
- **👥 Gestão de Clientes** - Cadastro, edição, listagem e exclusão
- **🚗 Gestão de Veículos** - Vinculação de veículos aos clientes
- **🔍 Busca Inteligente** - Por nome, CPF/CNPJ ou placa
- **👤 Perfil do Usuário** - Gerenciamento de conta
- **📱 Responsivo** - Funciona em desktop e mobile

## 🛠️ Tecnologias

- **Vue.js 3** - Framework principal
- **Vue Router** - Roteamento
- **Axios** - Requisições HTTP
- **Bootstrap 5** - CSS framework
- **CSS3** - Estilos customizados

## 📦 Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd camburiu-acessoria-front

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run serve

# Build para produção
npm run build
```

## 🔑 Acesso

**Credenciais de desenvolvimento:**
- **Email:** admin@email.com
- **Senha:** 123456

## 📁 Estrutura do Projeto

```
src/
├── assets/           # Imagens e estilos
├── components/       # Componentes reutilizáveis
│   ├── branding/    # Componentes de marca
│   └── ui/          # Componentes de interface
├── router/          # Configuração de rotas
├── services/        # Serviços (API, Auth)
└── views/           # Páginas da aplicação
```

## 🔄 Fluxo da Aplicação

1. **Login** → Autenticação com email/senha
2. **Dashboard** → Visualização de clientes cadastrados
3. **Cadastro** → Adicionar novos clientes e veículos
4. **Edição** → Modificar dados existentes
5. **Busca** → Encontrar clientes/veículos rapidamente

## 📊 Dados

Os dados são armazenados temporariamente no `localStorage` do navegador. Para produção, conecte a um backend via `src/services/api.js`.

## 🎨 Temas e Cores

- **Primária:** #2E8B57 (Verde)
- **Secundária:** #F37021 (Laranja)
- **Background:** #F8F1E8 (Bege claro)

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
# Os arquivos estarão na pasta dist/
```

## 📝 Próximas Melhorias

- [ ] Integração com backend real
- [ ] Exportação de relatórios
- [ ] Notificações push
- [ ] Backup automático
- [ ] Filtros avançados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para Camboriú Assessoria**