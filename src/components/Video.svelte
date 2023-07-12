<script>
	export let title;
	export let videoid;

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

				console.log(group);
			}
		} catch (e) {
			console.log(e);
		}
	}
</script>

<div on:click={openvideo}>
	{title}
</div>

<style>
	div {
		padding: 4px 8px;
		display: flex;
		font-size: 14px;
		width: 100%;
		cursor: pointer;
		border-radius: 3px;
	}

	div:hover {
		background: rgb(193, 205, 219);
	}
</style>
