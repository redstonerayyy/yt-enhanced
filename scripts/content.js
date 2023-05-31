/* ------------------------------------------------
                    EXTENSION STATE
 -------------------------------------------------*/

const APPSTATE = {
	loopcount: 0,
	loopmax: 0,
	loop: false,
};

const UIELEMENTS = {
	injecttarget: null,
	loopmaxinput: null,
	loopcounterspan: null,
	loopstateimg: null,
	ytvideoelement: null,
};

const RESOURCES = {
	htmlurlsrc: null,
	htmlinjectsrc: null,
	noloopsvg: null,
	yesloopsvg: null,
};

/* ------------------------------------------------
                    RESSOURCES
 -------------------------------------------------*/

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
	RESOURCES.htmlurlsrc = chrome.runtime.getURL("ui-html/looper.html");
	RESOURCES.htmlinjectsrc = await xmlgetrequest(RESOURCES.htmlurlsrc);
	RESOURCES.noloopsvg = chrome.runtime.getURL("images/noloop.svg");
	RESOURCES.yesloopsvg = chrome.runtime.getURL("images/yesloop.svg");
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
	controls.querySelector("#injected-loop-state-image").src =
		RESOURCES.noloopsvg;
	return controls;
}

function loop_reset() {
	APPSTATE.loop = false;
	APPSTATE.loopmax = 0;
	APPSTATE.loopcount = 0;
	UIELEMENTS.loopstateimg.src = RESOURCES.noloopsvg;
	UIELEMENTS.loopcounterspan.textContent = `${0} Times Looped`;
	UIELEMENTS.loopmaxinput.value = "";
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
	console.log(UIELEMENTS.injecttarget);

	/*--------------------- Inject Controls ---------------------*/
	UIELEMENTS.injecttarget.children[
		UIELEMENTS.injecttarget.children.length - 1
	].before(create_inject_element());

	/*--------------------- Grap References ---------------------*/
	UIELEMENTS.loopstateimg = document.getElementById(
		"injected-loop-state-image"
	);
	UIELEMENTS.loopcounterspan = document.getElementById(
		"injected-loop-counter"
	);
	UIELEMENTS.loopmaxinput = document.getElementById(
		"injected-loop-maximum-input"
	);

	/*--------------------- Add Event Listeners to Controls ---------------------*/
	// change loop maximum when input value is changed
	UIELEMENTS.loopmaxinput.addEventListener("input", (ev) => {
		let value = ev.target.value;
		try {
			APPSTATE.loopmax = Number(value);
		} catch (e) {
			APPSTATE.loopmax = 0;
		}
	});

	// toggle loop if the image is clicked
	UIELEMENTS.loopstateimg.addEventListener("click", () => {
		if (!APPSTATE.loop) {
			APPSTATE.loop = true;
			UIELEMENTS.loopstateimg.src = RESOURCES.yesloopsvg;
		} else {
			APPSTATE.loop = false;
			UIELEMENTS.loopstateimg.src = RESOURCES.noloopsvg;
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
			UIELEMENTS.loopcounterspan.textContent = `${APPSTATE.loopcount} Times Looped`;
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
