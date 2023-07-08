// enable saving videos to a list

/* ------------------------------------------------
                    VIDEO SAVING AND PLAYLISTS
-------------------------------------------------*/

async function save() {
	/*------------ send videoinfo on click ------------*/
	UI.save.button.addEventListener("click", () => {
		/*------------ video info ------------*/
		const vtitle = document.querySelector(
			"#title > h1 > yt-formatted-string"
		).textContent;
		const vid = new URLSearchParams(window.location.search).get("v");
		const videoinfo = { title: vtitle, videoid: vid };

		/*------------ change icon ------------*/
		UI.save.button.src = RES.images["check"];

		/*------------ send to background script ------------*/
		chrome.runtime.sendMessage(videoinfo);
	});

	/*------------ reset ui on video change ------------*/
	chrome.runtime.onMessage.addListener(async (request) => {
		if (request.navigation) {
			console.log("YT Enhanced: Resetting Save State after Navigation");
			UI.save.button.src = RES.images["save"];
		}
	});
}
