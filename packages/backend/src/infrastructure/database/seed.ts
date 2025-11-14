import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users } from "./schema";

/**
 * Database Seed Script
 *
 * Creates initial admin user for the system.
 */

const main = async () => {
	const sqlite = new Database("./data/pos-nfce.db");
	const db = drizzle(sqlite);

	try {
		// Insert admin user (password: admin123 - must be changed on first login)
		const adminId = "admin-001";
		const hashedPassword =
			"$2a$10$rOi5H3QZo3ypX7gRKRxHE.8FvMfJjOZFqHhC.EqFLqoT7kPRxZe8O"; // admin123

		await db.insert(users).values({
			id: adminId,
			name: "Administrador",
			login: "admin",
			passwordHash: hashedPassword,
			role: "ADMIN",
			active: true,
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			console.info("ℹ️  Admin user already exists, skipping...");
			return;
		}
		console.error("❌ Error seeding database:", error);
		throw error;
	} finally {
		sqlite.close();
	}
};

main();
