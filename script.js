//========================================================================
// VARIÁVEIS DE CONFIGURAÇÃO E API
//========================================================================

// INSIRA SUA CHAVE AQUI (Obtenha em newsapi.org)
const NEWS_API_KEY = 'aa199db9b7774c639b8f68779ad3fcb9'; 
const BASE_URL = 'https://newsapi.org/v2/everything';

// Elementos DOM
const newsListContainer = document.getElementById('news-list-container'); 
const newsLoadingIndicator = document.getElementById('news-loading');
const mainSearchInput = document.getElementById('main-search-input'); 
const loadMoreButton = document.getElementById('load-more-news'); 
const tabButtons = document.querySelectorAll('.tab-button');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const searchToggle = document.getElementById('search-toggle');
const searchModeIcon = document.getElementById('search-mode-icon');

// Elementos do Modal
const newsModal = document.getElementById('news-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalImage = document.getElementById('modal-image');
const modalText = document.getElementById('modal-text');
const modalOriginalLink = document.getElementById('modal-original-link'); 

// VARIÁVEIS GLOBAIS DE ESTADO
let globalArticles = []; 
let currentPage = 1;
let currentTopic = 'all';
const PAGE_SIZE = 12;

//========================================================================
// LÓGICA DE BUSCA NA NEWSAPI
//========================================================================

/**
 * Busca notícias reais da NewsAPI
 */
async function fetchNewsFromAPI(topic, page = 1, isSearch = false) {
    // Mapeamento de tópicos para termos de busca em português/inglês para melhores resultados
    const queries = {
        all: 'cultura geek OR cinema OR games',
        movies: 'filmes OR cinema OR hollywood',
        series: 'séries de tv OR netflix OR hbo',
        relationship: 'comportamento OR relacionamentos',
        work: 'carreira OR tecnologia OR produtividade'
    };

    const query = isSearch ? topic : (queries[topic] || topic);
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&pageSize=${PAGE_SIZE}&page=${page}&language=pt&apiKey=${NEWS_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "error") {
            throw new Error(data.message);
        }
        
        return data.articles.map(art => ({
            title: art.title,
            excerpt: art.description || "Sem descrição disponível.",
            content: art.content || art.description,
            source: art.source.name,
            imageUrl: art.urlToImage || 'https://via.placeholder.com/800x450?text=Sem+Imagem',
            url: art.url,
            category: topic,
            publishedAt: art.publishedAt
        }));
    } catch (error) {
        console.error("Erro ao buscar notícias:", error);
        return [];
    }
}

/**
 * Renderiza os cards no HTML
 */
function renderNewsCards(articles, clear = true) {
    if (clear) newsListContainer.innerHTML = '';

    if (articles.length === 0 && clear) {
        newsListContainer.innerHTML = `<p style="text-align:center; padding:20px;">Nenhuma notícia encontrada.</p>`;
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('article');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-card-image-container">
                <img src="${article.imageUrl}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200'">
            </div>
            <div class="news-card-content">
                <h3>${article.title}</h3>
                <p style="font-size: 0.8em; color: var(--text-color-muted);">
                    <i class="fas fa-clock"></i> ${new Date(article.publishedAt).toLocaleDateString('pt-BR')} | <strong>${article.source}</strong>
                </p>
                <p>${article.excerpt.substring(0, 120)}...</p>
                <a href="#" class="read-more-link">Continuar lendo &rarr;</a>
            </div>
        `;

        card.addEventListener('click', () => openModal(article));
        newsListContainer.appendChild(card);
    });
}

/**
 * Abre o modal com detalhes da API
 */
function openModal(article) {
    modalTitle.textContent = article.title;
    modalSubtitle.innerHTML = `<i class="fas fa-globe"></i> Fonte: ${article.source} | ${new Date(article.publishedAt).toLocaleDateString('pt-BR')}`;
    modalImage.src = article.imageUrl;
    
    // A NewsAPI na conta gratuita limita o 'content'. Usamos o description + link original.
    modalText.innerHTML = `
        <p>${article.content || article.excerpt}</p>
        <p><i>Nota: Para ler a matéria completa, acesse o link da fonte original abaixo.</i></p>
    `;
    
    modalOriginalLink.href = article.url;
    modalOriginalLink.textContent = "Ler notícia completa no site original →";

    newsModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

//========================================================================
// EVENTOS E INICIALIZAÇÃO
//========================================================================

async function loadInitialNews(topic) {
    currentTopic = topic;
    currentPage = 1;
    newsLoadingIndicator.style.display = 'block';
    loadMoreButton.style.display = 'none';

    const articles = await fetchNewsFromAPI(topic, currentPage);
    globalArticles = articles;
    
    renderNewsCards(articles, true);
    newsLoadingIndicator.style.display = 'none';
    loadMoreButton.style.display = articles.length >= PAGE_SIZE ? 'block' : 'none';
}

loadMoreButton.addEventListener('click', async () => {
    currentPage++;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Carregando...";
    
    const newArticles = await fetchNewsFromAPI(currentTopic, currentPage);
    if (newArticles.length > 0) {
        globalArticles.push(...newArticles);
        renderNewsCards(newArticles, false);
    }
    
    loadMoreButton.disabled = false;
    loadMoreButton.innerHTML = `Carregar Mais Notícias <i class="fas fa-chevron-down"></i>`;
    if (newArticles.length < PAGE_SIZE) loadMoreButton.style.display = 'none';
});

// Filtros de Tópico
document.querySelectorAll('.topic-button').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.topic-button').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        loadInitialNews(e.currentTarget.getAttribute('data-topic'));
    });
});

// Busca Local / Google
function setupSearch() {
    mainSearchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const term = mainSearchInput.value.trim();
            if (!term) return;

            if (searchToggle.checked) {
                window.open(`https://news.google.com/search?q=${encodeURIComponent(term)}&hl=pt-BR`, '_blank');
            } else {
                newsLoadingIndicator.style.display = 'block';
                const results = await fetchNewsFromAPI(term, 1, true);
                renderNewsCards(results, true);
                newsLoadingIndicator.style.display = 'none';
                loadMoreButton.style.display = 'none';
            }
        }
    });
}

// Fechar Modal
modalCloseBtn.addEventListener('click', () => {
    newsModal.classList.remove('open');
    document.body.style.overflow = 'auto';
});

// Menu Lateral
document.getElementById('menu-toggle-btn').addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.style.display = 'block';
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
});

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadInitialNews('all');
    setupSearch();
});
