let loopedcounter = 0;
let loopedcount = 0;
let loop = false;
// elements will be initialised when looped, global so eventlistener of ended
// event on video can access them
let loopsvgel;
let loopcounterel;
let loopcountel;

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
        loopsvgel = document.getElementById("injected-looper-loop-symbol");
        loopsvgel.src = loopsvgfalse;
        
        // loop counter display
        loopcounterel = document.getElementById("injected-loop-counter");
        
        // loop count input
        loopcountel = document.getElementById("injected-loop-count");
        loopcountel.addEventListener("input", (ev) => {
            let content = ev.target.value;
            try {
                loopedcount = Number(content);
            } catch (e) {
                loopedcount = 0;
            }
        })
        
        // attach event listeners to loop button elements
        loopsvgel.addEventListener("click", () => {
            // check what to do on click
            if(!loop){
                // enable loop
                loop = true;
                loopsvgel.src = loopsvgtrue;
            } else {
                // disable loop
                loop = false;
                loopsvgel.src = loopsvgfalse;
            }
        });

        // attach eventlistener to video element
        // path may need adjusting in the future when things change
        helpers.waitforelement("#movie_player > div.html5-video-container.style-scope.ytd-player > video").then((nodes) => {
            // video element from yt
            let videoel = nodes[0];

            const observer = new MutationObserver((mutationlist)=>{
                for (const mutation of mutationlist) {
                    if (mutation.type === "childList") {
                        console.log("A child node has been added or removed.");
                    } else if (mutation.type === "attributes") {
                        console.log(`The ${mutation.attributeName} attribute was modified, previously it was ${mutation.oldValue}`);
                    }
                }
            });

            observer.observe(videoel, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true,
            });

            videoel.addEventListener("timeupdate", (ev) => {
                // prevent yt listener from executing, important only when video is part of a playlist
                // because of this we can't use the 'ended' event
                // ev.stopImmediatePropagation() also does not work, as the yt listener was added prior to our listener
                if(videoel.currentTime > videoel.duration * 0.99){
                    // increase looped count
                    loopedcounter++;
                    loopcounterel.textContent = `${loopedcounter} Times Looped`;
                    console.log(loop);
                    if(loop){
                        if(loopedcount !== 0){
                            if(loopedcounter >= loopedcount){
                                // remove loop for next video
                                loop = false;
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
                    } else {
                        // reset values and ui
                        loopsvgel.src = loopsvgfalse;
                        loopcountel.value = "";
                        loopedcount = 0;
                        loopedcounter = 0;
                        loopcounterel.textContent = `${loopedcounter} Times Looped`;
                    }
                    console.log(loop);
                }
            })
        });
    });
})();
