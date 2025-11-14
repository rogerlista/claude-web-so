<script setup lang="ts">
/**
 * LoginForm Component (T022)
 *
 * Authentication form with username and password inputs
 */

import { ref } from "vue";

export interface LoginFormProps {
	loading?: boolean;
	error?: string;
}

withDefaults(defineProps<LoginFormProps>(), {
	loading: false,
});

const emit = defineEmits<{
	submit: [credentials: { username: string; password: string }];
}>();

const username = ref("");
const password = ref("");

const handleSubmit = (e: Event) => {
	e.preventDefault();
	emit("submit", {
		username: username.value,
		password: password.value,
	});
};
</script>

<template>
  <form class="login-form" @submit="handleSubmit">
    <h2 class="login-form__title">Login</h2>

    <BaseAlert v-if="error" variant="error" :message="error" />

    <BaseInput
      v-model="username"
      label="Usuário"
      type="text"
      placeholder="Digite seu usuário"
      required
      :disabled="loading"
    />

    <BaseInput
      v-model="password"
      label="Senha"
      type="password"
      placeholder="Digite sua senha"
      required
      :disabled="loading"
    />

    <BaseButton
      type="submit"
      :loading="loading"
      full-width
    >
      Entrar
    </BaseButton>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.login-form__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  text-align: center;
  margin-bottom: var(--space-2);
}
</style>
