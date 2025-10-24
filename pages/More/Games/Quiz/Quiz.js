// seu-script-principal.js

// =========================================================================
// === 0. IMPORTAÇÃO DOS DADOS (AGORA VIA ES6 MODULE) ===
// =========================================================================
import { DATA_URL } from 'Quiz-data.js'; // ⬅️ Importa a URL do arquivo config.js


document.addEventListener('DOMContentLoaded', () => {
    
    // Variável que irá armazenar os dados do quiz após o fetch
    let quizData = {}; 

    // === Elementos da Página Principal ===
    const tabsList = document.getElementById('tabs-list');
    const searchInput = document.getElementById('search-input');
    const cardsGrid = document.getElementById('cards-grid');
    
    let cardItems = []; 
    let playButtons = [];

    // === Elementos do Modal do Quiz ===
    const quizModal = document.getElementById('quiz-modal');
    const closeModalButton = document.querySelector('.close-modal-button');
    const quizArea = document.querySelector('.quiz-area');
    const quizQuestionText = document.getElementById('quiz-question-text');
    const currentQuestionNumber = document.getElementById('current-question-number');
    const currentScoreDisplay = document.getElementById('current-score'); 
    const quizOptionsContainer = document.getElementById('quiz-options-container');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizNextButton = document.getElementById('quiz-next-button');
    const quizResultsArea = document.getElementById('quiz-results-area');
    const quizFinalScore = document.getElementById('quiz-final-score');
    const restartQuizButton = document.getElementById('restart-quiz-button');
    const backToThemesButton = document.getElementById('back-to-themes-button');
    
    // === Elementos Vidas e GIF ===
    const lifeContainer = document.getElementById('life-container');
    const quizBackgroundGif = document.getElementById('quiz-background-gif');
    
    // === Variáveis de Controle e Configuração ===
    const MAX_QUESTIONS_PER_QUIZ = 15; // Mantido aqui como uma constante local
    let currentQuizQuestions = [];   
    let questionsAttempted = [];     
    let currentQuestionIndex = 0;
    let score = 0;
    let lives = 3; 
    let quizActive = false;
    let animationFrame; 
    let activeQuizThemeId = ''; 
    let startTime;                   
    let currentDifficulty = 1;       
    let TIME_PER_QUESTION = 15;      
    let timeLeft = TIME_PER_QUESTION;

    const ADAPTIVE_CONFIG = {
        EASY: { id: 1, maxTime: 15, avgReactionGoal: 3000 },  
        MEDIUM: { id: 2, maxTime: 10, avgReactionGoal: 2000 }, 
        HARD: { id: 3, maxTime: 7, avgReactionGoal: 1500 },    
        CHECK_INTERVAL: 5,                                 
        WIN_RATE_THRESHOLD: 0.8,                           
        LOSE_RATE_THRESHOLD: 0.5,                          
        REACTION_BONUS_THRESHOLD: 500,                     
        REACTION_PENALTY_THRESHOLD: 1000                   
    };
    
    const DIFFICULTY_NAMES = { 1: 'Fácil', 2: 'Médio', 3: 'Difícil', 4: 'Expert' };
    const MAX_DIFFICULTY_NAMES = { 1: 'Fácil', 2: 'Médio', 3: 'Difícil', 4: 'Expert' };
    
    // === Elementos do Canvas do Temporizador ===
    const timerCanvas = document.getElementById('timerCanvas');
    // Verifica se timerCanvas existe antes de tentar obter o contexto
    const ctx = timerCanvas ? timerCanvas.getContext('2d') : null;
    const centerX = timerCanvas ? timerCanvas.width / 2 : 0;
    const centerY = timerCanvas ? timerCanvas.height / 2 : 0;
    const radius = timerCanvas ? timerCanvas.width / 2 - 5 : 0; 
    const timerTextSize = 36; 

    // =======================================================
    // === FUNÇÃO CENTRAL: BUSCAR DADOS (Utiliza a DATA_URL importada) ===
    // =======================================================
    async function fetchQuizData() {
        console.log("Buscando dados da URL do Google Drive:", DATA_URL);
        
        cardsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 50px; font-size: 1.2rem; color: #5f6368;">Carregando temas do servidor... <i class="fa-solid fa-spinner fa-spin"></i></div>';

        try {
            const response = await fetch(DATA_URL);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}. Certifique-se que o arquivo está compartilhado.`);
            }
            
            // Tenta obter o JSON. Adicionamos um fallback caso o Content-Type do Google Drive não seja 'application/json'.
            try {
                quizData = await response.json();
            } catch (jsonError) {
                console.warn("Falha ao fazer parse direto para JSON. Tentando como texto...", jsonError);
                const textData = await response.text();
                // Tenta fazer o parse do texto puro, contornando o erro de Content-Type.
                quizData = JSON.parse(textData);
            }
            
            console.log("Dados carregados com sucesso:", quizData);
            
            // SUCESSO: Inicializamos a interface do usuário
            generateThemeCards(); 
            setupAllEventListeners();

        } catch (error) {
            console.error("Falha ao carregar dados do quiz:", error);
            cardsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; font-size: 1.2rem; color: #D0021B;">
                    <i class="fa-solid fa-circle-exclamation"></i> Falha ao carregar dados! 
                    <p style="font-size: 0.9rem; margin-top: 10px;">Verifique se o arquivo JSON no Google Drive está **público** e se o ID está correto.</p>
                </div>
            `;
        }
    }


    // --- FUNÇÕES DE GERAÇÃO E INICIALIZAÇÃO DE CARDS (RESTANTE DO CÓDIGO) ---
    
    function generateThemeCards() {
        if (!cardsGrid || Object.keys(quizData).length === 0) return;
        cardsGrid.innerHTML = '';
        
        Object.keys(quizData).forEach(themeId => {
            const data = quizData[themeId];
            
            const cardElement = document.createElement('div');
            const dataName = data.card_title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); 

            cardElement.classList.add('card-item');
            cardElement.setAttribute('data-theme', data.card_category);
            cardElement.setAttribute('data-name', dataName); 
            
            // Verifica se as propriedades essenciais existem antes de usar
            const cardTitle = data.card_title || 'Tema Desconhecido';
            const cardCategory = data.card_category || 'geral';
            const cardLevel = data.card_level || 1;
            const cardImage = data.card_image || 'https://via.placeholder.com/300x168/AAAAAA/FFFFFF?text=Sem+Imagem';

            cardElement.innerHTML = `
                <img src="${cardImage}" alt="${cardTitle}">
                <div class="card-info">
                    <h3>${cardTitle}</h3>
                    <p>${cardCategory.charAt(0).toUpperCase() + cardCategory.slice(1)} | Nível: ${MAX_DIFFICULTY_NAMES[cardLevel] || 'Fácil'}</p>
                    <button class="play-button" data-quiz-theme="${themeId}">JOGAR</button>
                </div>
            `;
            
            cardsGrid.appendChild(cardElement);
        });

        cardItems = cardsGrid.querySelectorAll('.card-item');
        playButtons = cardsGrid.querySelectorAll('.play-button');
        
        setupPlayButtonListeners();
        
        filterCards('all', '');
        if (tabsList && tabsList.querySelector('[data-filter="all"]')) {
            tabsList.querySelector('[data-filter="all"]').classList.add('active');
        }
    }
    
    function setupPlayButtonListeners() {
        playButtons.forEach(button => {
            button.removeEventListener('click', handlePlayButtonClick); 
            button.addEventListener('click', handlePlayButtonClick);
        });
    }

    function handlePlayButtonClick(event) {
        const themeId = event.target.getAttribute('data-quiz-theme');
        loadQuizQuestions(themeId); 
        openQuizModal();
    }


    // --- FUNÇÕES DE LÓGICA GERAL ---
    
    function shuffleArray(array) {
        const shuffled = [...array]; 
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    function getAverageReactionTime(n) {
        const recentCorrectTimes = questionsAttempted
            .filter(q => q.isCorrect && q.reactionTime !== null)
            .slice(-n)
            .map(q => q.reactionTime);

        if (recentCorrectTimes.length === 0) return ADAPTIVE_CONFIG.EASY.avgReactionGoal * 2; 

        const sum = recentCorrectTimes.reduce((a, b) => a + b, 0);
        return sum / recentCorrectTimes.length;
    }
    
    function updateDifficulty() {
        if (questionsAttempted.length === 0) return;

        const recentAttempts = questionsAttempted.slice(-ADAPTIVE_CONFIG.CHECK_INTERVAL);
        const correctCount = recentAttempts.filter(q => q.isCorrect).length;
        const winRate = correctCount / recentAttempts.length;

        // Regra de taxa de acerto
        if (winRate >= ADAPTIVE_CONFIG.WIN_RATE_THRESHOLD && currentDifficulty < ADAPTIVE_CONFIG.HARD.id) {
            currentDifficulty = Math.min(ADAPTIVE_CONFIG.HARD.id, currentDifficulty + 1);
        } else if (winRate <= ADAPTIVE_CONFIG.LOSE_RATE_THRESHOLD && currentDifficulty > ADAPTIVE_CONFIG.EASY.id) {
            currentDifficulty = Math.max(ADAPTIVE_CONFIG.EASY.id, currentDifficulty - 1);
        }

        // Regra de tempo de reação
        const avgReaction = getAverageReactionTime(3);
        const currentGoal = Object.values(ADAPTIVE_CONFIG).find(c => c.id === currentDifficulty).avgReactionGoal;

        if (avgReaction < currentGoal - ADAPTIVE_CONFIG.REACTION_BONUS_THRESHOLD && currentDifficulty < ADAPTIVE_CONFIG.HARD.id) {
            currentDifficulty = Math.min(ADAPTIVE_CONFIG.HARD.id, currentDifficulty + 1);
        } else if (avgReaction > currentGoal + ADAPTIVE_CONFIG.REACTION_PENALTY_THRESHOLD && currentDifficulty > ADAPTIVE_CONFIG.EASY.id) {
            currentDifficulty = Math.max(ADAPTIVE_CONFIG.EASY.id, currentDifficulty - 1);
        }
        
        // Aplica o novo tempo máximo
        TIME_PER_QUESTION = Object.values(ADAPTIVE_CONFIG).find(c => c.id === currentDifficulty).maxTime;
    }
    
    // --- LÓGICA DO QUIZ PRINCIPAL ---

    function loadQuizQuestions(themeId) {
        activeQuizThemeId = themeId; 
        
        if (!quizData[themeId]) {
            console.error(`Tema ${themeId} não encontrado nos dados carregados.`);
            return;
        }
        
        currentQuizQuestions = [];
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        lives = 3; 
        currentDifficulty = 1; 
        questionsAttempted = [];
        TIME_PER_QUESTION = ADAPTIVE_CONFIG.EASY.maxTime; 
        currentScoreDisplay.textContent = score; 
        quizArea.style.display = 'flex';
        quizResultsArea.style.display = 'none';
        
        updateLivesDisplay(); 
        
        const themeGifs = quizData[activeQuizThemeId]?.gif_urls;
        const defaultGifUrl = themeGifs 
            ? themeGifs.default 
            : 'https://via.placeholder.com/1920x1080/f0f2f5/3c4043?text=QUIZ+BACKGROUND+NEUTRO'; 
            
        quizBackgroundGif.innerHTML = `<img src="${defaultGifUrl}" alt="Background Neutro">`;
        
        loadQuestion();
    }
    
    function getNextAdaptiveQuestion() {
        if (questionsAttempted.length >= MAX_QUESTIONS_PER_QUIZ) {
            return null; 
        }

        const allQuestions = quizData[activeQuizThemeId]?.questions || [];
        
        const availableQuestions = allQuestions.filter(q => 
            q.difficulty === currentDifficulty || q.difficulty === Math.max(1, currentDifficulty - 1)
        );

        const availableUnattempted = availableQuestions.filter(q => 
            !questionsAttempted.some(a => a.question === q.question)
        );
        
        let pool = availableUnattempted.length > 0 ? availableUnattempted : availableQuestions;
        
        if (pool.length === 0) {
            pool = allQuestions;
            if (pool.length < ADAPTIVE_CONFIG.CHECK_INTERVAL) questionsAttempted = []; 
        }
        
        if (pool.length === 0) return null; 

        return pool[Math.floor(Math.random() * pool.length)];
    }

    function loadQuestion() {
        if (questionsAttempted.length > 0 && questionsAttempted.length % ADAPTIVE_CONFIG.CHECK_INTERVAL === 0) {
            updateDifficulty();
        }

        const questionData = getNextAdaptiveQuestion();
        
        if (!questionData) {
            showQuizResults(false, true); 
            return;
        }
        
        currentQuizQuestions[currentQuestionIndex] = questionData; 

        const currentQNum = questionsAttempted.length + 1;
        const totalQMax = MAX_QUESTIONS_PER_QUIZ;

        quizFeedback.textContent = `Nível: ${DIFFICULTY_NAMES[currentDifficulty]} - Tempo: ${TIME_PER_QUESTION}s`; 
        quizNextButton.style.display = 'none';
        quizActive = true;
        
        currentQuestionNumber.textContent = `${currentQNum} / ${totalQMax}`;
        quizQuestionText.textContent = questionData.question;
        quizOptionsContainer.innerHTML = '';

        const shuffledOptions = shuffleArray(questionData.options);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option-button-quiz');
            button.onclick = () => checkAnswer(option, questionData.answer, questionData.difficulty);
            quizOptionsContainer.appendChild(button);
        });

        startTime = Date.now();
        startTimer(); 
    }

    function checkAnswer(selectedOption, correctAnswer, questionDifficulty) {
        if (!quizActive) return; 
        stopTimer(); 
        
        const endTime = Date.now();
        const reactionTime = selectedOption !== null ? (endTime - startTime) : (TIME_PER_QUESTION * 1000); 
        
        quizActive = false; 

        const buttons = quizOptionsContainer.querySelectorAll('.option-button-quiz');
        let isCorrect = (selectedOption === correctAnswer);
        let lostLife = false;
        let gifResult;

        buttons.forEach(button => {
            button.disabled = true; 
            if (button.textContent === selectedOption) {
                if (isCorrect) {
                    button.classList.add('correct');
                } else if (selectedOption !== null) {
                    button.classList.add('incorrect');
                }
            }
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });
        
        let currentReactionTime = null;

        if (isCorrect) {
            quizFeedback.textContent = `Resposta Correta! Reação: ${(reactionTime / 1000).toFixed(2)}s 🎉`;
            score++;
            currentScoreDisplay.textContent = score; 
            gifResult = 'correct';
            currentReactionTime = reactionTime;
        } else if (selectedOption === null) {
             quizFeedback.textContent = `Tempo esgotado! A resposta era: ${correctAnswer}. 😔`;
             loseLife();
             lostLife = true;
             gifResult = 'timeout';
             currentReactionTime = reactionTime;
        } else {
            quizFeedback.textContent = `Resposta Incorreta. Era: ${correctAnswer}. Reação: ${(reactionTime / 1000).toFixed(2)}s 😥`;
            loseLife();
            lostLife = true;
            gifResult = 'incorrect';
            currentReactionTime = reactionTime;
        }
        
        questionsAttempted.push({
            question: currentQuizQuestions[currentQuestionIndex].question,
            isCorrect: isCorrect,
            difficulty: questionDifficulty,
            reactionTime: currentReactionTime
        });

        triggerBackgroundTransition(gifResult);
        
        if (lostLife && lives <= 0) {
            return; 
        }

        if (questionsAttempted.length >= MAX_QUESTIONS_PER_QUIZ) {
            quizNextButton.textContent = 'Ver Resultados';
            quizNextButton.classList.add('primary-button');
        } else {
            quizNextButton.textContent = 'Continuar ';
            quizNextButton.classList.remove('primary-button');
        }
        quizNextButton.style.display = 'block';
    }

    // --- FUNÇÕES DE CONTROLE E DISPLAY ---

    function filterCards(themeFilter, searchFilter) {
        const searchValue = searchFilter.toLowerCase().trim();
        cardItems.forEach(card => {
            const cardTheme = card.getAttribute('data-theme');
            const cardName = card.getAttribute('data-name');
            const filterValue = tabsList.querySelector('.tab-button.active')?.getAttribute('data-filter') || 'all'; 
            let matchesTheme = (filterValue === 'all' || cardTheme === filterValue);
            let matchesSearch = (!searchValue || cardName.includes(searchValue));

            if (matchesTheme && matchesSearch) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none'; 
            }
        });
    }

    function openQuizModal() {
        quizModal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
        quizActive = true;
        startQuiz();
    }

    function closeQuizModal() {
        quizModal.classList.remove('active');
        document.body.style.overflow = '';
        quizActive = false;
        stopTimer();
        resetQuiz();
    }
    
    function resetQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        lives = 3;
        currentQuizQuestions = [];
        questionsAttempted = []; 
        currentDifficulty = 1; 
        TIME_PER_QUESTION = ADAPTIVE_CONFIG.EASY.maxTime; 
        quizFeedback.textContent = '';
        quizOptionsContainer.innerHTML = '';
        quizNextButton.style.display = 'none';
        stopTimer();
        // Verifica se ctx existe antes de desenhar o timer
        if (ctx) drawTimer(1); 
        updateLivesDisplay(); 
        activeQuizThemeId = '';
    }
    
    function updateLivesDisplay() {
        const lifeIcons = lifeContainer.querySelectorAll('.life-icon');
        lifeIcons.forEach((icon, index) => {
            if (index < lives) {
                icon.classList.remove('broken', 'fa-heart-crack');
                icon.classList.add('fa-heart');
                icon.style.color = '#8A2BE2';
            } else {
                icon.classList.remove('fa-heart');
                icon.classList.add('fa-heart-crack', 'broken'); 
            }
        });
    }

    function loseLife() {
        lives--;
        updateLivesDisplay();
        
        if (lives <= 0) {
            setTimeout(() => showQuizResults(true), 1000); 
        }
    }

    function triggerBackgroundTransition(result) {
        const fallbackGifs = {
            correct: 'https://via.placeholder.com/1920x1080/4CAF50/FFFFFF?text=ACERTO+PERFEITO!+%28GIF%29',
            incorrect: 'https://via.placeholder.com/1920x1080/D0021B/FFFFFF?text=ERRO+COMETIDO!+%28GIF%29',
            timeout: 'https://via.placeholder.com/1920x1080/FFC107/333333?text=TEMPO+ACABOU!+%28GIF%29',
            default: 'https://via.placeholder.com/1920x1080/f0f2f5/3c4043?text=QUIZ+BACKGROUND+NEUTRO', 
            finish: 'https://via.placeholder.com/1920x1080/8A2BE2/FFFFFF?text=QUIZ+FINALIZADO!+%28GIF%29',
        };
        
        const themeGifs = quizData[activeQuizThemeId]?.gif_urls || fallbackGifs;
        const gifUrl = themeGifs[result] || themeGifs.default;
        
        const newGif = document.createElement('img');
        newGif.src = gifUrl;
        newGif.alt = `${result.toUpperCase()} GIF`;
        
        quizBackgroundGif.innerHTML = '';
        quizBackgroundGif.appendChild(newGif);
        
        quizBackgroundGif.classList.add('active-transition');

        setTimeout(() => {
            quizBackgroundGif.classList.remove('active-transition');
            // Retorna ao GIF padrão do tema
            quizBackgroundGif.innerHTML = `<img src="${themeGifs.default}" alt="Background Neutro">`;
        }, 800);
    }
    
    function showQuizResults(lostByLives = false, finishedByLimit = false) {
        stopTimer();
        quizArea.style.display = 'none';
        quizResultsArea.style.display = 'flex';
        
        triggerBackgroundTransition('finish'); 

        const totalAttempts = questionsAttempted.length; 
        
        if (lostByLives) {
            document.querySelector('#quiz-results-area h2').textContent = 'Fim de Jogo!';
            quizFinalScore.textContent = `Você perdeu todas as vidas! Sua pontuação final foi de ${score} pontos em ${totalAttempts} perguntas.`;
        } else if (finishedByLimit && totalAttempts > 0) {
             document.querySelector('#quiz-results-area h2').textContent = 'Quiz Completo!';
            quizFinalScore.textContent = `Parabéns! Você completou ${totalAttempts} perguntas e acertou ${score}!`;
        } else {
            document.querySelector('#quiz-results-area h2').textContent = 'Quiz Completo!';
            quizFinalScore.textContent = `Você acertou ${score} de ${totalAttempts} perguntas!`;
        }
    }
    
    // --- LÓGICA DO TEMPORIZADOR (Canvas) ---
    function drawTimer(progress) {
        // Verifica se ctx (o contexto do canvas) existe
        if (!ctx) return; 

        ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height); 
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e0e0e0';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
        ctx.lineTo(centerX, centerY); 
        ctx.fillStyle = '#8A2BE2'; 
        ctx.fill();

        ctx.fillStyle = '#202124'; 
        ctx.font = `${timerTextSize}px Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const displayTime = Math.ceil(timeLeft);
        ctx.fillText(displayTime, centerX, centerY);
    }

    function startTimer() {
        stopTimer();
        timeLeft = TIME_PER_QUESTION; 
        // Verifica se ctx existe antes de desenhar
        if (ctx) drawTimer(1); 
        
        const timeLimit = TIME_PER_QUESTION * 1000;
        const endTime = Date.now() + timeLimit;

        function animateTimer() {
            if (!quizActive) {
                stopTimer();
                return;
            }

            const now = Date.now();
            const remainingTime = Math.max(0, endTime - now);
            
            timeLeft = remainingTime / 1000;
            
            const progress = remainingTime / timeLimit; 

            if (ctx) drawTimer(progress);

            if (remainingTime <= 0) {
                stopTimer();
                // Passa 'null' para indicar que foi um timeout
                checkAnswer(null, currentQuizQuestions[currentQuestionIndex].answer, currentQuizQuestions[currentQuestionIndex].difficulty); 
            } else {
                animationFrame = requestAnimationFrame(animateTimer);
            }
        }
        animationFrame = requestAnimationFrame(animateTimer);
    }

    function stopTimer() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }


    // --- EVENT LISTENERS E CHAMADA INICIAL ---
    
    function setupAllEventListeners() {
        // Filtros por Tabs
        if (tabsList) {
            tabsList.addEventListener('click', (event) => {
                const targetButton = event.target.closest('.tab-button');
                if (targetButton) {
                    const filterValue = targetButton.getAttribute('data-filter');
                    tabsList.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                    searchInput.value = '';
                    filterCards(filterValue, '');
                }
            });
        }

        // Filtros por Pesquisa
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                const searchValue = event.target.value.toLowerCase().trim();
                tabsList.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                
                if (searchValue === '' && tabsList.querySelector('[data-filter="all"]')) {
                    tabsList.querySelector('[data-filter="all"]').classList.add('active');
                    filterCards('all', ''); 
                } else {
                    filterCards('all', searchValue); 
                }
            });
        }
        
        // Fechar/Voltar (do Modal)
        if (closeModalButton) closeModalButton.addEventListener('click', closeQuizModal);
        if (backToThemesButton) backToThemesButton.addEventListener('click', closeQuizModal);
        
        // Próxima Pergunta 
        if (quizNextButton) {
            quizNextButton.addEventListener('click', () => {
                if (questionsAttempted.length >= MAX_QUESTIONS_PER_QUIZ) {
                    showQuizResults(false, true); 
                } else {
                    currentQuestionIndex++;
                    loadQuestion(); 
                }
            });
        }

        // Reiniciar Quiz 
        if (restartQuizButton) {
            restartQuizButton.addEventListener('click', () => {
                // Reinicia o quiz com o mesmo tema ativo
                loadQuizQuestions(activeQuizThemeId); 
                startQuiz(); 
            });
        }

        // Tecla ESC para fechar 
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && quizModal && quizModal.classList.contains('active')) {
                closeQuizModal();
            }
        });
    }

    // Chamada de Inicialização
    fetchQuizData();
});
