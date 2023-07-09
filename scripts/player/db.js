/*------------ add video on event ------------*/
chrome.runtime.onMessage.addListener(async (request, sender) => {
	// save video
	if (request.type === "videosave") {
		delete request["type"];
		delete request["tabid"];
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		await addtostore(db, "videos", request);
	}
	// check if video is already saved
	// check for tabid so only proxied request from background
	// get processed
	else if (request.type === "checkvid" && request.tabid) {
		console.log(request, sender);
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		const exists = await querybyindex(
			db,
			"videos",
			"videoid",
			request.videoid
		);

		console.log("before db");
		chrome.runtime.sendMessage({
			type: "savedreturn",
			tabid: request.tabid,
			issaved: exists !== null ? exists.length : false,
		});
	}
});
