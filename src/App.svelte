<script>
	import AllVideos from "./components/AllVideos.svelte";
	import Playlists from "./components/Playlists.svelte";
	import Settings from "./components/Settings.svelte";

	let currenttab = "allvideos";

	function settab(newtab, settings) {
		currenttab = newtab;
	}
</script>

<div class="app-container">
	<div class="tab-selector">
		<div class="yt-enhanced-logo">Yt Enhanced</div>
		<div class="tab-select-options">
			<div on:click={() => settab("allvideos", false)}>All Videos</div>
			<div on:click={() => settab("playlists", false)}>Playlists</div>
			<div on:click={() => settab("settings", true)}>Settings</div>
		</div>
	</div>

	<div class="tab-view">
		{#if currenttab === "allvideos"}
			<AllVideos />
		{:else if currenttab === "playlists"}
			<Playlists />
		{:else if currenttab === "settings"}
			<Settings />
		{/if}
	</div>
</div>

<style lang="scss">
	.app-container {
		display: flex;
		background-color: #181a21; // #030303
		color: #ffffff;
		min-height: 100vh;
	}

	.tab-selector {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		user-select: none;
		flex-direction: column;
		margin: 10px;
		width: 170px;

		.yt-enhanced-logo {
			font-weight: bold;
			font-size: 20px;
			margin-bottom: 15px;
			width: 80%;
		}

		.tab-select-options {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			width: 100%;

			div {
				display: flex;
				align-items: center;
				width: 80%;
				margin: 2px;
				cursor: pointer;
				padding: 6px 12px;
				font-size: 18px;
				border-radius: 5px;
			}

			div:hover {
				background-color: #353535;
			}

			div:active {
				background-color: #1d1d1d;
			}
		}
	}

	.tab-view {
		display: flex;
		flex-grow: 1;
	}
</style>
