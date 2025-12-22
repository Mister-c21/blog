let currentGameUrl = "";

// Elementos do DOM
const feed = document.getElementById('main-feed');
const modal = document.getElementById('modal-play');
const playerView = document.getElementById('player-view');
const gameEngine = document.getElementById('game-engine');
const searchInput = document.getElementById('game-search');

/**
 * Inicializa o Feed de Cards
 */
function initFeed() {
    database.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<img src="${game.img}" alt="${game.t}">`;
        card.onclick = () => openModal(game);
        feed.appendChild(card);
    });
}

/**
 * Navegação para 3 níveis acima conforme solicitado
 */
function goToMoreOptions() {
    window.location.href = "../../../More_options.html";
}

/**
 * Controle do Modal
 */
function openModal(game) {
    currentGameUrl = game.play;
    document.getElementById('modal-title').innerText = game.t;
    document.getElementById('modal-banner').style.backgroundImage = `url(${game.img})`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Impede scroll do fundo
}

function closeModal() {
    stopEngine();
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Controle do Player (Iframe)
 */
function startEngine() {
    if (!currentGameUrl) return;
    playerView.style.display = 'block';
    gameEngine.src = currentGameUrl;
}

function stopEngine() {
    playerView.style.display = 'none';
    gameEngine.src = "";
}

/**
 * Filtro de Busca
 */
searchInput.oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        const imgAlt = card.querySelector('img').alt.toLowerCase();
        card.style.display = imgAlt.includes(term) ? 'block' : 'none';
    });
};

// Start
initFeed();
