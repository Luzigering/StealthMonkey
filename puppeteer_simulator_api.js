window.puppeteer_simulator_api = {
    async clickUpdt(elemento) {
        if (!elemento) return console.error("API: Elemento não encontrado!");
        const rect = elemento.getBoundingClientRect();
        return new Promise(resolve => {
            chrome.runtime.sendMessage({ 
                acao: "CLIQUE_REAL", 
                coordenadas: { x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2) } 
            }, resolve);
        });
    },

    async digitarFisico(elemento, texto) {
        if (!elemento) return console.error("API: Elemento não encontrado!");
        await this.clickUpdt(elemento);
        await new Promise(r => setTimeout(r, 300));
        return new Promise(resolve => {
            chrome.runtime.sendMessage({ acao: "DIGITAR_REAL", texto: texto }, resolve);
        });
    },

    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Função nova: Pergunta pro banco de dados se a chavinha está ligada
    async taLigado(botId) {
        return new Promise(resolve => {
            chrome.storage.local.get(['statusBots'], (result) => {
                const status = result.statusBots || {};
                resolve(status[botId] !== false); // Se não existir, o padrão é ligado (true)
            });
        });
    }
};