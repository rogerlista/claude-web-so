/**
 * Frontend Database Client
 *
 * Configura SQLite usando SQL.js para funcionar no browser
 * e conecta com Drizzle ORM
 */

import type { SQLJsDatabase } from "drizzle-orm/sql-js";
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs, { type Database } from "sql.js";
import * as schema from "./schema";

// Global state para manter a conexão
let sqlJsDb: Database | null = null;
let db: SQLJsDatabase<typeof schema> | null = null;

/**
 * Inicializa o banco de dados SQL.js
 *
 * @returns Promise com a instância do Drizzle client
 */
export async function initDatabase(): Promise<SQLJsDatabase<typeof schema>> {
	// Se já foi inicializado, retorna a instância existente
	if (db) {
		return db;
	}

	try {
		// Inicializa SQL.js
		const SQL = await initSqlJs({
			// Carrega o WASM do CDN ou de node_modules
			locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
		});

		// Tenta carregar banco existente do LocalStorage
		const savedDb = loadDatabaseFromStorage();

		// Cria ou restaura o banco de dados
		if (savedDb) {
			sqlJsDb = new SQL.Database(savedDb);
			console.info("[DB] Database loaded from storage");
		} else {
			sqlJsDb = new SQL.Database();
			console.info("[DB] New database created");
		}

		// Cria o client Drizzle
		db = drizzle(sqlJsDb, { schema });

		// Salva o banco periodicamente
		startAutoSave();

		return db;
	} catch (error) {
		console.error("[DB] Failed to initialize database:", error);
		throw error;
	}
}

/**
 * Carrega o banco de dados do LocalStorage
 */
function loadDatabaseFromStorage(): Uint8Array | null {
	try {
		const dbData = localStorage.getItem("pos-nfce-db");
		if (!dbData) {
			return null;
		}

		// Converte base64 para Uint8Array
		const binaryString = atob(dbData);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes;
	} catch (error) {
		console.error("[DB] Failed to load database from storage:", error);
		return null;
	}
}

/**
 * Salva o banco de dados no LocalStorage
 */
export function saveDatabaseToStorage(): void {
	if (!sqlJsDb) {
		return;
	}

	try {
		// Exporta o banco como Uint8Array
		const data = sqlJsDb.export();

		// Converte para base64
		const binary = String.fromCharCode(...data);
		const base64 = btoa(binary);

		// Salva no localStorage
		localStorage.setItem("pos-nfce-db", base64);
		console.debug("[DB] Database saved to storage");
	} catch (error) {
		console.error("[DB] Failed to save database to storage:", error);
	}
}

/**
 * Inicia salvamento automático a cada 5 segundos
 */
function startAutoSave(): void {
	setInterval(() => {
		saveDatabaseToStorage();
	}, 5000); // 5 segundos
}

/**
 * Fecha a conexão com o banco de dados
 */
export function closeDatabase(): void {
	if (sqlJsDb) {
		// Salva antes de fechar
		saveDatabaseToStorage();
		sqlJsDb.close();
		sqlJsDb = null;
		db = null;
		console.info("[DB] Database closed");
	}
}

/**
 * Exporta a instância do Drizzle client
 *
 * @throws Error se o banco não foi inicializado
 */
export function getDatabase(): SQLJsDatabase<typeof schema> {
	if (!db) {
		throw new Error("Database not initialized. Call initDatabase() first.");
	}
	return db;
}

// Limpa o banco quando a página é fechada
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		saveDatabaseToStorage();
	});
}
