// send message to tab if YT url changes
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if(details.url.includes("https://www.youtube.com/watch")){
        chrome.tabs.sendMessage(details.tabId, { navigation: true });
        console.log("sa;ldfj");
    }
});
