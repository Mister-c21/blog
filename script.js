// CONFIGURAÇÕES
const API_KEY = 'aa199db9b7774c639b8f68779ad3fcb9'; // <--- INSIRA SUA CHAVE AQUI
const PAGE_SIZE = 10;

// ESTADO DA APLICAÇÃO
let currentPage = 1;
let currentTopic = 'geek';

// DOM ELEMENTS
const newsContainer = document.getElementById('news-list-container');
const loading = document.getElementById('news-loading');
const loadMoreBtn = document.getElementById('load-more-news');
const searchInput = document.getElementById('main-search-input');
const searchToggle = document.getElementById('search-toggle');

/**
 * BUSCA NOTÍCIAS USANDO PROXY (Essencial para GitHub Pages)
 */
async function fetchNews(topic, page = 1, append = false) {
    loading.style.display = 'block';
    if (!append) newsContainer.innerHTML = '';

    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=pt&pageSize=${PAGE_SIZE}&page=${page}&apiKey=${API_KEY}`;
    
    // Usamos o AllOrigins para contornar o bloqueio de CORS do GitHub Pages
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents); // A resposta real vem em .contents

        if (data.status === "error") throw new Error(data.message);

        displayArticles(data.articles, append);
        
        // Mostrar botão se houver mais páginas
        loadMoreBtn.style.display = data.articles.length >= PAGE_SIZE ? 'block' : 'none';

    } catch (error) {
        console.error("Erro na API:", error);
        newsContainer.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar notícias. Verifique sua chave API.</p>`;
    } finally {
        loading.style.display = 'none';
    }
}

function displayArticles(articles, append) {
    articles.forEach(art => {
        if (!art.title || art.title === "[Removed]") return;

        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-card-image-container">
                <img src="${art.urlToImage || 'https://via.placeholder.com/600x400/222/fff?text=FanWiki'}" alt="">
            </div>
            <div class="news-card-content">
                <p style="color:var(--primary); font-size:11px; font-weight:bold; text-transform:uppercase;">${art.source.name}</p>
                <h3>${art.title}</h3>
                <p>${art.description ? art.description.substring(0, 120) + '...' : 'Clique para ler mais detalhes sobre esta notícia.'}</p>
            </div>
        `;
        card.onclick = () => openModal(art);
        newsContainer.appendChild(card);
    });
}

/**
 * LÓGICA DE BUSCA (PADRÃO: API | TOGGLE: WEB)
 */
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (!query) return;

        if (searchToggle.checked) {
            // MODO WEB (GOOGLE)
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        } else {
            // MODO API (PESQUISA DENTRO DO SITE)
            currentTopic = query;
            currentPage = 1;
            fetchNews(query);
        }
    }
});

/**
 * MODAL
 */
function openModal(art) {
    const modal = document.getElementById('news-modal');
    document.getElementById('modal-title').innerText = art.title;
    document.getElementById('modal-subtitle').innerText = `${art.source.name} • ${new Date(art.publishedAt).toLocaleDateString('pt-BR')}`;
    document.getElementById('modal-image').src = art.urlToImage || '';
    document.getElementById('modal-text').innerHTML = `<p>${art.content || art.description || 'Conteúdo não disponível.'}</p>`;
    document.getElementById('modal-original-link').href = art.url;
    
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

document.getElementById('modal-close-btn').onclick = () => {
    document.getElementById('news-modal').classList.remove('open');
    document.body.style.overflow = 'auto';
};

// FILTROS DE TÓPICOS
document.querySelectorAll('.topic-button').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.topic-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTopic = btn.dataset.topic;
        currentPage = 1;
        fetchNews(currentTopic);
    };
});

// CARREGAR MAIS
loadMoreBtn.onclick = () => {
    currentPage++;
    fetchNews(currentTopic, currentPage, true);
};

// SIDEBAR
document.getElementById('menu-toggle-btn').onclick = () => document.getElementById('sidebar').classList.add('open');
document.getElementById('close-sidebar-btn').onclick = () => document.getElementById('sidebar').classList.remove('open');

// INICIALIZAR
window.onload = () => fetchNews('geek');
