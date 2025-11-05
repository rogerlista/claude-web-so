/**
 * Frontend Database Schema
 *
 * Reutiliza os schemas do backend para garantir consistência
 * entre o banco de dados local (SQLite web) e o backend (SQLite servidor)
 */

// Re-export all schemas from backend
export {
  // Customer tables
  customers,
  type CustomerRow,
  type CustomerInsert,
  // Product tables
  products,
  type ProductRow,
  type ProductInsert,
  // Inventory tables
  inventory,
  type InventoryRow,
  type InventoryInsert,
  // Sale tables
  sales,
  saleItems,
  salePayments,
  type SaleRow,
  type SaleInsert,
  type SaleItemRow,
  type SaleItemInsert,
  type SalePaymentRow,
  type SalePaymentInsert,
  // Cash management tables
  cashMovements,
  cashTransactions,
  type CashMovementRow,
  type CashMovementInsert,
  type CashTransactionRow,
  type CashTransactionInsert,
  // User tables
  users,
  type UserRow,
  type UserInsert,
  // Audit tables
  audit,
  type AuditRow,
  type AuditInsert,
} from '../../../backend/src/infrastructure/database/schema'
