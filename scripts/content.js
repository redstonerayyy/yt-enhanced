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
                // do nothing
            }
        })
        
        // attach event listeners to loaded elements
        loopsvgel.addEventListener("click", () => {
            helpers.waitforelement("#movie_player > div.html5-video-container.style-scope.ytd-player > video").then((nodes) => {
                let videoel = nodes[0];
                if(!loop){
                    loopsvgel.src = loopsvgtrue;
                    loop = true;
                    videoel.addEventListener("ended", (ev) => {
                        loopedcounter++;
                        loopcounterel.textContent = `${loopedcounter} Times Looped`;
                        if(loopedcount !== 0){
                            if(loopedcounter >= loopedcount){
                                loop = false;
                                loopedcounter = 0;
                                loopedcount = 0;
                            }
                        } else {
                            console.log("seek")
                            videoel.currentTime = 0;
                        }
                    });
                } else {
                    loop = false;
                    loopsvgel.src = loopsvgfalse;
                }
            })
        })
    });
})();
