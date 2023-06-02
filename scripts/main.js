/* ------------------------------------------------
                    EXTENSION STATE
 -------------------------------------------------*/

const APPSTATE = {
	// loop range
	loopstart: 0,
	loopend: null,
	videolength: null,
	leftdown: false,
	rightdown: false,
	// loop
	loopcount: 0,
	loopmax: 0,
	loop: false,
};

const UIELEMENTS = {
	// yt stuff
	injecttarget: null,
	ytvideoelement: null,
	// loop range slider
	loopstart: null,
	loopslider: null,
	loopssliderstart: null,
	loopsliderbetween: null,
	loopssliderend: null,
	loopend: null,
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

function loop_reset() {
	APPSTATE.loop = false;
	APPSTATE.loopmax = 0;
	APPSTATE.loopcount = 0;
	APPSTATE.loopstart = 0;
	APPSTATE.loopend = APPSTATE.videolength;
	UIELEMENTS.loopimage.src = RESOURCES.imageurls["noloop"];
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

	/* ------------------------------------------------
                        SAVE
     -------------------------------------------------*/
	/*--------------------- Grap References ---------------------*/
	UIELEMENTS.saveimage = document.getElementById("menu-save");

	/* ------------------------------------------------
                        DOWNLOAD
     -------------------------------------------------*/
	/*--------------------- Grap References ---------------------*/
	UIELEMENTS.downloadimage = document.getElementById("menu-download");

	/* ------------------------------------------------
                        SHARE
     -------------------------------------------------*/
	/*--------------------- Grap References ---------------------*/
	UIELEMENTS.shareimage = document.getElementById("menu-share");

	/* ------------------------------------------------
                        CLIP
     -------------------------------------------------*/
	/*--------------------- Grap References ---------------------*/
	UIELEMENTS.clipimage = document.getElementById("menu-clip");

	/* ------------------------------------------------
                        LOOPING
    -------------------------------------------------*/
	/*--------------------- Grap References ---------------------*/
	// loop range slider
	UIELEMENTS.loopstart = document.getElementById("looper-start");
	UIELEMENTS.loopslider = document.getElementById("start-end-slider");
	UIELEMENTS.loopssliderstart = document.getElementById("start-slider");
	UIELEMENTS.loopsliderbetween = document.getElementById("color-between");
	UIELEMENTS.loopssliderend = document.getElementById("end-slider");
	UIELEMENTS.loopend = document.getElementById("looper-end");
	// loop
	UIELEMENTS.looprepeats = document.getElementById("looper-repeats");
	UIELEMENTS.loopcounter = document.getElementById("looper-counter");
	UIELEMENTS.loopimage = document.getElementById("looper-image");

	/*--------------------- Add Event Listeners to Controls ---------------------*/
	/*------------ event listeners for the range select ------------*/
	UIELEMENTS.loopssliderstart.addEventListener("mousedown", (ev) => {
		APPSTATE.leftdown = true;
	});
	UIELEMENTS.loopssliderend.addEventListener("mousedown", (ev) => {
		APPSTATE.rightdown = true;
	});
	document.addEventListener("mouseup", (ev) => {
		APPSTATE.leftdown = false;
		APPSTATE.rightdown = false;
	});

	/*------------ change sliders on mousemove ------------*/
	document.addEventListener("mousemove", (ev) => {
		let mousex = ev.x;

		let sliderxleft = UIELEMENTS.loopslider.getBoundingClientRect().left;
		let sliderxright =
			sliderxleft + UIELEMENTS.loopslider.getBoundingClientRect().width;

		let newthumbx = Math.min(Math.max(mousex, sliderxleft), sliderxright);
		let fraction = (newthumbx - sliderxleft) / (sliderxright - sliderxleft);
		let percentage = fraction * 100;

		if (APPSTATE.leftdown) {
			if (APPSTATE.videolength * fraction <= APPSTATE.loopend)
				APPSTATE.loopstart = APPSTATE.videolength * fraction;
			UIELEMENTS.loopssliderstart.style.left = `${percentage.toFixed(
				1
			)}%`;
			UIELEMENTS.loopsliderbetween.style.left = `${percentage.toFixed(
				1
			)}%`;
		} else if (APPSTATE.rightdown) {
			if (APPSTATE.videolength * fraction >= APPSTATE.loopstart)
				APPSTATE.loopend = APPSTATE.videolength * fraction;
			UIELEMENTS.loopssliderend.style.right = `${
				100 - percentage.toFixed(1)
			}%`;
			UIELEMENTS.loopsliderbetween.style.right = `${
				100 - percentage.toFixed(1)
			}%`;
		}
	});

	/*------------ event listeners for loop button ------------*/
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
			loop_reset();
		}
	});

	/*------------ webnavigation event ------------*/
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

	/*------------ set video length ------------*/
	APPSTATE.videolength = vl.duration;
	APPSTATE.loopend = vl.duration;

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
		if (APPSTATE.loop) {
			if (vl.currentTime > APPSTATE.loopend - 0.5) {
				console.log("larger");
				APPSTATE.loopcount++;
				UIELEMENTS.loopcounter.textContent = `${APPSTATE.loopcount} Times Looped`;
				if (APPSTATE.loopmax !== 0) {
					if (APPSTATE.loopcount >= APPSTATE.loopmax) {
						APPSTATE.loop = false;
						loop_reset();
					} else {
						vl.currentTime = APPSTATE.loopstart;
					}
				} else {
					vl.currentTime = APPSTATE.loopstart;
				}
			} else if (vl.currentTime < APPSTATE.loopstart) {
				console.log("smaller");
				vl.currentTime = APPSTATE.loopstart;
			}
		}
	});
})();
