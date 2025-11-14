import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{js,ts}"],
		exclude: ["node_modules", "dist", "coverage", ".git"],
		coverage: {
			provider: "v8",
			enabled: true,
			reporter: ["text", "html", "lcov", "json"],
			reportsDirectory: "./coverage",
			include: ["src/**/*.ts"],
			exclude: [
				"src/**/*.{test,spec}.ts",
				"src/**/*.d.ts",
				"src/**/index.ts", // Re-export files
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
});
