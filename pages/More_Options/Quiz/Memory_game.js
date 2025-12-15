/**
 * Gerador de Efeitos Sonoros Sci-Fi (Web Audio API)
 * Não requer ficheiros externos. Gera som via código.
 */
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3; // Volume geral (30%)
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
        return this.isMuted;
    }

    // Inicializa o contexto de áudio (necessário após interação do utilizador)
    init() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Toca um oscilador simples
     * @param {string} type - 'sine', 'square', 'sawtooth', 'triangle'
     * @param {number} startFreq - Frequência inicial
     * @param {number} endFreq - Frequência final
     * @param {number} duration - Duração em segundos
     */
    playTone(type, startFreq, endFreq, duration) {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        if (endFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // --- PRESETS DE EFEITOS ---

    playFlip() { this.playTone('triangle', 300, 50, 0.1); }
    playMatch() { 
        this.playTone('sine', 400, 800, 0.2); 
        setTimeout(() => this.playTone('sine', 800, 1200, 0.2), 100);
    }
    playError() { this.playTone('sawtooth', 150, 50, 0.3); }
    playClick() { this.playTone('square', 800, 0.01, 0.05); }
    playWin() {
        const notes = [440, 554, 659, 880];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone('square', note, note, 0.3), i * 150);
        });
    }
    playLose() {
        this.playTone('triangle', 400, 200, 0.4);
        setTimeout(() => this.playTone('triangle', 190, 50, 0.6), 350);
    }
}

/**
 * Lógica Principal do Jogo Nebula Minds
 */
class NebulaGame {
    constructor() {
        this.sound = new SoundManager(); // Inicializa o som

        this.config = {
            easy: { rows: 4, cols: 3, time: 60, pairs: 6 },
            medium: { rows: 4, cols: 4, time: 90, pairs: 8 },
            hard: { rows: 5, cols: 4, time: 120, pairs: 10 }
        };
        
        this.state = {
            active: false,
            difficulty: 'medium',
            cards: [],
            flipped: [],
            matches: 0,
            score: 0,
            timeLeft: 0,
            timer: null,
            combo: 1,
            lastMatch: 0,
            isLocked: false 
        };

        this.icons = [
            'fas fa-rocket', 'fas fa-user-astronaut', 'fas fa-satellite', 'fas fa-meteor',
            'fas fa-globe', 'fas fa-moon', 'fas fa-robot', 'fas fa-atom',
            'fas fa-dna', 'fas fa-microchip', 'fas fa-brain', 'fas fa-bolt'
        ];

        this.dom = {
            homeBtn: document.getElementById('home-btn'),
            soundBtn: document.getElementById('sound-btn'), 
            startBtn: document.getElementById('start-button'),
            resetBtn: document.getElementById('reset-button'),
            diffBtns: document.querySelectorAll('.diff-card'),
            introPanel: document.getElementById('difficulty-panel'),
            gameView: document.getElementById('game-view'),
            board: document.getElementById('game-board'),
            score: document.getElementById('score'),
            time: document.getElementById('time'),
            comboBadge: document.getElementById('combo-meter'),
            comboMult: document.getElementById('combo-multiplier'),
            modal: document.getElementById('message-modal'),
            modalClose: document.getElementById('modal-close-button'),
            finalScore: document.getElementById('final-score'),
            finalCombo: document.getElementById('final-combo'),
            modalTitle: document.getElementById('modal-title'),
            modalText: document.getElementById('modal-text')
        };

        this.init();
        this.renderInitialBoard(); // Exibe a tela inicial/dificuldade
    }

    init() {
        // Event Listeners
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        this.dom.resetBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.restartLevel();
        });
        
        this.dom.homeBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.goHome();
        });

        this.dom.modalClose.addEventListener('click', () => {
            this.sound.playClick();
            this.closeModal();
        });

        // Toggle Mute
        this.dom.soundBtn.addEventListener('click', () => {
            const muted = this.sound.toggleMute();
            const icon = this.dom.soundBtn.querySelector('i');
            
            if (muted) {
                icon.classList.replace('fa-volume-up', 'fa-volume-mute');
                this.dom.soundBtn.classList.add('muted');
            } else {
                icon.classList.replace('fa-volume-mute', 'fa-volume-up');
                this.dom.soundBtn.classList.remove('muted');
                this.sound.playClick();
            }
        });
        
        // Seleção de dificuldade
        this.dom.diffBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sound.playClick();
                const target = e.target.closest('.diff-card');
                this.setDifficulty(target);
            });
        });
    }

    // ================= GERENCIAMENTO DE TELAS E ESTADO =================

    setDifficulty(btnElement) {
        this.dom.diffBtns.forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
        this.state.difficulty = btnElement.dataset.level;
    }

    goHome() {
        if (this.state.active) {
            if (confirm("Abortar missão atual e voltar ao menu?")) {
                this.stopGame();
                this.showScreen('home');
            }
        } else {
            this.showScreen('home');
        }
    }

    showScreen(screen) {
        if (screen === 'home') {
            this.dom.introPanel.classList.remove('hidden');
            this.dom.gameView.classList.add('hidden');
            this.renderInitialBoard(); // Redesenha a visualização de dificuldade
        } else {
            this.dom.introPanel.classList.add('hidden');
            this.dom.gameView.classList.remove('hidden');
        }
    }

    startGame() {
        this.sound.init(); // Ativa o contexto de áudio
        this.sound.playClick();
        
        // Reset/Setup do estado
        this.state.active = true;
        this.state.score = 0;
        this.state.matches = 0;
        this.state.combo = 1;
        this.state.flipped = [];
        this.state.isLocked = false;
        
        this.updateHUD();
        this.showScreen('game');
        this.generateBoard();
        this.startTimer();
    }

    restartLevel() {
        this.stopGame();
        this.startGame();
    }

    stopGame() {
        this.state.active = false;
        clearInterval(this.state.timer);
    }

    // ================= LÓGICA DO TABULEIRO E JOGABILIDADE =================

    renderInitialBoard() {
        // Apenas para garantir que o HUD do tempo reflita a dificuldade inicial selecionada
        const cfg = this.config[this.state.difficulty];
        const m = Math.floor(cfg.time / 60);
        const s = cfg.time % 60;
        this.dom.time.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        this.dom.score.innerText = '0000';
    }
    
    generateBoard() {
        const cfg = this.config[this.state.difficulty];
        this.dom.board.innerHTML = '';
        this.dom.board.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;

        // Embaralha o deck
        let selection = this.icons.slice(0, cfg.pairs);
        let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

        deck.forEach((icon, i) => {
            const card = document.createElement('div');
            card.className = 'card-wrapper';
            card.innerHTML = `
                <div class="card" data-icon="${icon}" data-id="${i}">
                    <div class="card-face card-front"><i class="${icon}"></i></div>
                    <div class="card-face card-back"><i class="fas fa-fingerprint"></i></div>
                </div>
            `;
            card.addEventListener('click', () => this.flipCard(card.firstElementChild));
            this.dom.board.appendChild(card);
        });
    }

    flipCard(card) {
        // Validação de clique
        if (!this.state.active || 
            this.state.isLocked ||
            card.classList.contains('flipped') || 
            card.classList.contains('match')) return;

        this.sound.playFlip(); 
        card.classList.add('flipped');
        this.state.flipped.push(card);

        if (this.state.flipped.length === 2) {
            this.state.isLocked = true; // Bloqueia o tabuleiro para animação
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        const [c1, c2] = this.state.flipped;
        const match = c1.dataset.icon === c2.dataset.icon;

        if (match) {
            this.handleMatch(c1, c2);
        } else {
            this.handleMiss(c1, c2);
        }
        
        this.state.flipped = [];
        this.state.isLocked = false; // Desbloqueia o tabuleiro
    }

    handleMatch(c1, c2) {
        c1.classList.add('match');
        c2.classList.add('match');
        this.sound.playMatch(); 
        
        // Lógica de Combo
        const now = Date.now();
        if (now - this.state.lastMatch < 4000) { 
            this.state.combo++;
            this.dom.comboBadge.classList.remove('hidden');
        } else {
            this.state.combo = 1;
            this.dom.comboBadge.classList.add('hidden');
        }
        this.state.lastMatch = now;

        const points = 100 * this.state.combo;
        this.state.score += points;
        this.state.matches++;
        this.updateHUD();

        if (this.state.matches === this.config[this.state.difficulty].pairs) {
            setTimeout(() => this.endGame(true), 500);
        }
    }

    handleMiss(c1, c2) {
        this.sound.playError(); 
        this.state.combo = 1;
        this.dom.comboBadge.classList.add('hidden');
        this.updateHUD();
        
        c1.classList.add('error');
        c2.classList.add('error');

        // Desvira
        setTimeout(() => {
            c1.classList.remove('flipped', 'error');
            c2.classList.remove('flipped', 'error');
        }, 1000);
    }

    // ================= HUD, TIMER E FIM DE JOGO =================

    startTimer() {
        this.state.timeLeft = this.config[this.state.difficulty].time;
        this.updateTimerUI();

        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerUI();

            if (this.state.timeLeft <= 0) this.endGame(false);
        }, 1000);
    }

    updateTimerUI() {
        const m = Math.floor(this.state.timeLeft / 60);
        const s = this.state.timeLeft % 60;
        this.dom.time.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        
        // Feedback visual quando o tempo está acabando
        if(this.state.timeLeft <= 10 && this.state.timeLeft > 0) {
             this.dom.time.style.color = '#ff0055';
        } else {
             this.dom.time.style.color = 'var(--text)';
        }
    }

    updateHUD() {
        this.dom.score.innerText = this.state.score.toString().padStart(4, '0');
        this.dom.comboMult.innerText = this.state.combo;
    }

    endGame(win) {
        this.stopGame();
        
        if (win) {
            this.sound.playWin();
        } else {
            this.sound.playLose();
        }

        this.dom.modalTitle.innerText = win ? "MISSÃO CUMPRIDA" : "FALHA NO SISTEMA";
        this.dom.modalTitle.style.color = win ? "#32cd32" : "#ff0055";
        this.dom.modalText.innerText = win ? "Dados recuperados com sucesso!" : "Tempo esgotado. Tente novamente.";
        
        this.dom.finalScore.innerText = this.state.score;
        this.dom.finalCombo.innerText = this.state.combo;
        
        this.dom.modal.style.display = 'flex';
    }

    closeModal() {
        this.dom.modal.style.display = 'none';
        this.showScreen('home');
    }
}

document.addEventListener('DOMContentLoaded', () => new NebulaGame());
