# Floppy Bird 🕹️ 

Jogo de sobrevivência 2D inspirado no Flappy Bird, desenvolvido inteiramente com JavaScript puro, HTML e CSS. Apresenta controles adaptados para teclado e telas touch, além de uma estética noturna com seleção de pássaros.

Teste o jogo diretamente no navegador:
👉 https://rafaeldhuany.github.io/FloppyBird/

---

## 🎮 O Projeto

O Floppy Bird nasceu da vontade de recriar a essência e a dificuldade viciante dos clássicos jogos de arcade para a web moderna. O foco foi desenvolver um minigame rápido e leve, operando inteiramente no client-side sem a dependência de engines pesadas ou frameworks, garantindo máxima performance e diversão direto no navegador.

## ✨ Funcionalidades Principais

* **Mecânica Clássica de Arcade:** Sobrevivência baseada em física e desvio contínuo de obstáculos.
* **Sistema de Recordes (High Score):** Sua melhor pontuação é salva automaticamente no navegador via `LocalStorage`, mantendo o desafio vivo a cada nova sessão de jogo.
* **Seleção de Personagens:** Escolha entre diferentes pássaros com design em pixel art antes de iniciar a partida.
* **Design Responsivo & Dark Mode:** Interface com estética noturna, otimizada tanto para monitores desktop (usando teclado) quanto para telas touch de smartphones.
* **Renderização em Canvas:** Todo o processamento gráfico ocorre via HTML5 Canvas, garantindo fluidez e respostas rápidas aos comandos.

---

## 🛠️ Tecnologias Utilizadas

O sistema foi construído de forma intencionalmente estática para garantir portabilidade e execução instantânea, não exigindo instalações complexas:

* HTML5 (Canvas API)
* CSS3
* JavaScript (Vanilla)

---

## ⚙️ Como Executar o Projeto Localmente

O Floppy Bird foi construído para ser incrivelmente simples e portátil. Você pode executá-lo de duas maneiras, dependendo do seu nível de conforto e ferramentas disponíveis:

### Opção 1: Execução Direta no Navegador (Mais Rápido e Offline)
Como o jogo é 100% Client-Side, você não precisa de nenhum software adicional para rodá-lo.
1. Baixe este repositório em formato `.zip` clicando em "Code" > "Download ZIP" no GitHub.
2. Extraia a pasta `FloppyBird` no seu computador.
3. Dê um clique duplo no arquivo `index.html` (ou arraste-o para o seu navegador favorito, como Chrome, Firefox ou Edge).
4. O jogo abrirá diretamente no navegador e já estará funcionando.

### Opção 2: Usando um Servidor Local (XAMPP / WampServer)
Se você prefere simular um ambiente de servidor local no seu desktop usando aplicativos de hospedagem local:
1. Baixe e instale o **XAMPP** ou **WampServer** no seu computador.
2. Baixe o projeto em `.zip` e extraia a pasta `FloppyBird`.
3. Mova a pasta `FloppyBird` para o diretório público do seu servidor:
   * **No XAMPP:** Cole a pasta dentro de `C:\xampp\htdocs\`
   * **No WampServer:** Cole a pasta dentro de `C:\wamp64\www\`
4. Inicie o painel de controle do seu servidor (XAMPP/WampServer) e ative o serviço **Apache**.
5. Abra o seu navegador e acesse a URL: `http://localhost/FloppyBird`