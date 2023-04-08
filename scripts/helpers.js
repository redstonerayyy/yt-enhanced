// makes it possible to wait for the load of a DOM element
// https://stackoverflow.com/questions/34863788/how-to-check-if-an-element-has-been-loaded-on-a-page-before-running-a-script
export async function waitforelement(queryselector, timeout){
    return new Promise((resolve, reject)=>{
        let nodes = document.querySelectorAll(queryselector);
        if(nodes.length) return resolve(nodes);

        let timer;

        const observer = new MutationObserver(()=>{
            let nodes = document.querySelectorAll(queryselector);
            if(nodes.length){
                observer.disconnect();
                clearTimeout(timer);
                return resolve(nodes);
            }
        });

        observer.observe(document.body, {
            childList: true, 
            subtree: true
        });

        timer = setTimeout(()=>{
            observer.disconnect();
            reject();
            }, timeout);
    });
}
