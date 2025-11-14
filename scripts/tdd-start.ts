#!/usr/bin/env tsx

/**
 * TDD Start Script
 *
 * This script helps you start a new TDD cycle (RED-GREEN-REFACTOR).
 * It provides guidance and validates your workflow.
 *
 * Usage: pnpm tdd:start
 */

const COLORS = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	bold: "\x1b[1m",
};

function log(_message: string, color?: string): void {
	const _colorCode = color ?? COLORS.reset;
}

function logHeader(message: string): void {
	log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", COLORS.cyan);
	log(` ${message}`, `${COLORS.bold}${COLORS.cyan}`);
	log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", COLORS.cyan);
}

function logStep(
	step: number,
	phase: string,
	description: string,
	color: string,
): void {
	log(`\n${step}. ${phase}`, `${COLORS.bold}${color}`);
	log(`   ${description}`, color);
}

function main(): void {
	logHeader("🚀 TDD WORKFLOW - RED-GREEN-REFACTOR");

	log("Welcome to the TDD workflow guide!", COLORS.cyan);
	log("Follow these steps to ensure quality code:", COLORS.cyan);

	logStep(
		1,
		"🔴 RED - Write a Failing Test",
		"Start by writing a test that fails because the feature does not exist yet.",
		COLORS.red,
	);
	log("   Example:", COLORS.red);
	log("   • Create a test file: 'feature.test.ts'", COLORS.red);
	log("   • Write a test that expects the feature to work", COLORS.red);
	log("   • Run 'pnpm test' - it should FAIL (RED)", COLORS.red);

	logStep(
		2,
		"🟢 GREEN - Make the Test Pass",
		"Write the minimal code needed to make the test pass.",
		COLORS.green,
	);
	log("   Example:", COLORS.green);
	log("   • Create the feature file: 'feature.ts'", COLORS.green);
	log("   • Implement only what's needed for the test", COLORS.green);
	log("   • Run 'pnpm test' - it should PASS (GREEN)", COLORS.green);

	logStep(
		3,
		"🔵 REFACTOR - Improve the Code",
		"Improve code quality while keeping tests green.",
		COLORS.blue,
	);
	log("   Example:", COLORS.blue);
	log("   • Clean up code, extract functions, rename variables", COLORS.blue);
	log("   • Run 'pnpm test' after each change", COLORS.blue);
	log("   • All tests must stay GREEN", COLORS.blue);

	logStep(
		4,
		"✅ VALIDATE - Run Full Quality Gates",
		"Ensure all quality gates pass before committing.",
		COLORS.magenta,
	);
	log("   Commands:", COLORS.magenta);
	log("   • pnpm tdd:validate  - Run all validations", COLORS.magenta);
	log("   • pnpm lint:fix      - Fix linting issues", COLORS.magenta);
	log("   • pnpm test:coverage - Check 100% coverage", COLORS.magenta);

	logHeader("📋 QUALITY REQUIREMENTS");
	log("✓ 100% test coverage (no exceptions)", COLORS.yellow);
	log("✓ All tests passing", COLORS.yellow);
	log("✓ No linting errors", COLORS.yellow);
	log("✓ No type errors (strict mode)", COLORS.yellow);
	log("✓ Conventional Commits format", COLORS.yellow);

	logHeader("🎯 READY TO START?");
	log("Run this command to validate your work at any time:", COLORS.green);
	log("  pnpm tdd:validate", `${COLORS.bold}${COLORS.green}`);
	log("Good luck! 🚀", COLORS.cyan);
}

// Run guide
main();
