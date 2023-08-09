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

	/*------------ make user choose ui on youtube.com ------------*/
	const uioptions = [
		{ id: "full", text: "Loop and Save" },
		{ id: "save", text: "Only Save" },
		{ id: "none", text: "Neither" },
	];

	let selected = "";

	async function loaduioption() {
		const result = await chrome.storage.local.get(["uioption"]);
		selected = result.uioption.option;

		return "";
	}

	// if (["full", "save", "none"].includes(result.uioption.option)) {
	// 	selected = result.uioption.option;
	// }

	async function uichanged() {
		await chrome.storage.local.set({
			uioption: { option: selected },
		});
	}
</script>

<div>
	<div class="export" on:click={exportvideos}>Export</div>
	{#await loaduioption() then uiloaded}
		<select class="ui-options" bind:value={selected} on:change={uichanged}>
			{#each uioptions as uioption}
				<option value={uioption.id}>
					{uioption.text}
				</option>
			{/each}
		</select>
	{/await}
</div>

<style>
	.export {
		border: 1px solid rgb(151, 151, 151);
		border-radius: 5px;
		font-size: 14px;
		margin: 20px;
		padding: 4px 8px;
		cursor: pointer;
		user-select: none;
	}

	.export:active {
		background-color: rgb(212, 212, 212);
	}

	.ui-options {
		outline: none;
		border: 1px solid rgb(151, 151, 151);
		border-radius: 5px;
		font-size: 14px;
		margin: 20px;
		background-color: #181a21;
		color: #ffffff;
		padding: 4px 8px;
		cursor: pointer;
		user-select: none;
	}
</style>
