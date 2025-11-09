import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/js/setup.js"],
		globals: true,
	},
});

