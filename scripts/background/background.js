/*------------ send message to tab if YT url changes ------------*/
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
	if (details.url.includes("https://www.youtube.com/watch")) {
		try {
			await chrome.tabs.sendMessage(details.tabId, { navigation: true });
		} catch (e) {}
	}
});
