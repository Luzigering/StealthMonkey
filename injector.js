window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || event.data.origem !== "PUPPETEER_SIM") return;
    if (event.data.acao === "CLIQUE_REAL" || event.data.acao === "DIGITAR_REAL") {
        chrome.runtime.sendMessage(event.data, (resposta) => {
            window.postMessage({ origem: "PUPPETEER_SIM_RESPOSTA", id: event.data.id, resposta: resposta }, "*");
        });
    }
});

chrome.storage.local.get(['stealthScriptsDB'], (result) => {
    const scripts = result.stealthScriptsDB || [];
    const urlAtual = window.location.href;
    let injetouAPI = false;

    scripts.forEach(scriptObj => {
        let padraoUrl = scriptObj.match.trim();
        if (padraoUrl === '<all_urls>') padraoUrl = '*://*/*';
        
        let regexString = padraoUrl.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        const validadorRegex = new RegExp('^' + regexString);

        if (validadorRegex.test(urlAtual)) {
            console.log(`%c[StealthMonkey] 🚀 Injetando script: "${scriptObj.name}"`, "color: #4caf50; font-weight: bold; font-size: 14px;");

            if (!injetouAPI) {
                const scriptAPI = document.createElement('script');
                scriptAPI.textContent = `
                    window.puppeteer_simulator_api = {
                        contadorId: 0,
                        _enviarPedido(acao, payload) {
                            return new Promise(resolve => {
                                const id = ++this.contadorId;
                                const listener = (event) => {
                                    if (event.source === window && event.data.origem === "PUPPETEER_SIM_RESPOSTA" && event.data.id === id) {
                                        window.removeEventListener("message", listener);
                                        resolve(event.data.resposta);
                                    }
                                };
                                window.addEventListener("message", listener);
                                window.postMessage({ origem: "PUPPETEER_SIM", acao, id, ...payload }, "*");
                            });
                        },
                        async clickUpdt(elemento) {
                            if (!elemento) return;
                            const rect = elemento.getBoundingClientRect();
                            return this._enviarPedido("CLIQUE_REAL", { coordenadas: { x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2) } });
                        },
                        async digitarFisico(elemento, texto) {
                            if (!elemento) return;
                            await this.clickUpdt(elemento); 
                            await new Promise(r => setTimeout(r, 300));
                            return this._enviarPedido("DIGITAR_REAL", { texto });
                        },
                        esperar(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
                    };
                `;
                document.documentElement.appendChild(scriptAPI);
                scriptAPI.remove();
                injetouAPI = true;
            }

            const scriptDoUsuario = document.createElement('script');
            scriptDoUsuario.textContent = scriptObj.codigo;
            document.documentElement.appendChild(scriptDoUsuario);
            scriptDoUsuario.remove();
        }
    });
});