import App from "./App.svelte";
import * as lib from "./lib.js";
import { videos } from "./store/store.js";

const app = new App({
	target: document.getElementById("app"),
});

export default app;

/* ------------------------------------------------
                    COMPONENT INDEPENDENT CODE
 -------------------------------------------------*/

/*------------ add video on event ------------*/
chrome.runtime.onMessage.addListener(async (request, sender) => {
	if (request.target === "playlist") {
		// save video
		if (request.type === "videosave") {
			delete request["type"];
			delete request["tabid"];
			delete request["target"];

			const db = await lib.opendatabase("yt-enhanced", 1, lib.upgrade);
			await lib.addtostore(db, "videos", request);

			// rerender videos e.g. update state
			const v = await lib.queryalldata(db, "videos");
			videos.set(v);
		}
		// check if video is already saved
		// check for tabid so only proxied request from background
		// get processed
		else if (request.type === "checkvid" && request.tabid) {
			const db = await lib.opendatabase("yt-enhanced", 1, lib.upgrade);
			const exists = await lib.querybyindex(
				db,
				"videos",
				"videoid",
				request.videoid
			);

			chrome.runtime.sendMessage({
				type: "savedreturn",
				target: "injected",
				tabid: request.tabid,
				issaved: exists !== null ? exists.length : false,
			});
		}
	}
});
