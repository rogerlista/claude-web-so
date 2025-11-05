/**
 * @pos-nfce/shared
 *
 * Shared utilities and types for POS NFC-e system.
 * This package contains all common code used across backend and frontend.
 *
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for shared code.
 * Never duplicate code between packages - always use @pos-nfce/shared.
 */

// Types
export type { Brand } from './types/brand'
export type { Result } from './types/result'
export type { Option } from './types/option'

// Utilities
export { ResultUtils } from './utils/result'
export { OptionUtils } from './utils/option'
export { pipe } from './utils/pipe'
export { compose } from './utils/compose'
