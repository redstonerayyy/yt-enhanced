const videocontainer = document.querySelector(".video-container");

/*------------ add video on event ------------*/
chrome.runtime.onMessage.addListener(async (request, sender) => {
	// save video
	if (request.type === "videosave") {
		delete request["type"];
		delete request["tabid"];
		const db = await opendatabase("yt-enhanced", 1, upgrade);
		await addtostore(db, "videos", request);

		// rerender videos
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

const exportbutton = document.querySelector(".export-songs-button");

exportbutton.addEventListener("click", async () => {
	const db = await opendatabase("yt-enhanced", 1, upgrade);
	const videos = await queryalldata(db, "videos");

	const data = { allvideos: videos };
	const binary = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
	const url = "data:application/json;base64," + binary;

	let today = new Date();
	let dd = String(today.getDate()).padStart(2, "0");
	let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	let yyyy = today.getFullYear();
	today = mm + "_" + dd + "_" + yyyy;

	chrome.downloads.download({
		url: url,
		filename: `yt_enhanced_export_${today}.json`,
	});
});

(async () => {
	/*------------ render stuff on page load ------------*/
	const db = await opendatabase("yt-enhanced", 1, upgrade);
	const videos = await queryalldata(db, "videos");
	rendervideos(videocontainer, videos);
})();
