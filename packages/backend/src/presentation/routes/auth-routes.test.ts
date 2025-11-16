/**
 * Tests for Auth Routes
 * Task 1.6: Backend password validation endpoint
 */

import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../../infrastructure/database/schema";
import { users } from "../../infrastructure/database/schema";
import { createAuthRoutes } from "./auth-routes";

describe("Auth Routes", () => {
	let db: BetterSQLite3Database<typeof schema>;
	let app: ReturnType<typeof createAuthRoutes>;

	beforeEach(async () => {
		// Create in-memory database for each test
		const sqlite = new Database(":memory:");
		db = drizzle(sqlite, { schema });

		// Run migrations
		migrate(db, { migrationsFolder: "./drizzle" });

		// Create test user
		const passwordHash = await bcrypt.hash("admin123", 10);
		await db.insert(users).values({
			id: "test-user-1",
			name: "Test User",
			login: "testuser",
			passwordHash,
			role: "ADMIN",
			active: true,
		});

		// Create routes app
		app = createAuthRoutes({ db });
	});

	describe("POST /validate-password", () => {
		it("should return valid:true for correct password", async () => {
			const res = await app.request("/validate-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: "test-user-1",
					password: "admin123",
				}),
			});

			expect(res.status).toBe(200);

			const data = (await res.json()) as { type: string; error: string };
			expect(data).toEqual({ valid: true });
		});

		it("should return valid:false for incorrect password", async () => {
			const res = await app.request("/validate-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: "test-user-1",
					password: "wrongpassword",
				}),
			});

			expect(res.status).toBe(200);

			const data = (await res.json()) as { type: string; error: string };
			expect(data).toEqual({ valid: false });
		});

		it("should return 404 for non-existent user", async () => {
			const res = await app.request("/validate-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: "non-existent",
					password: "admin123",
				}),
			});

			expect(res.status).toBe(404);

			const data = (await res.json()) as { type: string; error: string };
			expect(data.type).toBe("USER_NOT_FOUND");
			expect(data.error).toContain("non-existent");
		});

		it("should return 400 for missing userId", async () => {
			const res = await app.request("/validate-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					password: "admin123",
				}),
			});

			expect(res.status).toBe(400);

			const data = (await res.json()) as { type: string; error: string };
			expect(data.type).toBe("VALIDATION_ERROR");
			expect(data.error).toContain("userId and password are required");
		});

		it("should return 400 for missing password", async () => {
			const res = await app.request("/validate-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: "test-user-1",
				}),
			});

			expect(res.status).toBe(400);

			const data = (await res.json()) as { type: string; error: string };
			expect(data.type).toBe("VALIDATION_ERROR");
			expect(data.error).toContain("userId and password are required");
		});

		it("should handle empty password", async () => {
			const res = await app.request("/validate-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: "test-user-1",
					password: "",
				}),
			});

			expect(res.status).toBe(400);

			const data = (await res.json()) as { type: string; error: string };
			expect(data.type).toBe("VALIDATION_ERROR");
		});
	});
});
