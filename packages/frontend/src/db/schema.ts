/**
 * Frontend Database Schema
 *
 * Reutiliza os schemas do backend para garantir consistência
 * entre o banco de dados local (SQLite web) e o backend (SQLite servidor)
 */

// Re-export all schemas from backend
export {
	type AuditInsert,
	type AuditRow,
	// Audit tables
	audit,
	type CashMovementInsert,
	type CashMovementRow,
	type CashTransactionInsert,
	type CashTransactionRow,
	type CustomerInsert,
	type CustomerRow,
	// Cash management tables
	cashMovements,
	cashTransactions,
	// Customer tables
	customers,
	type InventoryInsert,
	type InventoryRow,
	// Inventory tables
	inventory,
	type ProductInsert,
	type ProductRow,
	// Product tables
	products,
	type SaleInsert,
	type SaleItemInsert,
	type SaleItemRow,
	type SalePaymentInsert,
	type SalePaymentRow,
	type SaleRow,
	saleItems,
	salePayments,
	// Sale tables
	sales,
	type UserInsert,
	type UserRow,
	// User tables
	users,
} from "../../../backend/src/infrastructure/database/schema";
