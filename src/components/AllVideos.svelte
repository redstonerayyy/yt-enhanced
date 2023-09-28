<script>
	// https://stackoverflow.com/questions/57068381/how-to-redo-await-in-svelte
	// https://github.com/sveltejs/svelte-virtual-list

	import * as lib from "../lib.js";
	import VirtualList from "@sveltejs/svelte-virtual-list";
	import Video from "./Video.svelte";
	import { videos } from "../store/store.js";
	import randomsrc from "../images/random.svg";

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

	async function playrandomvideo() {
		/*------------ select random video ------------*/
		const randomvideoid =
			videosvalue[Math.floor(Math.random() * videosvalue.length)].videoid;

		/*------------ query if there is a player tab ------------*/
		const playerinfoobject = await chrome.storage.local.get(["playerinfo"]);
		const playlistinfoobject = await chrome.storage.local.get([
			"playlistinfo",
		]);

		let targetid = undefined;

		/*------------ check if tab already exists ------------*/
		try {
			if (playerinfoobject.playerinfo.tabid !== undefined) {
				// produces error if id is outdated
				let tab = await chrome.tabs.get(
					playerinfoobject.playerinfo.tabid
				);
				targetid = playerinfoobject.playerinfo.tabid;
			}
		} catch (e) {}

		/*------------ does not exist, create it ------------*/
		if (targetid === undefined) {
			const tabid = (
				await chrome.tabs.create({
					url: `https://www.youtube.com/watch?v=${randomvideoid}`,
					active: false,
				})
			).id;

			/*------------ update storage ------------*/
			chrome.storage.local.set({
				playerinfo: { tabid: tabid },
			});

			/*------------ group it ------------*/
			try {
				if (playlistinfoobject.playlistinfo.groupid !== undefined) {
					const group = await chrome.tabs.group({
						groupId: playlistinfoobject.playlistinfo.groupid,
						tabIds: tabid,
					});
				}
			} catch (e) {
				console.log(e);
			}

			targetid = tabid;
		}

		/*------------ tab exists, change it's url ------------*/
		await chrome.tabs.update(targetid, {
			url: `https://www.youtube.com/watch?v=${randomvideoid}`,
		});
	}
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
	<div class="random-button" on:click={playrandomvideo}>
		<img src={randomsrc} alt="" />
	</div>
</div>

<style lang="scss">
	.video-container {
		padding-left: 10px;
		padding-bottom: 5px;
		flex-grow: 1;
	}

	.random-button {
		padding: 7px 10px;
		border-radius: 5px;
		position: absolute;
		right: 80px;
		bottom: 40px;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			background: #706969;
			cursor: pointer;
		}

		img {
			width: 40px;
		}
	}
</style>
