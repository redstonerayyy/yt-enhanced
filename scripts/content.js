let loopedcounter = 0;
let loopedcount = 0;
let loop = false;

// asynchronously import modules
(async () => {
    // get html source for injection
    const htmlsrcurl = chrome.runtime.getURL("resources/looper.html");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", htmlsrcurl);
    xhr.send()
    let htmlsrc;
    xhr.onload = () => {
        htmlsrc = xhr.response;
    }
    
    // get img sources
    let loopsvgfalse = chrome.runtime.getURL("images/noloop.svg");
    let loopsvgtrue = chrome.runtime.getURL("images/yesloop.svg");
    
    // get helper functions, module workaround
    const modulesrc = chrome.runtime.getURL("scripts/helpers.js");
    const helpers = await import(modulesrc);
    
    // wait until element to inject is loaded
    helpers.waitforelement("#above-the-fold", 4000).then((nodes) => {
        // element to inject into
        let abovefold = nodes[0];
        
        // inject html src as element
        let el = document.createElement("div");
        el.innerHTML = htmlsrc;
        abovefold.children[abovefold.children.length - 1].before(el);
        
        // inject img src
        let loopsvgel = document.getElementById("injected-looper-loop-symbol");
        loopsvgel.src = loopsvgfalse;
        
        // loop counter display
        let loopcounterel = document.getElementById("injected-loop-counter");
        
        // loop count input
        let loopcountel = document.getElementById("injected-loop-count");
        loopcountel.addEventListener("input", (ev) => {
            let content = ev.target.value;
            try {
                loopedcount = Number(content);
            } catch (e) {
                loopedcount = 0;
            }
        })
        
        // attach event listeners to loaded elements
        loopsvgel.addEventListener("click", () => {
            helpers.waitforelement("#movie_player > div.html5-video-container.style-scope.ytd-player > video").then((nodes) => {
                let videoel = nodes[0];
                if(!loop){
                    // enable loop
                    loopsvgel.src = loopsvgtrue;
                    loop = true;
                    videoel.addEventListener("ended", function videoended(ev) {
                        // increase looped count
                        loopedcounter++;
                        loopcounterel.textContent = `${loopedcounter} Times Looped`;
                        if(loopedcount !== 0){
                            if(loopedcounter >= loopedcount){
                                // remove loop for next video
                                loop = false;
                                videoel.removeEventListener("ended", videoended);
                                // reset values and ui
                                loopsvgel.src = loopsvgfalse;
                                loopcountel.value = "";
                                loopedcount = 0;
                                loopedcounter = 0;
                                loopcounterel.textContent = `${loopedcounter} Times Looped`;
                            } else {
                                // replay
                                videoel.currentTime = 0;
                            }
                        } else {
                            // replay
                            videoel.currentTime = 0;
                        }
                    });
                } else {
                    // disable loop
                    loop = false;
                    videoel.removeEventListener("ended", videoended);
                    loopsvgel.src = loopsvgfalse;
                }
            })
        })
    });
})();
