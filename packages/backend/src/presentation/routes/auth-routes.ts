import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Hono } from "hono";
import {
	type ValidatePasswordInput,
	validatePassword,
} from "../../application/use-cases/validate-password";
import type * as schema from "../../infrastructure/database/schema";
import { users } from "../../infrastructure/database/schema";

/**
 * Auth Routes
 *
 * REST API endpoints for authentication
 * Following Hexagonal Architecture - this is the HTTP Adapter
 *
 * Endpoints:
 * - POST /api/auth/validate-password - Validate user password
 */

type AuthRoutesDeps = {
	readonly db: BetterSQLite3Database<typeof schema>;
};

/**
 * Creates auth routes with injected dependencies
 *
 * @param deps - Dependencies (database)
 * @returns Hono app with auth routes
 */
export const createAuthRoutes = (deps: AuthRoutesDeps): Hono => {
	const app = new Hono();

	/**
	 * POST /api/auth/validate-password
	 *
	 * Validates a user's password
	 *
	 * Request body:
	 * {
	 *   "userId": "admin-001",
	 *   "password": "admin123"
	 * }
	 *
	 * Response:
	 * - 200: { "valid": true/false }
	 * - 404: { "error": "User not found", "type": "USER_NOT_FOUND" }
	 * - 500: { "error": "Internal server error", "type": "UNKNOWN" }
	 */
	app.post("/validate-password", async (c) => {
		try {
			const body = await c.req.json<ValidatePasswordInput>();

			const { userId, password } = body;

			if (!userId || !password) {
				return c.json(
					{
						error: "userId and password are required",
						type: "VALIDATION_ERROR",
					},
					400,
				);
			}

			// Create simple repository adapter for the use case
			const userRepo = {
				findById: async (id: string) => {
					const user = await deps.db
						.select({ passwordHash: users.passwordHash })
						.from(users)
						.where(eq(users.id, id))
						.limit(1);

					return user[0] ?? null;
				},
			};

			const result = await validatePassword(userRepo, { userId, password });

			if (result.ok) {
				return c.json({ valid: result.value }, 200);
			}

			// Handle errors
			const { error } = result;
			switch (error.type) {
				case "USER_NOT_FOUND":
					return c.json({ error: error.message, type: error.type }, 404);
				case "VALIDATION_ERROR":
					return c.json({ error: error.message, type: error.type }, 400);
				default:
					return c.json({ error: error.message, type: error.type }, 500);
			}
		} catch (error) {
			console.error("[Auth Routes] Error validating password:", error);
			return c.json(
				{
					error: "Internal server error",
					type: "UNKNOWN",
				},
				500,
			);
		}
	});

	return app;
};
