<script setup lang="ts">
/**
 * Login View
 */
import { ref } from "vue";
import { useRouter } from "vue-router";
import LoginForm from "../components/auth/LoginForm.vue";

const router = useRouter();
const isLoading = ref(false);
const loginError = ref("");

const handleLogin = async (credentials: {
	username: string;
	password: string;
}) => {
	isLoading.value = true;
	loginError.value = "";

	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 1000));

	if (credentials.username === "admin" && credentials.password === "admin") {
		// TODO: Implement proper authentication
		await router.push("/");
	} else {
		loginError.value = "Usuário ou senha inválidos";
	}

	isLoading.value = false;
};

// Expose for testing
defineExpose({
	isLoading,
	loginError,
});
</script>

<template>
  <div class="login-view">
    <LoginForm :loading="isLoading" :error="loginError" @submit="handleLogin" />
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
</style>
