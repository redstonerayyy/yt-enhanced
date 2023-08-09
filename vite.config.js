import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess/dist/autoProcess";

export default defineConfig({
	plugins: [
		svelte({
			preprocess: sveltePreprocess(),
		}),
	],
	// specify other file
	build: {
		outDir: "./playlist",
	},
	// alter filepath so it's absolute from extension root
	base: "/playlist",
});

// for in browser use
// process.env.BROWSER = "brave";
// https://stackoverflow.com/questions/71295772/in-vite-is-there-a-way-to-update-the-root-html-name-from-index-html
