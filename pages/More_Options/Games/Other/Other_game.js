let currentGameUrl = "";

// Seleção de Elementos
const feed = document.getElementById('main-feed');
const modal = document.getElementById('modal-play');
const playerView = document.getElementById('player-view');
const gameEngine = document.getElementById('game-engine');
const searchInput = document.getElementById('game-search');

/**
 * Cria os cards do feed baseado no ficheiro data.js
 */
function renderFeed() {
    database.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<img src="${game.img}" alt="${game.t}">`;
        card.onclick = () => openModal(game);
        feed.appendChild(card);
    });
}

/**
 * Abre o Modal Estilo Netflix
 */
function openModal(game) {
    currentGameUrl = game.play;
    document.getElementById('modal-title').innerText = game.t;
    document.getElementById('modal-banner').style.backgroundImage = `url(${game.img})`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Trava o scroll da página
}

/**
 * Fecha o Modal e limpa o player
 */
function closeModal() {
    stopEngine();
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Inicia o Iframe do Jogo
 */
function startEngine() {
    if (!currentGameUrl) return;
    playerView.style.display = 'block';
    gameEngine.src = currentGameUrl;
}

/**
 * Remove o jogo do Iframe
 */
function stopEngine() {
    playerView.style.display = 'none';
    gameEngine.src = "";
}

/**
 * Filtro de Pesquisa em Tempo Real
 */
searchInput.oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        const title = card.querySelector('img').alt.toLowerCase();
        card.style.display = title.includes(term) ? 'block' : 'none';
    });
};

// Inicializa o sistema
renderFeed();
