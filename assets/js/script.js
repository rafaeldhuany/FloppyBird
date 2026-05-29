(function() {
    const assets = {
        logo: "assets/img/floppybird.png",
        bg: "assets/img/background-night.png", 
        pipeBody: "assets/img/corpo.png", 
        pipeTop: "assets/img/borda-2.png",    
        pipeBottom: "assets/img/borda-1.png", 
    };

    const characters = [
        { id: 0, name: 'Clássico', src: "assets/img/bird-2.png" },
        { id: 1, name: 'Azul', src: "assets/img/bird-1.png" },
        { id: 2, name: 'Vermelho', src: "assets/img/bird-3.png" }
    ];

    let selectedCharIndex = 0;
    const baseDim = { birdW: 60, birdH: 42, pipeW: 90, pipeGap: 170 };
    const basePhysics = { gravity: 0.45, jump: 7.5, speed: 3.5 };

    let dim = { ...baseDim };
    let physics = { ...basePhysics };

    const canvas = document.getElementById('fbird-gameCanvas');
    const container = document.getElementById('fbird-game-container');
    const ctx = canvas.getContext('2d', { alpha: false });

    let gameW = 0;
    let gameH = 0;
    
    const ui = {
        selection: document.getElementById('fbird-selectionScreen'),
        gameOver: document.getElementById('fbird-gameOverScreen'),
        scoreDisplay: document.getElementById('fbird-gameScore'),
        finalScore: document.getElementById('fbird-finalScore'),
        bestScore: document.getElementById('fbird-bestScore'),
        menuBestScore: document.getElementById('fbird-menuBestScore'),
        charContainer: document.getElementById('fbird-charContainer'),
        logoImg: document.getElementById('fbird-logoImg')
    };

    document.getElementById('btn-start-game').addEventListener('click', startGame);
    document.getElementById('btn-reset-game').addEventListener('click', resetGame);
    document.getElementById('btn-back-menu').addEventListener('click', backToMenu);

    if(assets.logo) ui.logoImg.src = assets.logo;

    const img = {
        pipeBody: new Image(),
        pipeTop: new Image(),
        pipeBottom: new Image(),
        bg: assets.bg ? new Image() : null
    };
    img.pipeBody.src = assets.pipeBody;
    img.pipeTop.src = assets.pipeTop;
    img.pipeBottom.src = assets.pipeBottom;
    if(img.bg) img.bg.src = assets.bg;

    const loadedCharImages = [];
    characters.forEach(char => {
        const i = new Image();
        i.src = char.src;
        loadedCharImages.push(i);
    });

    let state = 'MENU';
    let frames = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('vacbird_highScore')) || 0;
    let backgroundScrollsInMenu = true; 

    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let lastTime = 0;
    let accumulator = 0;

    function calculateGameScale() {
        const isMobile = window.innerWidth <= 480;
        const scaleFactor = isMobile ? 0.70 : 1.0; 

        dim.birdW = Math.floor(baseDim.birdW * scaleFactor);
        dim.birdH = Math.floor(baseDim.birdH * scaleFactor);
        dim.pipeW = Math.floor(baseDim.pipeW * scaleFactor);
        dim.pipeGap = Math.floor(baseDim.pipeGap * scaleFactor);

        physics.gravity = basePhysics.gravity * scaleFactor;
        physics.jump = basePhysics.jump * scaleFactor;
        physics.speed = basePhysics.speed * scaleFactor;
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        gameW = container.clientWidth;
        gameH = container.clientHeight;

        canvas.width = gameW * dpr;
        canvas.height = gameH * dpr;

        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        
        ctx.imageSmoothingEnabled = false; 
        ctx.imageSmoothingQuality = 'high';

        calculateGameScale();
    }
    window.addEventListener('resize', resize);
    resize();

    function setSmartSmoothing(image, destW) {
        if (!image || image.naturalWidth === 0) return;
        const isHighRes = image.naturalWidth > (destW * 1.2);
        ctx.imageSmoothingEnabled = isHighRes;
    }

    function renderCharSelection() {
        ui.charContainer.innerHTML = '';
        characters.forEach((char, index) => {
            const div = document.createElement('div');
            div.className = `fbird-char-option ${index === selectedCharIndex ? 'selected' : ''}`;
            div.onclick = () => selectChar(index);
            const imgThumb = document.createElement('img');
            imgThumb.src = char.src; 
            div.appendChild(imgThumb);
            ui.charContainer.appendChild(div);
        });
    }

    function selectChar(index) {
        selectedCharIndex = index;
        renderCharSelection();
    }

    const background = {
        x: 0,
        update() {
            this.x -= physics.speed * 0.5;
            if (this.x <= -gameW) {
                this.x = 0;
            }
        },
        draw() {
            if (img.bg && img.bg.complete && img.bg.naturalWidth !== 0) {
                setSmartSmoothing(img.bg, gameW);
                ctx.drawImage(img.bg, Math.floor(this.x), 0, gameW, gameH);
                ctx.drawImage(img.bg, Math.floor(this.x + gameW) - 1, 0, gameW, gameH); 
            }
        }
    };

    const bird = {
        x: 80, y: 200, speed: 0, 
        update() {
            this.speed += physics.gravity;
            this.y += this.speed;
            if (this.y + dim.birdH/2 >= gameH - 20) die();
            if (this.y < 0) this.y = 0;
        },
        draw() {
            ctx.save();
            ctx.translate(Math.floor(this.x), Math.floor(this.y));
            let rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.speed * 0.12)));
            ctx.rotate(rotation);
            const currentBirdImg = loadedCharImages[selectedCharIndex];
            if (currentBirdImg && currentBirdImg.complete && currentBirdImg.naturalWidth !== 0) {
                setSmartSmoothing(currentBirdImg, dim.birdW);
                ctx.drawImage(currentBirdImg, Math.floor(-dim.birdW/2), Math.floor(-dim.birdH/2), dim.birdW, dim.birdH);
            } else {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(Math.floor(-dim.birdW/2), Math.floor(-dim.birdH/2), dim.birdW, dim.birdH);
            }
            ctx.restore();
        }
    };

    const pipes = {
        items: [],
        update() {
            if (frames % 100 === 0) {
                const minPad = 70; 
                const maxPad = gameH - 180 - dim.pipeGap;
                let prevY;
                if (this.items.length > 0) {
                    prevY = this.items[this.items.length - 1].y;
                } else {
                    prevY = Math.random() * (maxPad - minPad) + minPad;
                }
                const maxDiff = 350; 
                const minPossible = Math.max(minPad, prevY - maxDiff);
                const maxPossible = Math.min(maxPad, prevY + maxDiff);
                const y = Math.random() * (maxPossible - minPossible) + minPossible;
                this.items.push({ x: gameW, y: y, passed: false });
            }
            
            for (let i = 0; i < this.items.length; i++) {
                let p = this.items[i];
                p.x -= physics.speed;
                
                const birdLeft = bird.x - dim.birdW/2 + 6;
                const birdRight = bird.x + dim.birdW/2 - 6;
                const birdTop = bird.y - dim.birdH/2 + 6;
                const birdBottom = bird.y + dim.birdH/2 - 6;
                
                if (birdRight > p.x && birdLeft < p.x + dim.pipeW) {
                    if (birdTop < p.y || birdBottom > p.y + dim.pipeGap) {
                        die();
                    }
                }
                if (p.x + dim.pipeW < bird.x && !p.passed) {
                    score++;
                    p.passed = true;
                    ui.scoreDisplay.innerText = score;
                }
                if (p.x + dim.pipeW <= 0) {
                    this.items.shift();
                    i--;
                }
            }
        },
        draw() {
            const blockSize = dim.pipeW; 
            const pipeW = dim.pipeW;
            const screenH = gameH;
            if(img.pipeBody.complete) setSmartSmoothing(img.pipeBody, blockSize);

            for (let p of this.items) {
                if (p.x > gameW || p.x + blockSize < -50) continue;
                const px = Math.floor(p.x);
                const py = Math.floor(p.y);
                const topCapY = py - blockSize;
                
                if (img.pipeBody.complete) {
                    let currentY = topCapY;
                    while(currentY > -blockSize) {
                        ctx.drawImage(img.pipeBody, px, Math.floor(currentY), blockSize, blockSize);
                        currentY -= (blockSize - 1);
                    }
                } else {
                    ctx.fillStyle = '#558022';
                    ctx.fillRect(px, 0, pipeW, py);
                }
                
                if(img.pipeTop.complete) {
                    ctx.save();
                    ctx.translate(px + blockSize, topCapY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img.pipeTop, 0, 0, blockSize, blockSize);
                    ctx.restore();
                }
                
                const botCapY = py + dim.pipeGap;
                const botBodyStartY = botCapY + blockSize;
                
                if(img.pipeBottom.complete) {
                    ctx.drawImage(img.pipeBottom, px, Math.floor(botCapY), blockSize, blockSize);
                }
                
                if (img.pipeBody.complete) {
                    let currentY = botBodyStartY - 1; 
                    while(currentY < screenH) {
                        ctx.drawImage(img.pipeBody, px, Math.floor(currentY), blockSize, blockSize);
                        currentY += (blockSize - 1); 
                    }
                } else {
                    ctx.fillStyle = '#558022';
                    ctx.fillRect(px, botBodyStartY, pipeW, screenH - botBodyStartY);
                }
            }
        }
    };

    const ground = {
        x: 0,
        update() {
            this.x -= physics.speed;
            if (this.x <= -gameW) this.x = 0;
        },
        draw() {
            ctx.fillStyle = '#ded895';
            ctx.fillRect(0, gameH - 20, gameW, 20);
            ctx.fillStyle = '#73bf2e';
            ctx.fillRect(0, gameH - 20, gameW, 4);
        }
    };

    function init() {
        if (canvas.width === 0) resize();
        renderCharSelection();
        ui.menuBestScore.innerText = highScore;
        showScreen('selection');
    }
    function startGame() {
        resetPhysics();
        state = 'PLAYING';
        showScreen('hud');
    }
    function resetGame() {
        resetPhysics();
        state = 'PLAYING';
        showScreen('hud');
    }
    function backToMenu() {
        showScreen('selection');
        state = 'MENU';
        backgroundScrollsInMenu = true; 
    }
    function resetPhysics() {
        bird.y = 200;
        bird.speed = 0;
        pipes.items = [];
        score = 0;
        frames = 0;
        ui.scoreDisplay.innerText = 0;
    }
    
    function die() {
        state = 'GAMEOVER';
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('vacbird_highScore', highScore);
            ui.menuBestScore.innerText = highScore;
        }
        ui.finalScore.innerText = score;
        ui.bestScore.innerText = highScore;
        showScreen('gameover');
    }

    function showScreen(name) {
        ui.selection.style.display = 'none';
        ui.gameOver.style.display = 'none';
        ui.scoreDisplay.style.display = 'none';

        if (name === 'selection') ui.selection.style.display = 'flex';
        if (name === 'gameover') ui.gameOver.style.display = 'flex';
        if (name === 'hud') ui.scoreDisplay.style.display = 'block';
    }
    
    function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = Math.min(timestamp - lastTime, 64); 
        lastTime = timestamp;
        accumulator += deltaTime;
        
        let updates = 0;
        while (accumulator >= frameInterval) {
            updateGameLogic();
            accumulator -= frameInterval;
            updates++;
            if(updates >= 4) { 
                accumulator = 0;
                break;
            }
        }
        drawGame();
        requestAnimationFrame(loop);
    }

    function updateGameLogic() {
        if (state === 'PLAYING') {
            bird.update();
            pipes.update();
            ground.update();
            background.update();
            frames++;
        } else if (state === 'MENU') { 
            ground.update();
            if (backgroundScrollsInMenu) {
                background.update();
            }
            bird.y = 200 + Math.sin(Date.now() / 200) * 8;
        }
    }

    function drawGame() {
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, gameW, gameH);
        background.draw();
        pipes.draw();
        ground.draw();
        bird.draw();
    }

    function handleInput(e) {
        if(e.type === 'keydown' && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.code)) {
            e.preventDefault();
        }

        if (state === 'MENU') {
            if (e.type === 'keydown') {
                if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    let newIndex = selectedCharIndex - 1;
                    if (newIndex < 0) newIndex = characters.length - 1;
                    selectChar(newIndex);
                }
                else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                    let newIndex = selectedCharIndex + 1;
                    if (newIndex >= characters.length) newIndex = 0;
                    selectChar(newIndex);
                }
                else if (e.code === 'Enter' || e.code === 'Space') {
                    startGame();
                }
            }
        }
        else if (state === 'GAMEOVER') {
            if (e.type === 'keydown') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    resetGame();
                }
                else if (e.code === 'Escape') {
                    backToMenu();
                }
            }
        }
        else if (state === 'PLAYING') {
            if (e.type === 'touchstart') e.preventDefault();
            if (e.type === 'keydown') {
                if (e.code === 'Space' || e.code === 'ArrowUp') {
                    bird.speed = -physics.jump;
                }
            }
            else if (e.type === 'mousedown' || e.type === 'touchstart') {
                bird.speed = -physics.jump;
            }
        }
    }
    window.addEventListener('keydown', handleInput);
    window.addEventListener('touchstart', handleInput, { passive: false });
    canvas.addEventListener('mousedown', handleInput);
    
    init();
    requestAnimationFrame(loop);
})();