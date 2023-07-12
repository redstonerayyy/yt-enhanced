<script>
	import AllVideos from "./components/AllVideos.svelte";
	import Playlists from "./components/Playlists.svelte";
	import Settings from "./components/Settings.svelte";

	import settings_img from "./images/settings.svg";
	import settings_filled_img from "./images/settings-filled.svg";

	let currenttab = "allvideos";
	let src = settings_img;

	function settab(newtab, settings) {
		currenttab = newtab;

		if (settings) {
			src = settings_filled_img;
		} else {
			src = settings_img;
		}
	}
</script>

<div class="app-container">
	<div class="tab-selector">
		<button on:click={() => settab("allvideos", false)}>All Videos</button>
		<button on:click={() => settab("playlists", false)}>Playlists</button>
		<button on:click={() => settab("settings", true)}>
			<img {src} alt="Settings" />
		</button>
	</div>

	{#if currenttab === "allvideos"}
		<AllVideos />
	{:else if currenttab === "playlists"}
		<Playlists />
	{:else if currenttab === "settings"}
		<Settings />
	{/if}
</div>

<style>
	.app-container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.tab-selector {
		display: flex;
		justify-content: space-between;
		align-items: center;
		user-select: none;
	}

	.tab-selector > button {
		margin: 10px;
		cursor: pointer;
		background-color: white;
		border: 2px solid rgb(61, 66, 66);
		border-radius: 3px;
		padding: 2px 6px;
		font-size: 18px;
	}

	.tab-selector > button:hover {
		border-color: rgb(81, 211, 211);
	}

	.tab-selector > button:active {
		background-color: rgb(211, 211, 211);
	}
</style>
