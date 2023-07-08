/*------------ add video on event ------------*/
chrome.runtime.onMessage.addListener(async (request, sender, res) => {
	// save video
	if (request.type === "videosave") {
		delete request["type"];
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		await addtostore(db, "videos", request);
	}
	// check if video is already saved
	else if (request.type === "checkvid") {
		delete request["type"];
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		const exists = await querybyindex(
			db,
			"videos",
			"videoid",
			request.videoid
		);
		res({ issaved: exists !== null });
	}
});
