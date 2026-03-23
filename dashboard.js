document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('codigoUsuario');
    const highlight = document.getElementById('highlighting');
    const lineNumbers = document.getElementById('lineNumbers');
    const findInput = document.getElementById('findInput');
    const replaceInput = document.getElementById('replaceInput');
    const matchCounter = document.getElementById('matchCounter');

    let scriptsSalvos = [];
    let idEditandoAgora = -1;
    let matches = [];
    let currentMatchIndex = -1;

    function applySyntax(text) {
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/\b(const|let|var|function|return|if|else|for|while|async|await|class|new|try|catch)\b/g, '<span class="kwd">$1</span>');
        html = html.replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="fnc">$1</span>');
        html = html.replace(/('.*?'|".*?"|`[\s\S]*?`|&quot;.*?&quot;)/g, '<span class="str">$1</span>');
        html = html.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
        html = html.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span class="cmt">$1</span>');
        return html;
    }

    function syncEditor() {
        const code = textarea.value;
        const searchTerm = findInput.value;
        let html = applySyntax(code);

        if (searchTerm) {
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let i = 0;
            html = html.replace(regex, (m) => {
                const isCurrent = (i === currentMatchIndex);
                i++;
                return `<mark class="${isCurrent ? 'current' : ''}">${m}</mark>`;
            });
        }

        highlight.innerHTML = html;
        
        const lines = code.split('\n');
        lineNumbers.innerHTML = '';
        lines.forEach((_, i) => {
            const div = document.createElement('div');
            div.textContent = i + 1;
            div.onclick = () => selectLine(i);
            lineNumbers.appendChild(div);
        });
        
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
        lineNumbers.scrollTop = textarea.scrollTop;
    }

    function selectLine(lineIdx) {
        const lines = textarea.value.split('\n');
        let startPos = 0;
        for (let i = 0; i < lineIdx; i++) {
            startPos += lines[i].length + 1;
        }
        const endPos = startPos + lines[lineIdx].length;
        
        textarea.focus();
        textarea.setSelectionRange(startPos, endPos);
        
        const lineHeight = 22;
        textarea.scrollTop = (lineIdx * lineHeight) - (textarea.clientHeight / 2);
    }

    function findNext() {
        const term = findInput.value;
        const text = textarea.value;
        if (!term) return;

        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        matches = [];
        let m;
        while ((m = regex.exec(text)) !== null) matches.push(m.index);

        if (matches.length > 0) {
            currentMatchIndex = (currentMatchIndex + 1) % matches.length;
            const pos = matches[currentMatchIndex];
            
            textarea.focus();
            textarea.setSelectionRange(pos, pos + term.length);

            const lineNumber = text.substring(0, pos).split('\n').length - 1;
            const lineHeight = 22;
            textarea.scrollTop = (lineNumber * lineHeight) - (textarea.clientHeight / 2);
            
            matchCounter.textContent = `${currentMatchIndex + 1}/${matches.length}`;
        }
        syncEditor();
    }

    function renderLista() {
        listaScripts.innerHTML = '';
        scriptsSalvos.forEach((s, i) => {
            const li = document.createElement('li');
            if (i === idEditandoAgora) li.className = 'active';
            li.innerHTML = `<span>${s.name}</span><span class="btn-del" data-i="${i}">DEL</span>`;
            li.onclick = (e) => {
                if (e.target.classList.contains('btn-del')) {
                    scriptsSalvos.splice(i, 1);
                    idEditandoAgora = -1;
                    chrome.storage.local.set({ 'stealthScriptsDB': scriptsSalvos }, renderLista);
                    return;
                }
                idEditandoAgora = i;
                textarea.value = s.codigo;
                renderLista();
                syncEditor();
            };
            listaScripts.appendChild(li);
        });
    }

    document.getElementById('btnSalvar').onclick = () => {
        const codigo = textarea.value;
        const meta = codigo.match(/@name\s+(.+)/);
        const name = meta ? meta[1].trim() : "Untitled Script";
        const obj = { name, codigo, match: "<all_urls>", ativo: true };

        if (idEditandoAgora === -1) {
            scriptsSalvos.push(obj);
            idEditandoAgora = scriptsSalvos.length - 1;
        } else {
            scriptsSalvos[idEditandoAgora] = obj;
        }

        chrome.storage.local.set({ 'stealthScriptsDB': scriptsSalvos }, () => {
            renderLista();
            const btn = document.getElementById('btnSalvar');
            btn.textContent = "✅ Saved!";
            setTimeout(() => btn.textContent = "Save Script", 1500);
        });
    };

    document.getElementById('btnNovo').onclick = () => {
        idEditandoAgora = -1;
        textarea.value = "// ==UserScript==\n// @name  New Script\n// @version  1.0\n// @description  Userscript of user \n// @author User \n// @match  New Script\n// @grant none \n//==/UserScript==\n\n";
        textarea.focus();
        renderLista();
        syncEditor();
    };

    // Eventos de Teclado e Scroll
    textarea.addEventListener('input', syncEditor);
    textarea.addEventListener('scroll', syncEditor);
    findInput.addEventListener('input', () => { currentMatchIndex = -1; findNext(); });
    document.getElementById('btnNext').onclick = findNext;
    
    document.getElementById('btnReplace').onclick = () => {
        const term = findInput.value;
        const rep = replaceInput.value;
        if (!term) return;
        textarea.value = textarea.value.replace(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), rep);
        syncEditor();
    };

    chrome.storage.local.get(['stealthScriptsDB'], (res) => {
        scriptsSalvos = res.stealthScriptsDB || [];
        renderLista();
    });
});