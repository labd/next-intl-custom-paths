import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			all: true,
			include: ["src/**/*.ts"],
			reportsDirectory: "./test-reports/",
		},
		passWithNoTests: true,
		exclude: ["next-intl/"],
		include: ["src/**/*.spec.ts"],
	},

	resolve: {
		alias: {
			"~src": path.join(__dirname, "src"),
		},
	},
});
