<script>
	import * as lib from "../lib.js";

	async function exportvideos() {
		const db = await lib.opendatabase("yt-enhanced", 1, lib.upgrade);
		const videos = await lib.queryalldata(db, "videos");

		const data = { allvideos: videos };
		const binary = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
		const url = "data:application/json;base64," + binary;

		let today = new Date();
		let dd = String(today.getDate()).padStart(2, "0");
		let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
		let yyyy = today.getFullYear();
		today = mm + "_" + dd + "_" + yyyy;

		chrome.downloads.download({
			url: url,
			filename: `yt_enhanced_export_${today}.json`,
		});
	}
</script>

<div>
	<button class="export" on:click={exportvideos}>Export</button>
</div>

<style>
	.export {
		border: 1px solid rgb(63, 63, 63);
		border-radius: 5px;
		font-size: 14px;
		margin: 20px;
		padding: 4px;
		cursor: pointer;
		user-select: none;
	}

	.export:active {
		background-color: rgb(212, 212, 212);
	}
</style>
