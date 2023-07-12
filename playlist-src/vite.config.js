import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// set browser to brave
// process.env.BROWSER = "brave";

export default defineConfig({
	plugins: [svelte({})],
	// specify other file
	build: {
		outDir: "../playlist",
	},
	// alter filepath so it's absolute from extension root
	base: "/playlist",
	// open on developement start
	// server: {
	// 	open: "playlist.html",
	// },
});
