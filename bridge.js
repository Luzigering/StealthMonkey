window.addEventListener("message", (event) => {
    if (event.data && event.data.origem === "STEALTH_REQ") {
        chrome.runtime.sendMessage(event.data, (res) => {
            window.postMessage({ 
                origem: "STEALTH_RES", 
                id: event.data.id, 
                res 
            }, "*");
        });
    }
});