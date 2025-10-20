import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: ["./tests/frontend/setup.js"],
        globals: true,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./resources/js"),
        },
    },
});
