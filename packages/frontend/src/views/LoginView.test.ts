/**
 * LoginView Tests
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import LoginView from "./LoginView.vue";

const mockRouter = createRouter({
	history: createMemoryHistory(),
	routes: [
		{
			path: "/login",
			name: "login",
			component: LoginView,
		},
		{
			path: "/",
			name: "home",
			component: { template: "<div>Home</div>" },
		},
	],
});

describe("LoginView", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
	});

	it("should render component", () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.exists()).toBe(true);
	});

	it("should render LoginForm component", () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.findComponent({ name: "LoginForm" }).exists()).toBe(true);
	});

	it("should handle successful login", async () => {
		await mockRouter.push("/login");
		await mockRouter.isReady();

		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const loginForm = wrapper.findComponent({ name: "LoginForm" });
		await loginForm.vm.$emit("submit", {
			username: "admin",
			password: "admin",
		});

		// Wait for async operation
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Check that navigation occurred
		expect(mockRouter.currentRoute.value.path).toBe("/");
	});

	it("should handle failed login", async () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const loginForm = wrapper.findComponent({ name: "LoginForm" });
		await loginForm.vm.$emit("submit", {
			username: "wrong",
			password: "wrong",
		});

		// Wait for async operation
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Check that error is set
		expect(wrapper.vm.loginError).toBe("Usuário ou senha inválidos");
	});

	it("should set loading state during login", async () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const loginForm = wrapper.findComponent({ name: "LoginForm" });
		loginForm.vm.$emit("submit", {
			username: "admin",
			password: "admin",
		});

		// Check loading state immediately after submission
		await wrapper.vm.$nextTick();
		expect(wrapper.vm.isLoading).toBe(true);

		// Wait for async operation to complete
		await new Promise((resolve) => setTimeout(resolve, 1100));
		expect(wrapper.vm.isLoading).toBe(false);
	});

	it("should clear error on new login attempt", async () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const loginForm = wrapper.findComponent({ name: "LoginForm" });

		// First failed login
		await loginForm.vm.$emit("submit", {
			username: "wrong",
			password: "wrong",
		});
		await new Promise((resolve) => setTimeout(resolve, 1100));
		expect(wrapper.vm.loginError).toBe("Usuário ou senha inválidos");

		// Second login attempt should clear error
		loginForm.vm.$emit("submit", {
			username: "admin",
			password: "admin",
		});
		await wrapper.vm.$nextTick();
		expect(wrapper.vm.loginError).toBe("");
	});

	it("should pass loading prop to LoginForm", () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const loginForm = wrapper.findComponent({ name: "LoginForm" });
		expect(loginForm.props("loading")).toBe(false);
	});

	it("should pass error prop to LoginForm", async () => {
		const wrapper = mount(LoginView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const loginForm = wrapper.findComponent({ name: "LoginForm" });
		await loginForm.vm.$emit("submit", {
			username: "wrong",
			password: "wrong",
		});

		await new Promise((resolve) => setTimeout(resolve, 1100));

		expect(loginForm.props("error")).toBe("Usuário ou senha inválidos");
	});
});
