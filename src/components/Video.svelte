<script>
	export let title;
	export let videoid;

	import playsrc from "../images/play.svg";
	import newtabsrc from "../images/newtab.svg";

	async function openvideo() {
		const tabid = (
			await chrome.tabs.create({
				url: `https://www.youtube.com/watch?v=${videoid}`,
			})
		).id;

		/*------------ and at to the ye group ------------*/
		const result = await chrome.storage.local.get(["playlistinfo"]);

		try {
			if (result.playlistinfo.groupid !== undefined) {
				const group = await chrome.tabs.group({
					groupId: result.playlistinfo.groupid,
					tabIds: tabid,
				});
			}
		} catch (e) {
			console.log(e);
		}
	}

	async function playvideo() {
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
					url: `https://www.youtube.com/watch?v=${videoid}`,
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
			url: `https://www.youtube.com/watch?v=${videoid}`,
		});
	}
</script>

<div>
	<img
		on:click={openvideo}
		class="new-tab"
		src={newtabsrc}
		alt=""
		srcset=""
	/>
	<img on:click={playvideo} class="play" src={playsrc} alt="" srcset="" />
	<span>{title}</span>
</div>

<style lang="scss">
	div {
		display: flex;
		align-items: center;
		padding: 0px 10px;
		font-size: 16px;
		width: 100%;
		height: 40px;
		border-radius: 3px;
		user-select: none;

		img {
			margin: 0px 10px;
			cursor: pointer;
		}

		.new-tab {
			width: 20px;
			height: 20px;
		}

		.new-tab:hover {
			width: 24px;
			height: 24px;
		}

		.play {
			widows: 30px;
			height: 30px;
		}

		.play:hover {
			width: 34px;
			height: 34px;
		}

		span {
			margin-left: 10px;
		}
	}

	div:hover {
		background: #353535;
	}
</style>
