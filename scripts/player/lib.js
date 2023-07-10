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

	const tagstore = db.createObjectStore("tags", {
		autoIncrement: true,
	});

	// indices for searching
	tagstore.createIndex("tag", "tag", { unique: false });
	tagstore.createIndex("videoid", "videoid", { unique: false });
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
	target.innerHTML = "";
	for (const video of videos) {
		let el = document.createElement("div");
		el.textContent = video.title;
		el.className = "video";
		el.addEventListener("click", async () => {
			/*------------ create tab ------------*/
			const tabid = (
				await chrome.tabs.create({
					url: `https://www.youtube.com/watch?v=${video.videoid}`,
				})
			).id;

			/*------------ and at to the ye group ------------*/
			const result = await chrome.storage.local.get(["playlistinfo"]);

			console.log(result);

			try {
				if (result.playlistinfo.groupid !== undefined) {
					const group = await chrome.tabs.group({
						groupId: result.playlistinfo.groupid,
						tabIds: tabid,
					});

					console.log(group);
				}
			} catch (e) {
				console.log(e);
			}
		});
		target.appendChild(el);
	}
}
