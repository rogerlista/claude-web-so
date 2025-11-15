/**
 * Auth Store
 * TDD Phase: GREEN - Implementation to pass tests
 */

import { defineStore } from "pinia";
import { ref } from "vue";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface User {
	readonly id: string;
	readonly name: string;
	readonly login: string;
	readonly role: "ADMIN" | "MANAGER" | "OPERATOR";
	readonly active: boolean;
}

export const useAuthStore = defineStore("auth", () => {
	// State
	// TODO: Replace with real user from authentication in Phase 9
	const currentUser = ref<User>({
		id: "mock-user-1",
		name: "Usuário Demo",
		login: "demo",
		role: "ADMIN",
		active: true,
	});

	const isValidatingPassword = ref(false);

	// Actions
	const validatePassword = async (password: string): Promise<boolean> => {
		isValidatingPassword.value = true;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/auth/validate-password`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: currentUser.value.id,
						password,
					}),
				},
			);

			if (!response.ok) {
				return false;
			}

			const data = await response.json();
			return data.valid === true;
		} catch (error) {
			console.error("Error validating password:", error);
			return false;
		} finally {
			isValidatingPassword.value = false;
		}
	};

	return {
		currentUser,
		isValidatingPassword,
		validatePassword,
	};
});
