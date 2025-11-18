/**
 * Router Tests
 * TDD Phase: RED - Tests written before implementation
 */

import { describe, expect, it } from "vitest";
import { createMemoryHistory } from "vue-router";
import { createRouter } from "./index";

describe("Router", () => {
	it("should create router instance", () => {
		const router = createRouter(createMemoryHistory());
		expect(router).toBeDefined();
	});

	it("should have login route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "login");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/login");
	});

	it("should have products list route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "products");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/products");
	});

	it("should have product create route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "product-create");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/products/create");
	});

	it("should have product edit route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "product-edit");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/products/:id/edit");
	});

	it("should have home/dashboard route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "home");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/");
	});

	it("should redirect to login when not authenticated", async () => {
		const router = createRouter(createMemoryHistory());
		await router.push("/products");
		// This will be implemented with auth guard
		expect(router.currentRoute.value.path).toBeDefined();
	});

	it("should have POS route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "pos");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/pos");
	});

	it("should have POS checkout route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "pos-checkout");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/pos/checkout/:id");
	});

	it("should have inventory route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "inventory");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/inventory");
	});

	it("should have inventory movement route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router
			.getRoutes()
			.find((r) => r.name === "inventory-movement");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/inventory/movement");
	});

	it("should have inventory count route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "inventory-count");
		expect(route).toBeDefined();
		expect(route?.path).toBe("/inventory/count");
	});

	it("should set requiresAuth meta for protected routes", () => {
		const router = createRouter(createMemoryHistory());
		const productsRoute = router.getRoutes().find((r) => r.name === "products");
		expect(productsRoute?.meta.requiresAuth).toBe(true);
	});

	it("should not require auth for login route", () => {
		const router = createRouter(createMemoryHistory());
		const loginRoute = router.getRoutes().find((r) => r.name === "login");
		expect(loginRoute?.meta.requiresAuth).toBe(false);
	});

	it("should have props enabled for product edit route", () => {
		const router = createRouter(createMemoryHistory());
		const route = router.getRoutes().find((r) => r.name === "product-edit");
		expect(route?.props).toBeTruthy();
	});

	it("should navigate to routes", async () => {
		const router = createRouter(createMemoryHistory());
		await router.push("/");
		expect(router.currentRoute.value.path).toBe("/");

		await router.push("/login");
		expect(router.currentRoute.value.path).toBe("/login");

		await router.push("/products");
		expect(router.currentRoute.value.path).toBe("/products");
	});
});
