/**
 * Commitlint configuration for Conventional Commits
 * @see https://commitlint.js.org/
 * @see https://www.conventionalcommits.org/
 */

export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		// Type enum: allowed commit types
		"type-enum": [
			2,
			"always",
			[
				"feat", // New feature
				"fix", // Bug fix
				"docs", // Documentation only changes
				"style", // Code style changes (formatting, missing semi colons, etc)
				"refactor", // Code change that neither fixes a bug nor adds a feature
				"perf", // Performance improvement
				"test", // Adding missing tests or correcting existing tests
				"build", // Changes to build system or external dependencies
				"ci", // Changes to CI configuration files and scripts
				"chore", // Other changes that don't modify src or test files
				"revert", // Reverts a previous commit
			],
		],
		// Subject case: lowercase
		"subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
		// Subject empty: not allowed
		"subject-empty": [2, "never"],
		// Subject full stop: no period at the end
		"subject-full-stop": [2, "never", "."],
		// Subject max length: 100 characters
		"subject-max-length": [2, "always", 100],
		// Subject min length: 3 characters
		"subject-min-length": [2, "always", 3],
		// Type case: lowercase
		"type-case": [2, "always", "lower-case"],
		// Type empty: not allowed
		"type-empty": [2, "never"],
		// Scope case: lowercase
		"scope-case": [2, "always", "lower-case"],
		// Scope empty: allowed (optional)
		"scope-empty": [0, "never"],
		// Body leading blank: require blank line before body
		"body-leading-blank": [2, "always"],
		// Body max line length: 100 characters
		"body-max-line-length": [2, "always", 100],
		// Footer leading blank: require blank line before footer
		"footer-leading-blank": [2, "always"],
		// Footer max line length: 100 characters
		"footer-max-line-length": [2, "always", 100],
		// Header max length: 100 characters
		"header-max-length": [2, "always", 100],
	},
};
