import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "sqlite",
	// Frontend usa SQL.js que não precisa de dbCredentials
	// A conexão é gerenciada em runtime pelo client
});
