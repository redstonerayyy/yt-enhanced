/*------------ add video on event ------------*/
chrome.runtime.onMessage.addListener(async (videoinfo) => {
	const db = await opendatabase("yt-enhanced", 1, upgrade);
	await addtostore(db, "videos", videoinfo);
});
