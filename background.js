chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome')) {
        chrome.storage.local.get(['stealthScriptsDB'], async (result) => {
            const scripts = result.stealthScriptsDB || [];
            
            for (const script of scripts) {
                if (script.ativo === false) continue;

                let regexString = script.match.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
                
                if (new RegExp('^' + regexString).test(tab.url) || script.match === '<all_urls>') {
                    try {
                        await chrome.debugger.attach({ tabId }, "1.3");
                        await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
                            expression: script.codigo
                        });
                        await chrome.debugger.detach({ tabId });
                        console.log("🚀 Script executado via Debugger:", script.name);
                    } catch (e) {
                    }
                }
            }
        });
    }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (!sender.tab) return;
    const tabId = sender.tab.id;

    if (req.acao === "CLIQUE") {
        executarClique(tabId, req.x, req.y).then(sendResponse);
        return true;
    }
    if (req.acao === "DIGITAR") {
        executarDigitacao(tabId, req.texto).then(sendResponse);
        return true;
    }
});

async function executarClique(tabId, x, y) {
    try { await chrome.debugger.attach({ tabId }, "1.3"); } catch(e){}
    await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await new Promise(r => setTimeout(r, 50));
    await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    try { await chrome.debugger.detach({ tabId }); } catch(e){}
}

async function executarDigitacao(tabId, texto) {
    try { await chrome.debugger.attach({ tabId }, "1.3"); } catch(e){}
    for (const char of texto) {
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", { type: "keyDown", text: char });
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", { type: "keyUp", text: char });
        await new Promise(r => setTimeout(r, Math.random() * 50 + 20));
    }
    try { await chrome.debugger.detach({ tabId }); } catch(e){}
}