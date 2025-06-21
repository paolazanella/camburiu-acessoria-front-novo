import { createRouter, createWebHistory } from "vue-router";

// Importação de views
import LoginView from "../views/LoginView.vue";
import CadastroUsuarioView from "../views/CadastroUsuarioView.vue";
import MainView from "../views/MainView.vue";
import CadastroClienteVeiculoView from "../views/CadastroClienteVeiculoView.vue";
import CadastroVeiculoView from "../views/CadastroVeiculoView.vue";
import PerfilUsuarioView from "../views/PerfilUsuarioView.vue";
import EditarClienteView from "../views/EditarClienteView.vue";
import AuthService from '@/services/authService'


// Definição das rotas
const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  {
    path: "/cadastro-usuario",
    name: "cadastro-usuario",
    component: CadastroUsuarioView,
  },
  {
    path: "/main",
    name: "main",
    component: MainView,
    meta: { requiresAuth: true }, // Proteção de rota
  },
  {
    path: "/cadastro-cliente-veiculo",
    name: "cadastro-cliente-veiculo",
    component: CadastroClienteVeiculoView,
  },
  {
    path: "/cadastro-veiculo",
    name: "cadastro-veiculo",
    component: CadastroVeiculoView,
  },
  {
    path: "/perfil-usuario",
    name: "perfil-usuario",
    component: PerfilUsuarioView,
  },
  {
    path: "/editar-cliente",
    name: "editar-cliente",
    component: EditarClienteView,
  },
  {
    path: "/about",
    name: "about",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/teste-perfil",
    name: "teste-perfil",
    component: () => import("../views/TestePerfilView.vue"),
},
];

// Criação do router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guarda de rota

router.beforeEach((to, from, next) => {
  const authRequired = to.matched.some(record => record.meta.requiresAuth);
  if (authRequired && !
    AuthService.isAuthenticated()) {
    next('/');
  } else {
    next();
  }
});

export default router;
