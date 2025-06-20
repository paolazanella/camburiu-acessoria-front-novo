<template>
  <div class="text-input" :class="{ 'has-error': error }">
    <label v-if="label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    >
    <span class="error-message" v-if="error">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    label: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    modelValue: String,
    error: String
  },
  emits: ['update:modelValue', 'blur']
}
</script>

<style scoped>
.text-input {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1C1C1C;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus {
  border-color: #2E8B57;
  outline: none;
  box-shadow: 0 0 0 2px rgba(46, 139, 87, 0.2);
}

.has-error input {
  border-color: #e63946;
}

.error-message {
  color: #e63946;
  font-size: 0.8rem;
  display: block;
  margin-top: 0.5rem;
}
</style>