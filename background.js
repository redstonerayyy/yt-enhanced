// send message to tab if YT url changes
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if(details.url.includes("https://www.youtube.com/watch")){
        try {
            chrome.tabs.sendMessage(details.tabId, { navigation: true });
        } catch (e) {
            // do nothing
        }
    }
});
