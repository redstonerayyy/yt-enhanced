// library file with functions

/* ------------------------------------------------
                    RESOURCE LOADING
 -------------------------------------------------*/

async function xml_get_request(url) {
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

/* ------------------------------------------------
                    DOM MANIPUlATION
 -------------------------------------------------*/

// https://stackoverflow.com/questions/34863788/how-to-check-if-an-element-has-been-loaded-on-a-page-before-running-a-script
// makes it possible to wait for the load of a DOM element
async function wait_for_element(queryselector) {
	return new Promise((resolve, reject) => {
		let nodes = document.querySelectorAll(queryselector);
		if (nodes.length) return resolve(nodes);

		const observer = new MutationObserver(() => {
			let node = document.querySelector(queryselector);
			if (node !== null) {
				observer.disconnect();
				return resolve(node);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

/* ------------------------------------------------
                    DATA CONVERSION
 -------------------------------------------------*/

/*------------ format a time in seconds into a human readable format ------------*/
function format_time(time) {
	const minute = 60;
	const hour = 60 * 60;

	hours = Math.floor(time / hour).toFixed(0).padStart(2, "0");
	time = time % hour;

	minutes = Math.floor(time / minute).toFixed(0).padStart(2, "0");
	time = time % minute;

	seconds = time.toFixed(0).padStart(2, "0");

	return `${hours.}:${minutes}:${seconds}`;
}
