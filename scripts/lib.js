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

		const observer = new MutationObserver(() => {
			let nodes = document.querySelectorAll(queryselector);
			if (nodes.length) {
				observer.disconnect();
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

function format_time(time) {
	const minute = 60;
	const hour = 60 * 60;

	hours = Math.floor(time / hour);
	time = time % hour;

	minutes = Math.floor(time / minute);
	time = time % minute;

	seconds = time;

	return `${hours.toFixed(0).padStart(2, "0")}:${minutes
		.toFixed(0)
		.padStart(2, "0")}:${seconds.toFixed(0).padStart(2, "0")}`;
}
