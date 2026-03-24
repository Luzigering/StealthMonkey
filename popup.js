document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('scriptsList');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const urlAtual = tab.url;

    chrome.storage.local.get(['stealthScriptsDB'], (result) => {
        const scripts = result.stealthScriptsDB || [];
        list.innerHTML = '';
        let encontrouAlgo = false;

        scripts.forEach((script, index) => {
            let matchFormatado = script.match ? script.match.trim() : '*://*/*';
            if (matchFormatado === '<all_urls>') matchFormatado = '*://*/*';
            
            let regexString = matchFormatado.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
            const matchRegex = new RegExp('^' + regexString);

            if (matchRegex.test(urlAtual)) {
                encontrouAlgo = true;
                const div = document.createElement('div');
                div.className = 'script-item';
                div.innerHTML = `
                    <div class="script-info">
                        <span class="script-name" title="${script.name}">${script.name}</span>
                        <span class="script-author">por ${script.author || 'Lu'}</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" data-id="${index}" ${script.ativo !== false ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                `;
                list.appendChild(div);
            }
        });

        if (!encontrouAlgo) {
            list.innerHTML = `
                <div class="empty-msg">
                    <span style="font-size: 24px; display: block; margin-bottom: 8px;">👻</span>
                    Nenhum script configurado para esta página.
                </div>
            `;
        } else {
            document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-id');
                    scripts[id].ativo = e.target.checked;
                    chrome.storage.local.set({ 'stealthScriptsDB': scripts });
                });
            });
        }
    });

    document.getElementById('btnDash').onclick = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    };
});