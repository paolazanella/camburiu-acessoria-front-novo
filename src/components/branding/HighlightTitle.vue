<template>
    <h1 class="highlight-title">
      {{ mainText }} <span class="highlight">{{ highlightText }}</span>
    </h1>
  </template>
  
  <script>
  export default {
    name: 'HighlightTitle',
    props: {
      mainText: String,
      highlightText: String
    }
  }
  </script>
  
  <style scoped>
  .highlight-title {
    color: #1C1C1C;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .highlight {
    color: #F37021; /* Laranja da marca */
  }
  </style>