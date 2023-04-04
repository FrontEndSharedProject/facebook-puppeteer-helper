import { defineConfig } from "vite";

export default defineConfig({
    build: {
        minify:true,
        lib: {
            entry: "index.js",
            name: "fph",
            formats: ["iife"],
            fileName: (format) => `index.js`,
        },
    },
});
