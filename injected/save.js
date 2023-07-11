// enable saving videos to a list

/* ------------------------------------------------
                    VIDEO SAVING AND PLAYLISTS
-------------------------------------------------*/

async function save() {
	/*------------ send message to see if already downloaded ------------*/
	// execute on page reload
	const vid = new URLSearchParams(window.location.search).get("v");
	chrome.runtime.sendMessage({
		type: "checkvid",
		target: "playlist",
		videoid: vid,
	});

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
		chrome.runtime.sendMessage({
			type: "videosave",
			target: "playlist",
			...videoinfo,
		});
	});

	/*------------ reset ui on video change ------------*/
	chrome.runtime.onMessage.addListener((request) => {
		if (request.target === "injected") {
			if (request.navigation) {
				UI.save.button.src = RES.images["save"];

				/*------------ send message to see if already downloaded ------------*/
				// execute when navigating inside youtube
				const vid = new URLSearchParams(window.location.search).get(
					"v"
				);
				chrome.runtime.sendMessage({
					type: "checkvid",
					target: "playlist",
					videoid: vid,
				});
			} else if (request.issaved) {
				UI.save.button.src = RES.images["check"];
			}
		}
	});
}
