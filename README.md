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

Em suma, podemos definir que os userscripts manager atuam limitados á camada de interface, enquanto meu projeto se propõe a ser uma ferramenta efetiva de emulação de software, pois os eventos são processados via CDP (Chrome Debugger Protocol), diretamente pelo motor C++, e os cliques são movidos baseados em coordenadas cartesianas.

# English
inspired by the userscript manager tampermonkey and others in this segment, i created this browser extension that initiates debugging on the browser page as soon as it identifies the existence of userscripts, so that istrusted is always true.

but this is not just a new version of something that already exists. i identified that most references in the segment had no means of guaranteeing that the code would be highly undetectable by the automation's target system, failing in this sense for automations carried out by puppeteer. by using the native chrome debugger api, we have the guarantee that during the injection of commands, events such as clicks, which are primal for automations, always operate with the "istrusted=true" flag, thus making the scripts undetectable. even so, this system is in the beta phase, and i may later include improvements in the dash, such as the inclusion of tutorial posts on the use of jitters (randomization based on math.random to adjust click and typing delay).

i implemented a transpiler to convert traditional js codes, usually following a pattern with function synchronicity, and included a logic that adapts the code for the stealth system, which depends on the asynchronicity of functions, since the debugging and chromedebugger calls already occur synchronously. even with the transpiler, to have greater efficiency, i recommend that you understand the system logic and always make manual adjustments; for this, follows the governing logic of the transpiler:

const botao = document.querySelector('#botao-1');
botao.click(); is replaced by: await window.puppeteer_simulator_api.clickUpdt(botao);

const input = document.querySelector('#email');
input.value = "teste@email.com";
await window.puppeteer_simulator_api.digitarFisico(input, "teste@email.com");

and as mentioned above, the function block closest to the command must be defined as asynchronous.
