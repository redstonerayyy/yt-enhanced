/* ------------------------------------------------
                    EXTENSION STATE
 -------------------------------------------------*/

const APPSTATE = {
	// loop
	loopcount: 0,
	loopmax: 0,
	loop: false,
};

const UIELEMENTS = {
	// yt stuff
	injecttarget: null,
	ytvideoelement: null,
	// loop
	looprepeats: null,
	loopcounter: null,
	loopimage: null,
	// menu
	clipimage: null,
	shareimage: null,
	downloadimage: null,
	saveimage: null,
};

const RESOURCES = {
	htmlurlsrc: null,
	htmlinjectsrc: null,
	imageurls: {},
};

/* ------------------------------------------------
                    RESSOURCES
-------------------------------------------------*/

const IMAGENAMES = [
	"noloop",
	"yesloop",
	"scissor",
	"share",
	"download",
	"save",
	"plus",
];

async function xmlgetrequest(url) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", url);

		xhr.onload = () => {
			resolve(xhr.response);
		};
		xhr.onerror = () => {
			reject("");
		};

		xhr.send();
	});
}

async function load_resources() {
	// get resource urls
	RESOURCES.htmlurlsrc = chrome.runtime.getURL("html-ui/ui.html");
	RESOURCES.htmlinjectsrc = await xmlgetrequest(RESOURCES.htmlurlsrc);
	for (const image of IMAGENAMES) {
		RESOURCES.imageurls[image] = chrome.runtime.getURL(
			`ui-images/${image}.svg`
		);
	}
}

/* ------------------------------------------------
                    DOM MANIPUlATION
 -------------------------------------------------*/

// https://stackoverflow.com/questions/34863788/how-to-check-if-an-element-has-been-loaded-on-a-page-before-running-a-script
// makes it possible to wait for the load of a DOM element
function waitforelement(queryselector) {
	return new Promise((resolve, reject) => {
		let nodes = document.querySelectorAll(queryselector);
		if (nodes.length) return resolve(nodes);

		let timer;

		const observer = new MutationObserver(() => {
			let nodes = document.querySelectorAll(queryselector);
			if (nodes.length) {
				observer.disconnect();
				clearTimeout(timer);
				return resolve(nodes);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

function create_inject_element() {
	let controls = document.createElement("div");
	controls.innerHTML = RESOURCES.htmlinjectsrc;
	controls.querySelector("#looper-image").src = RESOURCES.imageurls["noloop"];
	controls.querySelector("#menu-clip").src = RESOURCES.imageurls["scissor"];
	controls.querySelector("#menu-share").src = RESOURCES.imageurls["share"];
	controls.querySelector("#menu-download").src =
		RESOURCES.imageurls["download"];
	controls.querySelector("#menu-save").src = RESOURCES.imageurls["save"];
	return controls;
}

function loop_reset() {
	APPSTATE.loop = false;
	APPSTATE.loopmax = 0;
	APPSTATE.loopcount = 0;
	UIELEMENTS.loopimage.src = RESOURCES.noloopsvg;
	UIELEMENTS.loopcounter.textContent = `${0} Times Looped`;
	UIELEMENTS.looprepeats.value = "";
}

/* ------------------------------------------------
                    MAIN CODE
 -------------------------------------------------*/

(async () => {
	/*--------------------- Load Resources ---------------------*/
	console.log("YT Enhanced: Loading Resources");
	await load_resources();

	/*--------------------- Wait for Inject Target Element ---------------------*/
	console.log("YT Enhanced: Awaiting Injection");
	UIELEMENTS.injecttarget = (await waitforelement("#above-the-fold"))[0];

	/*--------------------- Inject Controls ---------------------*/
	UIELEMENTS.injecttarget.children[
		UIELEMENTS.injecttarget.children.length - 1
	].before(create_inject_element());

	/*--------------------- Grap References ---------------------*/
	// loop
	UIELEMENTS.looprepeats = document.getElementById("looper-repeats");
	UIELEMENTS.loopcounter = document.getElementById("looper-counter");
	UIELEMENTS.loopimage = document.getElementById("looper-image");

	// menu
	UIELEMENTS.clipimage = document.getElementById("menu-clip");
	UIELEMENTS.shareimage = document.getElementById("menu-share");
	UIELEMENTS.downloadimage = document.getElementById("menu-download");
	UIELEMENTS.saveimage = document.getElementById("menu-save");

	/*--------------------- Add Event Listeners to Controls ---------------------*/
	// change loop maximum when input value is changed
	UIELEMENTS.looprepeats.addEventListener("input", (ev) => {
		let value = ev.target.value;
		try {
			APPSTATE.loopmax = Number(value);
		} catch (e) {
			APPSTATE.loopmax = 0;
		}
	});

	// toggle loop if the image is clicked
	UIELEMENTS.loopimage.addEventListener("click", () => {
		if (!APPSTATE.loop) {
			APPSTATE.loop = true;
			UIELEMENTS.loopimage.src = RESOURCES.imageurls["yesloop"];
		} else {
			APPSTATE.loop = false;
			UIELEMENTS.loopimage.src = RESOURCES.imageurls["noloop"];
		}
	});

	// reset loop when video changes, listen to navigate events in background.js
	chrome.runtime.onMessage.addListener((request) => {
		if (request.navigation) {
			APPSTATE.loop = false;
			loop_reset();
		}
	});

	/*--------------------- Wait for YT Video Player ---------------------*/
	console.log("YT Enhanced: Awaiting Videoplayer");
	UIELEMENTS.ytvideoelement = (
		await waitforelement(
			"#movie_player > div.html5-video-container > video"
		)
	)[0];
	let vl = UIELEMENTS.ytvideoelement; // local reference for better code

	/*--------------------- Add Event Listeners to it ---------------------*/
	/*
    using the 'timeupdate' event listener instead of 'ended' prevents youtubes event listeners
    from executing if the video is part of a playlist (mix), because elsewise YT would just play
    the next video. 
    ev.stopImmediaPropagration also does not work, as the YT event listener was added
    first and would not be interrupted.
    0.5 should be used as a time, as in most browser the timeupdate event trigger als 200 - 300ms,
    so this will ensure that it will be triggered, even on slower pcs
    https://stackoverflow.com/questions/9678177/how-often-does-the-timeupdate-event-fire-for-an-html5-video
    */

	vl.addEventListener("timeupdate", (ev) => {
		if (vl.currentTime > vl.duration - 0.5) {
			APPSTATE.loopcount++;
			UIELEMENTS.loopcounter.textContent = `${APPSTATE.loopcount} Times Looped`;
			if (APPSTATE.loop) {
				if (APPSTATE.loopmax !== 0) {
					if (APPSTATE.loopcount >= APPSTATE.loopmax) {
						APPSTATE.loop = false;
						loop_reset();
					} else {
						vl.currentTime = 0;
					}
				} else {
					vl.currentTime = 0;
				}
			} else {
				loop_reset();
			}
		}
	});
})();
