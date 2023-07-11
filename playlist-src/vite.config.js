import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// set browser to brave
process.env.BROWSER = "brave";

export default defineConfig({
	plugins: [svelte({})],
	// specify other file
	build: {
		outDir: "../playlist",
		rollupOptions: {
			input: {
				app: "./playlist.html",
			},
		},
	},
	// open on developement start
	server: {
		open: "playlist.html",
	},
});
