// functions.js

// =================================================================
// 1. VARIÁVEIS DE ESTADO E ELEMENTOS (Carregados após o DOM)
// =================================================================
let currentContentData = {};
let allRenderedCards = []; 

// Referências DOM (serão inicializadas em DOMContentLoaded)
let modal;
let searchBar;
let filmesList;
let seriesList;
let livrosAnimesList;

// Funções de inicialização do DOM
function setupDOMReferences() {
    // Referências principais
    modal = document.getElementById('contentModal');
    searchBar = document.getElementById('search-bar');
    filmesList = document.getElementById('filmesList');
    seriesList = document.getElementById('seriesList');
    livrosAnimesList = document.getElementById('livrosAnimesList');
    
    // Referências para o Modal (tornadas globais para acesso via HTML onClick)
    window.modalTitle = document.getElementById('modalTitle');
    window.modalContentDetails = document.getElementById('modalContentDetails');
    window.modalDescription = document.getElementById('modalDescription');
    window.modalHeader = document.getElementById('modalHeader');
    window.spotifyPlayerContainer = document.getElementById('spotifyPlayerContainer');
    window.spotifyIframe = document.getElementById('spotifyIframe');
    window.searchEngineMenu = document.getElementById('searchEngineMenu');
    window.relatedContentArea = document.getElementById('relatedContentArea');

    // Configuração dos Listeners Globais
    searchBar.addEventListener('input', filterCards);
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
        if (event.target == window.spotifyPlayerContainer) {
            closeSpotifyPlayer();
        }
    };
    window.addEventListener('resize', handleResize);
    
    // Inicia a renderização
    renderContent();
}

// =================================================================
// 2. FUNÇÕES DE GERAÇÃO DINÂMICA
// =================================================================

/**
 * Cria o HTML de um único card com base nos dados.
 */
function createCardElement(item) {
    const card = document.createElement('div');
    card.className = `card ${item.aspectRatio === 'vertical' ? 'vertical' : ''}`;
    // Passa o ID para a função openModal
    card.onclick = () => openModal(item.id); 
    card.setAttribute('data-title', item.title.toLowerCase()); 
    
    card.innerHTML = `
        <div class="card-image-container">
            <img class="card-image" src="${item.cardImage}" alt="Pôster de ${item.title}">
        </div>
        <div class="card-info">
            <h3>${item.title}</h3>
            <span class="card-details">${item.details}</span>
        </div>
    `;
    return card;
}

/**
 * Renderiza todos os cards agrupados por categoria (chamada no carregamento).
 */
function renderContent() {
    allRenderedCards = []; 
    filmesList.innerHTML = '';
    seriesList.innerHTML = '';
    livrosAnimesList.innerHTML = '';

    // Verifica se a variável global contentData (carregada de data.js) existe
    if (typeof contentData === 'undefined' || !Array.isArray(contentData)) {
        console.error("Erro: contentData não está definido ou não é um array. Verifique se data.js foi carregado corretamente.");
        return;
    }

    contentData.forEach(item => {
        const card = createCardElement(item);
        allRenderedCards.push(card); 
        
        const category = item.details.toLowerCase();
        
        // Lógica de agrupamento por tipo (baseada nos detalhes)
        if (category.includes('filme') || category.includes('podcast')) {
            filmesList.appendChild(card);
        } else if (category.includes('série')) {
            seriesList.appendChild(card);
        } else if (category.includes('livro') || category.includes('manga') || category.includes('anime') || category.includes('audiolivro')) {
            livrosAnimesList.appendChild(card);
        }
    });
}

// =================================================================
// 3. FUNÇÕES DE MODAL E INTERAÇÃO
// =================================================================

/**
 * Abre o modal de detalhes e carrega os dados do conteúdo.
 * @param {number} contentId - O ID único do conteúdo.
 */
function openModal(contentId) {
    const item = contentData.find(d => d.id === contentId);
    if (!item) return;

    currentContentData = item; // Salva o objeto completo no estado global

    window.hideSearchEngineMenu(); 

    window.modalTitle.textContent = item.title;
    window.modalContentDetails.textContent = item.details;
    window.modalDescription.textContent = item.description;
    window.modalHeader.style.backgroundImage = `url('${item.headerImage}')`;

    modal.style.display = 'block';
    document.body.classList.add('no-scroll');
}

/** Fechar o modal completamente */
window.closeModal = function() { // Tornada global para acesso via HTML
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    window.closeSpotifyPlayer(); 
}

// =================================================================
// 4. FUNÇÕES DE PLAYER SPOTIFY (Tornadas globais para o HTML)
// =================================================================

/**
 * Abre o modal de player do Spotify e renderiza o conteúdo.
 */
window.showSpotifyPlayer = function() {
    if (currentContentData.spotifyEmbedUrl) {
        // Adiciona '?utm_source=generator' se não existir (Boa prática do Spotify)
        let url = currentContentData.spotifyEmbedUrl;
        if (!url.includes('utm_source')) {
            url += url.includes('?') ? '&utm_source=generator' : '?utm_source=generator';
        }
        window.spotifyIframe.src = url;
        window.spotifyPlayerContainer.style.display = 'flex';
        document.body.classList.add('no-scroll');
        modal.style.display = 'none'; 
    } else {
        alert("URL de incorporação do Spotify não encontrada para este conteúdo.");
    }
}

/**
 * Fechas o modal de player do Spotify.
 */
window.closeSpotifyPlayer = function() {
    window.spotifyPlayerContainer.style.display = 'none';
    document.body.classList.remove('no-scroll');
    window.spotifyIframe.src = ''; // Para a reprodução
}

// =================================================================
// 5. FUNÇÕES DO MENU DE SELEÇÃO DE BUSCA (Tornadas globais)
// =================================================================

/** Limpa o título para uso em URLs (remove subtítulos entre parênteses) */
function getCleanTitle() {
    if (!currentContentData.title) return '';
    // Remove qualquer texto entre parênteses (ex: (Podcast))
    return currentContentData.title.replace(/\s*\([^)]+\)\s*/g, '').trim(); 
}

/** Exibe o menu de seleção de motores de busca e oculta o conteúdo relacionado. */
window.showSearchEngineMenu = function() {
    window.relatedContentArea.style.display = 'none';
    window.searchEngineMenu.style.display = 'block';
}

/** Oculta o menu de seleção de motores de busca e exibe o conteúdo relacionado. */
window.hideSearchEngineMenu = function() {
    window.searchEngineMenu.style.display = 'none';
    window.relatedContentArea.style.display = 'flex'; // Usar flex para os cards relacionados
}

/** Redireciona para a busca no YouTube usando "resumo + título da obra". */
window.redirectToYouTube = function() {
    const title = getCleanTitle() || ''; 
    const searchTerm = `resumo ${title}`.trim(); // <-- ALTERADO PARA 'RESUMO'
    
    const encodedSearchTerm = encodeURIComponent(searchTerm).replace(/%20/g, '+');
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedSearchTerm}`;
    
    window.open(youtubeSearchUrl, '_blank');
    closeModal(); 
}

/** Redireciona para a busca na Web usando o motor selecionado. */
window.redirectToWebSearch = function(engine) {
    const cleanTitle = getCleanTitle();
    if (!cleanTitle) {
        alert("Título não encontrado para realizar a busca.");
        return;
    }
    
    const encodedSearchTerm = encodeURIComponent(cleanTitle).replace(/%20/g, '+');
    let searchUrl = '';

    switch (engine) {
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodedSearchTerm}`;
            break;
        case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodedSearchTerm}`;
            break;
        case 'naver':
            searchUrl = `https://search.naver.com/search.naver?query=${encodedSearchTerm}`;
            break;
        case 'yahoo':
            searchUrl = `https://search.yahoo.com/search?p=${encodedSearchTerm}`;
            break;
        case 'baidu':
            searchUrl = `https://www.baidu.com/s?wd=${encodedSearchTerm}`;
            break;
        case 'perplexity':
            searchUrl = `https://www.perplexity.ai/search?q=${encodedSearchTerm}`;
            break;
        default:
            alert("Motor de busca não reconhecido.");
            return;
    }
    
    window.open(searchUrl, '_blank');
    closeModal(); 
}

/** Redireciona para a busca na Wikipedia (Artigo Completo) */
window.redirectToWikipedia = function() {
    const cleanTitle = getCleanTitle();
    const encodedSearchTerm = encodeURIComponent(cleanTitle).replace(/%20/g, '+');
    const wikipediaSearchUrl = `https://pt.wikipedia.org/w/index.php?search=${encodedSearchTerm}`;
    
    window.open(wikipediaSearchUrl, '_blank');
    closeModal(); 
}

// =================================================================
// 6. FUNÇÕES DE NAVEGAÇÃO E FILTRO (Tornadas globais)
// =================================================================

/**
 * Filtra os cards exibidos com base no texto digitado na barra de busca.
 */
function filterCards() {
    const searchTerm = searchBar.value.trim().toLowerCase();

    // Mostra todos os títulos de seção no início da filtragem
    document.querySelectorAll('.row-title').forEach(title => {
        title.style.display = 'block'; 
    });

    // Itera sobre o array de cards renderizados
    allRenderedCards.forEach(card => {
        const cardTitle = card.getAttribute('data-title');
        const isMatch = cardTitle.includes(searchTerm);

        // Oculta ou exibe o card. Se o termo estiver vazio, exibe todos.
        card.style.display = (isMatch || searchTerm === '') ? 'flex' : 'none';
    });
    
    // Esconder listas e títulos que não têm cards visíveis
    document.querySelectorAll('.cards-list').forEach(list => {
        const visibleCards = Array.from(list.children).filter(card => card.style.display !== 'none');
        
        // Lógica para esconder o título da seção se a lista estiver vazia
        let titleElement = list.previousElementSibling;
        if (titleElement && titleElement.classList.contains('row-title')) {
            titleElement.style.display = (visibleCards.length > 0) ? 'block' : 'none';
        }
        
        // Se a busca não for vazia e não houver cards, esconde a lista
        list.style.display = (visibleCards.length > 0 || searchTerm === '') ? 'flex' : 'none';
    });
}

/** Alterna a abertura e fechamento da Sidebar */
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');

    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open') || window.innerWidth < 1025) {
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
        document.body.classList.toggle('no-scroll', sidebar.classList.contains('open'));
    }
}

/** Lida com o redimensionamento da janela (Responsividade da Sidebar) */
function handleResize() {
    if (window.innerWidth >= 1025) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.overlay');
        
        // Remove classes de tela pequena se a tela for grande
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    }
}

// =================================================================
// 7. INICIALIZAÇÃO
// =================================================================

// Garante que o script só execute após o HTML e o data.js serem carregados
document.addEventListener('DOMContentLoaded', setupDOMReferences);
