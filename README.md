# StealthMonkey
<img width="1292" height="994" alt="image" src="https://github.com/user-attachments/assets/468e9d21-6656-4512-a754-e29e8da6a426"/>

Inspirada no gerenciador de scripts do usuário Tampermonkey e demais desse segmento criei essa extensão de navegador que inicia a depuração na página no navegador assim que identifica existência de scripts do usuário para que isTrusted sempre seja true.
Mas não trata apenas de uma nova versão de algo que já existe. Identifiquei que a maioria das referências no segmento não tinham meio de garantia de que o código seria altamente indetectável pelo sistema alvo da automação, pecando nesse sentido para as automações efetivadas pelo Puppeteer,usando a API nativa Chrome Debugger temos a garantia de que durante a injeção de comandos os eventos como os de clique que são primais para automações operem sempre com a flag "isTrusted=true", tornando assim os scripts indetectáveis. Ainda assim, esse sistema está em fase BETA, e posso incluir posteriormente melhorias no dash como inclusão de postagens de tutoria sobre uso de Jitters (sorteio baseado em Math.random para ajuste do delay de clique e digitação);

Implementei um transpilador para converter códigos tradicionais JS geralmente seguindo um padrão com sincronicidade de funções e inclui uma lógica que adapta o código para o sistema furtivo, que depende da assincronicidade das funções, já que a depuração e chamada da ChromeDebugger já ocorre sincronamente; Ainda com o transpilador, para ter maior eficiência recomendo que entendam a lógica do sistema e façam sempre ajustes manuais, para isso segue a lógica regente do transpilador:

const botao = document.querySelector('#botao-1);
botao.click(); é substituído por: await window.puppeteer_simulator_api.clickUpdt(botao);

const input = document.querySelector('#email');
input.value = "teste@email.com";
await window.puppeteer_simulator_api.digitarFisico(input, "teste@email.com");

E conforme mencionado acima, o bloco de função mais próximo do comando deve ser definido como assíncrono;
