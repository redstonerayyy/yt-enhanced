const videocontainer = document.querySelector(".video-container");

/*------------ add video on event ------------*/
chrome.runtime.onMessage.addListener(async (request, sender) => {
	// save video
	if (request.type === "videosave") {
		delete request["type"];
		delete request["tabid"];
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		await addtostore(db, "videos", request);
		const videos = await queryalldata(db, "videos");
		rendervideos(videocontainer, videos);
	}
	// check if video is already saved
	// check for tabid so only proxied request from background
	// get processed
	else if (request.type === "checkvid" && request.tabid) {
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		const exists = await querybyindex(
			db,
			"videos",
			"videoid",
			request.videoid
		);

		chrome.runtime.sendMessage({
			type: "savedreturn",
			tabid: request.tabid,
			issaved: exists !== null ? exists.length : false,
		});
	}
});
