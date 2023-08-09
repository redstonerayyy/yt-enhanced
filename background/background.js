/*------------ send message to tab if YT url changes ------------*/
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
	if (details.url.includes("https://www.youtube.com/watch")) {
		try {
			await chrome.tabs.sendMessage(details.tabId, {
				type: "navigation",
				target: "injected",
				navigation: true,
			});
		} catch (e) {}
	}
});

/*------------ receive save message ------------*/
chrome.runtime.onMessage.addListener(async (request, sender) => {
	const test = await chrome.storage.local.get(["playlistinfo"]);
	/*------------ send return from player tabs to content scripts ------------*/
	if (request.target === "injected") {
		if (request.type === "savedreturn") {
			await chrome.tabs.sendMessage(request.tabid, { ...request });
		}
	} else if (request.target === "playlist") {
		/*------------ query if there is a playlist tab ------------*/
		const result = await chrome.storage.local.get(["playlistinfo"]);

		let targetid = undefined;

		/*------------ check if tab already exists ------------*/
		try {
			if (result.playlistinfo.tabid !== undefined) {
				// produces error if id is outdated
				let tab = await chrome.tabs.get(result.playlistinfo.tabid);
				targetid = result.playlistinfo.tabid;
			}
		} catch (e) {}

		/*------------ does not exist, create it ------------*/
		if (targetid === undefined) {
			const tabid = (
				await chrome.tabs.create({
					url: "playlist/index.html",
					active: false,
				})
			).id;

			chrome.storage.local.set({
				playlistinfo: { tabid: tabid, treason: "saveorcheck" },
			});

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

				setTimeout(async () => {
					/*------------ don't remove if opened by user ------------*/
					const result = await chrome.storage.local.get([
						"playlistinfo",
					]);

					if (result.playlistinfo.treason === "saveorcheck") {
						chrome.tabs.remove(targetid);
					}
				}, 500);
			} catch (e) {
				// don't reload that fast! tab somehow not there so error
			}
		}, 1000);
	} else if (request.target === "background") {
		/*------------ open tab so user can see videos ------------*/
		if (request.type === "open") {
			/*------------ query if there is a player tab ------------*/
			const result = await chrome.storage.local.get(["playlistinfo"]);

			let tabid = undefined;

			/*------------ check if tab already exists ------------*/
			try {
				if (result.playlistinfo.tabid !== undefined) {
					// produces error if id is outdated
					let tab = await chrome.tabs.get(result.playlistinfo.tabid);

					/*------------ set reason so it does not close ------------*/
					await chrome.storage.local.set({
						playlistinfo: {
							tabid: result.playlistinfo.tabid,
							treason: "useropen",
						},
					});

					tabid = result.playlistinfo.tabid;
				} else {
					/*------------ create because does not exist ------------*/
					const id = (
						await chrome.tabs.create({
							url: "playlist/index.html",
							active: false,
						})
					).id;

					tabid = id;
				}
			} catch (e) {
				/*------------ create because does not exist ------------*/
				const id = (
					await chrome.tabs.create({
						url: "playlist/index.html",
						active: false,
					})
				).id;

				tabid = id;
			}

			/*------------ group tab ------------*/
			const group = await chrome.tabs.group({
				tabIds: tabid,
			});

			await chrome.storage.local.set({
				playlistinfo: {
					tabid: tabid,
					treason: "test",
					groupid: group,
				},
			});

			/*------------ update the group ------------*/
			await chrome.tabGroups.update(group, {
				title: "ye",
				color: "purple",
			});
		}
	}
});
