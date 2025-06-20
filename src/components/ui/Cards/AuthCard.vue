<template>
    <div class="auth-card">
      <div class="logo-container" v-if="showLogo">
        <slot name="logo"></slot>
      </div>
      <h1 class="title" v-if="title">{{ title }}</h1>
      <p class="subtitle" v-if="subtitle">{{ subtitle }}</p>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AuthCard',
    props: {
      title: String,
      subtitle: String,
      showLogo: { type: Boolean, default: true }
    }
  }
  </script>
  
  <style scoped>
  .auth-card {
    background: white;
    border-radius: 16px;
    padding: 3rem;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 10px 30px rgba(28, 28, 28, 0.1);
    text-align: center;
  }
  
  .logo-container {
    margin-bottom: 2rem;
  }
  
  .title {
    color: #1C1C1C;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #6B7280;
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }
  
  .content {
    margin-top: 2rem;
  }
  </style>