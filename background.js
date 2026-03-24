chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome')) {
        chrome.storage.local.get(['stealthScriptsDB'], (result) => {
            const scripts = result.stealthScriptsDB || [];
            const scriptAtivo = scripts.find(s => {
                let pattern = s.match.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
                return new RegExp('^' + pattern).test(tab.url) && s.ativo !== false;
            });

            if (scriptAtivo) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    world: 'MAIN', 
                    func: (userCode) => {
                        window.puppeteer_simulator_api = {
                          clickUpdt: function(el) {
                                if (!el) return;
                                const r = el.getBoundingClientRect();
                                const x = r.left + (r.width / 2);
                                const y = r.top + (r.height / 2);

                                const dot = document.createElement('div');
                                dot.style.position = 'fixed';
                                dot.style.left = x + 'px';
                                dot.style.top = y + 'px';
                                dot.style.width = '8px';
                                dot.style.height = '8px';
                                dot.style.background = '#ff0000';
                                dot.style.borderRadius = '50%';
                                dot.style.zIndex = '9999999';
                                dot.style.transform = 'translate(-50%, -50%)';
                                dot.style.pointerEvents = 'none'; // Deixa o clique atravessar o ponto
                                dot.style.boxShadow = '0 0 10px #ff0000';
                                document.body.appendChild(dot);
                                
                                setTimeout(() => dot.remove(), 3000);

                                const id = Math.random().toString();
                                return new Promise(resolve => {
                                    const listener = (e) => {
                                        if (e.data.id === id && e.data.origem === "STEALTH_RES") {
                                            window.removeEventListener("message", listener);
                                            resolve();
                                        }
                                    };
                                    window.addEventListener("message", listener);
                                    window.postMessage({ origem: "STEALTH_REQ", acao: "CLIQUE", x, y, id }, "*");
                                });
                            },
                            digitarFisico: async function(el, texto) {
                                if (!el) return;
                                await this.clickUpdt(el);
                                const id = Math.random().toString();
                                return new Promise(resolve => {
                                    const listener = (e) => {
                                        if (e.data.id === id && e.data.origem === "STEALTH_RES") {
                                            window.removeEventListener("message", listener);
                                            resolve();
                                        }
                                    };
                                    window.addEventListener("message", listener);
                                    window.postMessage({ origem: "STEALTH_REQ", acao: "DIGITAR", texto, id }, "*");
                                });
                            },
                            esperar: (ms) => new Promise(r => setTimeout(r, ms))
                        };

                        try {
                            const script = document.createElement('script');
                            script.textContent = userCode;
                            document.documentElement.appendChild(script);
                            script.remove();
                            console.log("🌽 StealthMonkey: API injetada com sucesso no MAIN world.");
                        } catch (e) {
                            console.error("Erro na injeção:", e);
                        }
                    },
                    args: [scriptAtivo.codigo]
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (!sender.tab) return;
    const tabId = sender.tab.id;

    if (req.acao === "CLIQUE") {
        (async () => {
            try {
                await chrome.debugger.attach({ tabId }, "1.3");
                await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", { 
                    type: "mousePressed", x: req.x, y: req.y, button: "left", clickCount: 1 
                });
                await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", { 
                    type: "mouseReleased", x: req.x, y: req.y, button: "left", clickCount: 1 
                });
                await chrome.debugger.detach({ tabId });
                sendResponse({ ok: true });
            } catch (e) { sendResponse({ ok: false }); }
        })();
        return true; 
    }

    if (req.acao === "DIGITAR") {
        (async () => {
            try {
                await chrome.debugger.attach({ tabId }, "1.3");
                
                for (const char of req.texto) {
                    await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", { 
                        type: "keyDown", text: char 
                    });
                    
                    await new Promise(r => setTimeout(r, Math.random() * 30 + 20));

                    await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", { 
                        type: "keyUp", text: char 
                    });

                    let delayBase = Math.random() * 80 + 50; 
                    
                    if (Math.random() < 0.15) {
                        delayBase += Math.random() * 200 + 150; 
                    }

                    await new Promise(r => setTimeout(r, delayBase));
                }
                
                await chrome.debugger.detach({ tabId });
                sendResponse({ ok: true });
            } catch (e) { 
                console.error("Erro na digitação furtiva:", e);
                sendResponse({ ok: false }); 
            }
        })();
        return true;
    }
});