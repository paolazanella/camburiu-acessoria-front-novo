// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Importar estilos globais
import './assets/styles.css';

// Criar a aplicação
const app = createApp(App);

// Usar o router
app.use(router);

// Montar a aplicação
app.mount('#app');