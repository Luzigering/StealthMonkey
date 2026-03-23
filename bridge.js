const scriptAPI = document.createElement('script');
scriptAPI.textContent = `
    window.puppeteer_simulator_api = {
        clickUpdt: function(elemento) {
            if (!elemento) return;
            const rect = elemento.getBoundingClientRect();
            return new Promise(resolve => {
                const id = Math.random().toString();
                const listener = (e) => {
                    if (e.data.origem === "STEALTH_RES" && e.data.id === id) {
                        window.removeEventListener("message", listener);
                        resolve();
                    }
                };
                window.addEventListener("message", listener);
                window.postMessage({ origem: "STEALTH_REQ", acao: "CLIQUE", x: rect.left + (rect.width/2), y: rect.top + (rect.height/2), id }, "*");
            });
        },
        digitarFisico: async function(elemento, texto) {
            if (!elemento) return;
            await this.clickUpdt(elemento);
            await new Promise(r => setTimeout(r, 300));
            return new Promise(resolve => {
                const id = Math.random().toString();
                const listener = (e) => {
                    if (e.data.origem === "STEALTH_RES" && e.data.id === id) {
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
`;
document.documentElement.appendChild(scriptAPI);
scriptAPI.remove();

window.addEventListener("message", (event) => {
    if (event.data && event.data.origem === "STEALTH_REQ") {
        chrome.runtime.sendMessage(event.data, (res) => {
            window.postMessage({ origem: "STEALTH_RES", id: event.data.id }, "*");
        });
    }
});