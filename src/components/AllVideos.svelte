<script>
	// https://stackoverflow.com/questions/57068381/how-to-redo-await-in-svelte
	// https://github.com/sveltejs/svelte-virtual-list

	import * as lib from "../lib.js";
	import VirtualList from "@sveltejs/svelte-virtual-list";
	import Video from "./Video.svelte";
	import { videos } from "../store/store.js";

	/*------------ prepare reactive state ------------*/
	let videosvalue = [];

	videos.subscribe((value) => {
		videosvalue = value;
	});

	// for virtual list
	let start;
	let end;

	/*------------ populate videos state ------------*/
	async function queryvideos() {
		const db = await lib.opendatabase("yt-enhanced", 1, lib.upgrade);
		const v = await lib.queryalldata(db, "videos");
		videos.set(v);
	}

	queryvideos();
</script>

<div class="video-container">
	{#if videosvalue.length}
		<VirtualList items={videosvalue} bind:start bind:end let:item>
			<Video {...item} />
		</VirtualList>
	{:else}
		<p>
			Go to <a target="_blank" href="https://www.youtube.com/">Youtube</a>
			to add some videos!
		</p>
	{/if}
</div>

<style>
	.video-container {
		height: calc(100vh - 57px);
		padding-left: 10px;
		padding-bottom: 5px;
	}
</style>
