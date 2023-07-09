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
	/*------------ render stuff ------------*/
	const db = await opendatabase("yt-enhanced", 1, upgrade);
	const videos = await queryalldata(db, "videos");
	rendervideos(videocontainer, videos);
})();
