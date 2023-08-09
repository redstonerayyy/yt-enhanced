// call the functions making up the extension

/* ------------------------------------------------
                    MAIN CODE
 -------------------------------------------------*/

(async () => {
	const result = await chrome.storage.local.get(["uioption"]);

	if (result.uioption.option == "full") {
		await preload();
		await loop();
		await save();
	} else if (result.uioption.option == "save") {
		await preload();

		/*------------ remove existing ui ------------*/
		const ui = document.querySelector("#yt-enhanced-ui");
		ui.remove();

		/*------------ create new save button ------------*/
		const newsavebutton = document.createElement("img");
		newsavebutton.src = RES.images["save"];
		newsavebutton.id = "save-button";
		newsavebutton.style.height = "26px";
		newsavebutton.style.width = "28px";
		newsavebutton.style.margin = "0px 10px";
		newsavebutton.style.cursor = "pointer";

		const ytmenu = document.querySelector("#actions");
		ytmenu.append(newsavebutton);

		/*------------ rereference it for the save function ------------*/
		UI.save.button = document.querySelector("#actions > #save-button");

		await save();
	}
})();
