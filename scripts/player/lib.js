/* ------------------------------------------------
                    DATABASE
 -------------------------------------------------*/
/*------------ initialize video database ------------*/
const upgrade = (event) => {
	const db = event.target.result;

	const videostore = db.createObjectStore("videos", {
		autoIncrement: true,
	});

	// indices for searching
	videostore.createIndex("title", "title", { unique: false });
	videostore.createIndex("videoid", "videoid", { unique: true });
};

/*------------ create/open database ------------*/
async function opendatabase(name, version, upgrade) {
	return new Promise((resolve, reject) => {
		let db;

		const request = window.indexedDB.open(name, version);

		/*------------ events for opening databse ------------*/
		request.onupgradeneeded = upgrade;

		request.onerror = (event) => {
			reject(request.error);
		};

		request.onsuccess = (event) => {
			resolve(event.target.result);
		};
	});
}

/*------------ add entry to database ------------*/
async function addtostore(db, objectstore, object) {
	return new Promise((resolve) => {
		const transaction = db.transaction(objectstore, "readwrite");
		const store = transaction.objectStore(objectstore);
		store.add(object);
		resolve();
	});
}

/*------------ query by index ------------*/
async function querybyindex(db, objectstore, searchindex, search) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(objectstore, "readonly");
		const store = transaction.objectStore(objectstore);
		const index = store.index(searchindex);

		let request = index.getAll(search);

		request.onsuccess = () => {
			if (request.result !== undefined) {
				resolve(request.result);
			} else {
				reject(null);
			}
		};
	});
}

/*------------ query all data of store ------------*/
async function queryalldata(db, objectstore) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(objectstore, "readonly");
		const store = transaction.objectStore(objectstore);

		let request = store.getAll();

		request.onsuccess = () => {
			if (request.result !== undefined) {
				resolve(request.result);
			} else {
				reject([]);
			}
		};
	});
}

/* ------------------------------------------------
                    UI
 -------------------------------------------------*/
/*------------ render songs ------------*/
function rendervideos(target, videos) {
	for (const video of videos) {
		console.log(video);
		let el = document.createElement("div");
		el.textContent = video.title;
		target.appendChild(el);
	}
}
