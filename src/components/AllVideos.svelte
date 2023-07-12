<script>
	// https://stackoverflow.com/questions/57068381/how-to-redo-await-in-svelte
	// https://github.com/sveltejs/svelte-virtual-list

	import * as lib from "../lib.js";
	import VirtualList from "@sveltejs/svelte-virtual-list";
	import Video from "./Video.svelte";
	import { videos } from "../store/store.js";

	let videosready = queryvideos();
	let vids;

	videos.subscribe((value) => {
		vids = value;
	});

	async function queryvideos() {
		const db = await lib.opendatabase("yt-enhanced", 1, lib.upgrade);
		return new Promise((resolve) => {
			videos.update(async () => {
				await lib.queryalldata(db, "videos");
				resolve(true);
			});
		});
	}

	// for virtual list
	let start;
	let end;
</script>

<div class="video-container">
	{#await videosready}
		<p>Loading</p>
	{:then videosready}
		{#if true}
			<VirtualList items={vids} bind:start bind:end let:item>
				<Video {...item} />
			</VirtualList>
		{/if}
	{/await}
</div>

<style>
	.video-container {
		height: calc(100vh - 57px);
		padding-left: 10px;
		padding-bottom: 5px;
	}
</style>
