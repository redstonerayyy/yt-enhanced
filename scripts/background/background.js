/*------------ send message to tab if YT url changes ------------*/
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
	if (details.url.includes("https://www.youtube.com/watch")) {
		try {
			await chrome.tabs.sendMessage(details.tabId, { navigation: true });
		} catch (e) {}
	}
});

/*------------ receive save message ------------*/
chrome.runtime.onMessage.addListener(async (request, sender) => {
	/*------------ send return from player tabs to content scripts ------------*/
	if (request.type === "savedreturn") {
		await chrome.tabs.sendMessage(request.tabid, { ...request });
	} else {
		/*------------ query if there is a player tab ------------*/
		const result = await chrome.storage.local.get(["playerid"]);

		let targetid;

		if (result.playerid !== undefined) {
			try {
				let tab = await chrome.tabs.get(result.playerid);
				targetid = result.playerid;
			} catch (e) {}
		}

		if (targetid === undefined) {
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
			try {
				chrome.tabs.sendMessage(targetid, {
					tabid: sender.tab.id,
					...request,
				});
			} catch (e) {
				// don't reload that fast! tab somehow not there so error
			}
		}, 1000);
	}
});
