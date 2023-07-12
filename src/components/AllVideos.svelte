<script>
	// https://stackoverflow.com/questions/57068381/how-to-redo-await-in-svelte
	// https://github.com/sveltejs/svelte-virtual-list

	import * as lib from "../lib.js";
	import VirtualList from "@sveltejs/svelte-virtual-list";
	import Video from "./Video.svelte";

	let videos = queryvideos();
	// let videos = [
	// 	{ title: "delain", videoid: "abc" },
	// 	{ title: "delain", videoid: "abc" },
	// 	{ title: "delain", videoid: "abc" },
	// 	{ title: "delain", videoid: "abc" },
	// ];

	console.log(videos);

	function updatevideos() {
		videos = queryvideos;
	}

	async function queryvideos() {
		const db = await lib.opendatabase("yt-enhanced", 1, lib.upgrade);
		const videos = await lib.queryalldata(db, "videos");
		console.log(videos);
		return videos;
	}

	// for virtual list
	let start;
	let end;
</script>

<div class="video-container">
	{#await videos}
		<p>Loading</p>
	{:then videos}
		{#if videos}
			<VirtualList items={videos} bind:start bind:end let:item>
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
