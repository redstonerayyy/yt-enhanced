/*------------ send message to tab if YT url changes ------------*/
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
	if (details.url.includes("https://www.youtube.com/watch")) {
		try {
			await chrome.tabs.sendMessage(details.tabId, { navigation: true });
		} catch (e) {}
	}
});

/*------------ receive save message ------------*/
chrome.runtime.onMessage.addListener(async (request) => {
	/*------------ query if there is a player tab ------------*/
	const result = await chrome.storage.local.get(["playerid"]);
	let targetid;
	console.log(result);
	if (result.playerid !== undefined) {
		targetid = result.playerid;
	} else {
		const tabid = (
			await chrome.tabs.create({
				url: "html-ui/player.html",
				active: false,
			})
		).id;
		chrome.storage.local.set({ playerid: tabid });
		targetid = tabid;
	}

	/*------------ send message to tab ------------*/
	// timeout because tab creation takes time
	setTimeout(() => {
		chrome.tabs.sendMessage(targetid, request);
	}, 2000);
});
