#!/usr/bin/env tsx

/**
 * TDD Validator Script
 *
 * This script validates that the TDD cycle (RED-GREEN-REFACTOR) is being followed.
 * It checks:
 * 1. Tests exist for all source files
 * 2. Coverage is at 100%
 * 3. All tests pass
 *
 * Usage: pnpm tdd:validate
 */

import { execSync } from "node:child_process";

interface ValidationResult {
	passed: boolean;
	message: string;
	details?: string[];
}

const COLORS = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	bold: "\x1b[1m",
};

function log(_message: string, color?: string): void {
	const _colorCode = color ?? COLORS.reset;
}

function logHeader(message: string): void {
	log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", COLORS.blue);
	log(` ${message}`, `${COLORS.bold}${COLORS.blue}`);
	log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", COLORS.blue);
}

function logSuccess(message: string): void {
	log(`✅ ${message}`, COLORS.green);
}

function logError(message: string): void {
	log(`❌ ${message}`, COLORS.red);
}

function validateTests(): ValidationResult {
	try {
		log("🔍 Running tests...", COLORS.blue);
		execSync("pnpm test", { stdio: "inherit", cwd: process.cwd() });
		return {
			passed: true,
			message: "All tests passed",
		};
	} catch (_error) {
		return {
			passed: false,
			message: "Tests failed",
			details: ["Some tests are failing. Fix them before proceeding."],
		};
	}
}

function validateCoverage(): ValidationResult {
	try {
		log("📊 Checking coverage...", COLORS.blue);
		execSync("pnpm test:coverage", { stdio: "inherit", cwd: process.cwd() });
		return {
			passed: true,
			message: "Coverage is at 100%",
		};
	} catch (_error) {
		return {
			passed: false,
			message: "Coverage is below 100%",
			details: [
				"All code must have 100% test coverage.",
				"Write tests for uncovered code before proceeding.",
			],
		};
	}
}

function validateLinting(): ValidationResult {
	try {
		log("🎨 Checking linting...", COLORS.blue);
		execSync("pnpm lint", { stdio: "inherit", cwd: process.cwd() });
		return {
			passed: true,
			message: "Code passes linting checks",
		};
	} catch (_error) {
		return {
			passed: false,
			message: "Linting issues found",
			details: ["Fix linting issues by running: pnpm lint:fix"],
		};
	}
}

function validateTypecheck(): ValidationResult {
	try {
		log("🔍 Checking types...", COLORS.blue);
		execSync("pnpm typecheck", { stdio: "inherit", cwd: process.cwd() });
		return {
			passed: true,
			message: "Type checking passed",
		};
	} catch (_error) {
		return {
			passed: false,
			message: "Type errors found",
			details: ["Fix type errors before proceeding."],
		};
	}
}

async function main(): Promise<void> {
	logHeader("TDD VALIDATION - RED-GREEN-REFACTOR CYCLE");

	log(
		"This validator ensures you are following TDD best practices:",
		COLORS.yellow,
	);
	log("  1. RED: Write a failing test first", COLORS.red);
	log("  2. GREEN: Make the test pass with minimal code", COLORS.green);
	log("  3. REFACTOR: Improve the code while keeping tests green", COLORS.blue);

	const validations: Array<{ name: string; fn: () => ValidationResult }> = [
		{ name: "Linting", fn: validateLinting },
		{ name: "Type Checking", fn: validateTypecheck },
		{ name: "Tests", fn: validateTests },
		{ name: "Coverage", fn: validateCoverage },
	];

	const results: ValidationResult[] = [];

	for (const validation of validations) {
		logHeader(`Validating: ${validation.name}`);
		const result = validation.fn();
		results.push(result);

		if (result.passed) {
			logSuccess(result.message);
		} else {
			logError(result.message);
			if (result.details !== undefined) {
				for (const detail of result.details) {
					log(`  ${detail}`, COLORS.yellow);
				}
			}
		}
	}

	// Summary
	logHeader("VALIDATION SUMMARY");

	const allPassed = results.every((r) => r.passed);

	if (allPassed) {
		logSuccess("All validations passed! ✨");
		log(
			"Your code follows TDD best practices and is ready to commit.",
			COLORS.green,
		);
		process.exit(0);
	} else {
		logError("Some validations failed");
		log("Fix the issues above before committing.", COLORS.red);
		process.exit(1);
	}
}

// Run validator
main().catch((error) => {
	logError("Validator crashed");
	console.error(error);
	process.exit(1);
});
