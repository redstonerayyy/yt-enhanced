// load extension ui and initial state

/* ------------------------------------------------
                    EXTENSION STATE
 -------------------------------------------------*/

// resources
const RES = {
	images: {},
};

// data for looping
const LOOPSTATE = {
	starttime: null,
	endtime: null,
	videolength: null,
	count: 0,
	maxrepeats: 0,
	islooping: false,
};

// yt elements
const YT = {
	container: null,
	video: null,
};

// state of custom ui
const UISTATE = {
	slider: {
		leftdown: false,
		rightdown: false,
	},
};

// elements of custom ui
const UI = {
	slider: {
		slider: null,
		stime: null,
		start: null,
		etime: null,
		end: null,
		between: null,
	},

	loop: {
		repeats: null,
		counter: null,
		button: null,
	},

	save: {
		button: null,
	},
};

/* ------------------------------------------------
                    EXTENSION PRELOAD
 -------------------------------------------------*/

async function preload() {
	/*--------------------- Load Resources ---------------------*/
	console.log("YT Enhanced: Loading Resources");

	// load html source
	let htmlurlsrc = await xml_get_request(
		chrome.runtime.getURL("injected/ui.html")
	);

	// get image urls
	const images = ["noloop", "yesloop", "save", "check"];
	for (const image of images) {
		RES.images[image] = chrome.runtime.getURL(`ui-images/${image}.svg`);
	}

	// create controls
	let controls = document.createElement("div");
	controls.innerHTML = htmlurlsrc;
	controls.querySelector("#loop-button").src = RES.images["noloop"];
	controls.querySelector("#save-button").src = RES.images["save"];

	/*--------------------- Inject Controls ---------------------*/
	console.log("YT Enhanced: Injecting Controls");

	// wait for container element, inject controls
	YT.container = await wait_for_element("#above-the-fold");
	YT.container.children[YT.container.children.length - 1].before(controls);

	/*------------ Grap references to Controls ------------*/
	UI.slider.slider = document.querySelector("#start-end-slider");
	UI.slider.stime = document.querySelector("#slider-time-start");
	UI.slider.start = document.querySelector("#start-slider");
	UI.slider.etime = document.querySelector("#slider-time-end");
	UI.slider.end = document.querySelector("#end-slider");
	UI.slider.between = document.querySelector("#color-between");

	UI.loop.repeats = document.querySelector("#loop-repeats");
	UI.loop.counter = document.querySelector("#loop-counter");
	UI.loop.button = document.querySelector("#loop-button");

	UI.save.button = document.querySelector("#yt-enhanced-menu > #save-button");

	/*------------ Grap reference to video last ------------*/
	// it may needs to load
	YT.video = await wait_for_element(
		"#movie_player > div.html5-video-container > video"
	);
}
