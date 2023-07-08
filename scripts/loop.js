// enable advanced looping of videos

/* ------------------------------------------------
                    VIDEO LOOPING
-------------------------------------------------*/

async function reset_loop_state() {
	LOOPSTATE.islooping = false;
	LOOPSTATE.maxrepeats = 0;
	LOOPSTATE.count = 0;
	LOOPSTATE.starttime = 0;
	LOOPSTATE.endtime = LOOPSTATE.videolength;
	UI.slider.stime.value = "";
	UI.slider.etime.value = "";
	UI.slider.start.style.left = `0%`;
	UI.slider.between.style.left = `0%`;
	UI.slider.end.style.right = `0%`;
	UI.slider.between.style.right = `0%`;
	UI.loop.button.src = RES.images["noloop"];
	UI.loop.counter.textContent = `${0} Times Looped`;
	UI.loop.repeats.value = "";
}

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

		let sliderxleft = UI.slider.slider.getBoundingClientRect().left;
		let sliderxright =
			sliderxleft + UI.slider.slider.getBoundingClientRect().width;

		let newthumbx = Math.min(Math.max(mousex, sliderxleft), sliderxright);
		let fraction = (newthumbx - sliderxleft) / (sliderxright - sliderxleft);
		let percentage = fraction * 100;

		// calculate the time for each change and change the ui
		// set new start and end time
		if (UISTATE.slider.leftdown) {
			LOOPSTATE.starttime = LOOPSTATE.videolength * fraction;

			UI.slider.stime.value = format_time(LOOPSTATE.starttime);

			let perc = percentage.toFixed(1);
			UI.slider.start.style.left = `${perc}%`;
			UI.slider.between.style.left = `${perc}%`;
		} else if (UISTATE.slider.rightdown) {
			LOOPSTATE.endtime = LOOPSTATE.videolength * fraction;

			UI.slider.etime.value = format_time(LOOPSTATE.endtime);

			let perc = percentage.toFixed(1);
			UI.slider.end.style.right = `${100 - perc}%`;
			UI.slider.between.style.right = `${100 - perc}%`;
		}
	});

	/*------------ event listeners for loop button ------------*/
	// change loop max repeats when input value is changed
	UI.loop.repeats.addEventListener("input", (ev) => {
		let value = ev.target.value;
		try {
			LOOPSTATE.maxrepeats = Number(value);
		} catch (e) {
			LOOPSTATE.maxrepeats = 0;
		}
	});

	/*------------ toggle loop if the image is clicked ------------*/
	UI.loop.button.addEventListener("click", () => {
		if (!LOOPSTATE.islooping) {
			LOOPSTATE.islooping = true;
			UI.loop.button.src = RES.images["yesloop"];
		} else {
			LOOPSTATE.islooping = false;
			UI.loop.button.src = RES.images["noloop"];
			reset_loop_state();
		}
	});

	/*--------------------- Wait for YT Video Player ---------------------*/
	console.log("YT Enhanced: Awaiting Videoplayer");
	YT.video = await wait_for_element(
		"#movie_player > div.html5-video-container > video"
	);

	/*------------ set video length ------------*/
	LOOPSTATE.starttime = 0;

	setTimeout(() => {
		LOOPSTATE.endtime = YT.video.duration;
		LOOPSTATE.videolength = YT.video.duration;
	}, 1000);

	/*------------ webnavigation event ------------*/
	// reset loop when video changes, listen to navigate events in background.js
	// use loadedmetadata event, which works only when navigating on youtube
	// to a new video. reloading a tab does somehow (?) not trigger this event
	// therefore above a setTimeout is used
	chrome.runtime.onMessage.addListener(async (request) => {
		if (request.navigation) {
			console.log("YT Enhanced: Resetting Loop State after Navigation");
			reset_loop_state();

			console.log("YT Enhanced: Awaiting Videoplayer after Navigation");
			YT.video = await wait_for_element(
				"#movie_player > div.html5-video-container > video"
			);

			YT.video.addEventListener("loadedmetadata", () => {
				/*------------ set video length ------------*/
				LOOPSTATE.endtime = YT.video.duration;
				LOOPSTATE.videolength = YT.video.duration;
			});
		}
	});

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
	YT.video.addEventListener("timeupdate", (ev) => {
		if (LOOPSTATE.islooping) {
			if (YT.video.currentTime > LOOPSTATE.endtime - 0.5) {
				LOOPSTATE.count++;
				UI.loop.counter.textContent = `${LOOPSTATE.count} Times Looped`;
				if (
					LOOPSTATE.maxrepeats !== 0 &&
					LOOPSTATE.count >= LOOPSTATE.maxrepeats
				) {
					LOOPSTATE.islooping = false;
					reset_loop_state();
				} else {
					YT.video.currentTime = LOOPSTATE.starttime;
				}
			} else if (YT.video.currentTime < LOOPSTATE.starttime) {
				YT.video.currentTime = LOOPSTATE.starttime;
			}
		}
	});
}
