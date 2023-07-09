const openbutton = document.querySelector(".open-button");

openbutton.addEventListener("click", () => {
	chrome.runtime.sendMessage({ type: "open" });
});
