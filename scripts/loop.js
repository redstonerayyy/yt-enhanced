/* ------------------------------------------------
                    RESSOURCES
-------------------------------------------------*/

async function reset_loop_state() {
	APPSTATE.loop = false;
	APPSTATE.loopmax = 0;
	APPSTATE.loopcount = 0;
	APPSTATE.loopstart = 0;
	APPSTATE.loopend = APPSTATE.videolength;
	UIELEMENTS.loopimage.src = RESOURCES.imageurls["noloop"];
	UIELEMENTS.loopcounter.textContent = `${0} Times Looped`;
	UIELEMENTS.looprepeats.value = "";
}

async function reset_loop_ui() {}

async function reset_loop() {}

/* ------------------------------------------------
                    VIDEO LOOPING
 -------------------------------------------------*/

async function loop() {
	/*------------ event listeners for the range select ------------*/
	UI.slider.start.addEventListener("mousedown", () => {
		UISTATE.slider.leftdown = true;
	});

	UI.slider.end.addEventListener("mousedown", () => {
		UISTATE.slider.rightdown = true;
	});

	document.addEventListener("mouseup", () => {
		UISTATE.slider.leftdown = false;
		UISTATE.slider.rightdown = false;
	});

	/*------------ change sliders on mousemove ------------*/
	document.addEventListener("mousemove", (ev) => {
		// calculate position of mouse, slider
		// and the position of the moved thumb
		let mousex = ev.x;

		let sliderxleft = UI.slider.getBoundingClientRect().left;
		let sliderxright =
			sliderxleft + UI.slider.getBoundingClientRect().width;

		let newthumbx = Math.min(Math.max(mousex, sliderxleft), sliderxright);
		let fraction = (newthumbx - sliderxleft) / (sliderxright - sliderxleft);
		let percentage = fraction * 100;

		// calculate the time for each change and change the ui
		// set new start and end time
		if (
			UISTATE.slider.leftdown &&
			LOOPSTATE.videolength * fraction <= LOOPSTATE.endtime
		) {
			LOOPSTATE.starttime = LOOPSTATE.videolength * fraction;

			UI.slider.stime.value = format_time(LOOPSTATE.starttime);

			let perc = percentage.toFixed(1);
			UI.slider.start.style.left = `${perc}%`;
			UI.slider.between.style.left = `${perc}%`;
		} else if (
			UISTATE.slider.rightdown &&
			LOOPSTATE.videolength * fraction >= LOOPSTATE.starttime
		) {
			LOOPSTATE.endtime = LOOPSTATE.videolength * fraction;

			UI.slider.etime.value = format_time(LOOPSTATE.endtime);

			let perc = percentage.toFixed(1);
			UI.slider.end.style.right = `${perc}%`;
			UI.slider.between.style.right = `${perc}%`;
		}
	});
}

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
	await waitforelement("#movie_player > div.html5-video-container > video")
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
			vl.currentTime = APPSTATE.loopstart;
		}
	}
});
