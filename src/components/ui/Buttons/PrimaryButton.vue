<template>
    <button class="primary-button" :class="{ 'full-width': fullWidth }" :disabled="loading" @click="$emit('click')">
        <span v-if="!loading">{{ label }}</span>
        <span v-else class="loading-text">Carregando...</span>
        <slot name="icon"></slot>
    </button>
</template>

<script>
export default {
    name: 'PrimaryButton',
    props: {
        label: { type: String, default: 'Acessar' },
        fullWidth: { type: Boolean, default: true },
        loading: { type: Boolean, default: false }
    },
    emits: ['click']
}
</script>

<style scoped>
.primary-button {
    background: #2E8B57;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.primary-button.full-width {
    width: 100%;
}

.primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-text {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
}
</style>