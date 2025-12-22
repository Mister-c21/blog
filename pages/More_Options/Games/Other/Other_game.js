let currentGameUrl = "";

const feed = document.getElementById('main-feed');
const modal = document.getElementById('modal-play');
const playerView = document.getElementById('player-view');
const gameEngine = document.getElementById('game-engine');
const searchInput = document.getElementById('game-search');

// Iniciar Feed
function init() {
    database.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<img src="${game.img}" alt="${game.t}">`;
        card.onclick = () => openModal(game);
        feed.appendChild(card);
    });
}

// Controle do Modal
function openModal(game) {
    currentGameUrl = game.play;
    document.getElementById('modal-title').innerText = game.t;
    document.getElementById('modal-banner').style.backgroundImage = `url(${game.img})`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    stopEngine();
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Controle do Jogo (Engine)
function startEngine() {
    if (!currentGameUrl) return;
    playerView.style.display = 'block';
    gameEngine.src = currentGameUrl;
}

function stopEngine() {
    playerView.style.display = 'none';
    gameEngine.src = "";
}

// Navegação Home
function goHome() {
    closeModal();
    searchInput.value = '';
    filterGames('');
    window.scrollTo(0, 0);
}

// Busca Reativa
function filterGames(term) {
    document.querySelectorAll('.game-card').forEach(card => {
        const title = card.querySelector('img').alt.toLowerCase();
        card.style.display = title.includes(term.toLowerCase()) ? 'block' : 'none';
    });
}

searchInput.oninput = (e) => filterGames(e.target.value);

// Iniciar aplicação
init();
