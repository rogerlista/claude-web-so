import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [vue()],
	test: {
		globals: true,
		environment: "happy-dom",
		include: [
			"src/**/*.{test,spec}.{js,ts,tsx}",
			"tests/**/*.{test,spec}.{js,ts,tsx}",
		],
		exclude: ["node_modules", "dist", "coverage", ".git"],
		coverage: {
			provider: "v8",
			enabled: true,
			reporter: ["text", "html", "lcov", "json"],
			reportsDirectory: "./coverage",
			include: ["src/**/*.{ts,tsx,vue}"],
			exclude: [
				"src/**/*.{test,spec}.{ts,tsx}",
				"src/**/*.d.ts",
				"src/**/types/**",
				"src/**/interfaces/**",
				"src/**/__mocks__/**", // Mock files
				"src/main.ts", // App entry point - tested via E2E
				"src/App.vue", // Root component - tested via E2E
				"src/db/schema.ts", // Re-exports from backend - tested in backend
				"src/db/migrate.ts", // Database migration script - not application code
				"src/db/client.ts", // Database infrastructure - tested via E2E
				"src/db/index.ts", // Re-export file - no logic to test
				"src/infrastructure/service-worker/index.ts", // Re-export file - no logic to test
			],
			// 100% coverage requirement - NO EXCEPTIONS
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100,
			},
			all: true,
			skipFull: false,
		},
		passWithNoTests: false,
		mockReset: true,
		restoreMocks: true,
		clearMocks: true,
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@domain": resolve(__dirname, "./src/domain"),
			"@application": resolve(__dirname, "./src/application"),
			"@infrastructure": resolve(__dirname, "./src/infrastructure"),
			"@presentation": resolve(__dirname, "./src/presentation"),
			"@shared": resolve(__dirname, "./src/shared"),
			"@components": resolve(__dirname, "./src/presentation/components"),
			"@views": resolve(__dirname, "./src/presentation/views"),
			"@composables": resolve(__dirname, "./src/presentation/composables"),
			"@stores": resolve(__dirname, "./src/application/stores"),
			"virtual:pwa-register": resolve(
				__dirname,
				"./src/infrastructure/service-worker/__mocks__/virtual-pwa-register.ts",
			),
		},
	},
});
