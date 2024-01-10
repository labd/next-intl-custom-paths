import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	clean: true,
	splitting: false,
	dts: true,
	sourcemap: true,
	external: ["next/server", "next-intl"],
	format: ["esm", "cjs"],
	outDir: "dist",
});
