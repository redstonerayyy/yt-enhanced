// enable saving videos to a list

/* ------------------------------------------------
                    VIDEO SAVING AND PLAYLISTS
-------------------------------------------------*/

async function save() {
	/*------------ send message with video ID on click ------------*/
	UI.save.button.addEventListener("click", () => {
		const title = document.querySelector(
			"#title > h1 > yt-formatted-string"
		).textContent;

		const videoid = new URLSearchParams(window.location.search).get("v");

		chrome.runtime.sendMessage({ title: title, videoid: videoid });
	});
}
