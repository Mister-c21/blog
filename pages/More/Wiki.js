// =================================================================
// 0. IMPORTAÇÃO DOS DADOS
// =================================================================
import { DADOS_DA_WIKI } from './Wiki-dados.js'; 

// =================================================================
// 1. CONFIGURAÇÃO DE DADOS DINÂMICOS
// =================================================================

let data = DADOS_DA_WIKI; 

const contentRowsContainer = document.getElementById('content-rows');
const searchBar = document.getElementById('search-bar');
const modal = document.getElementById('info-modal');
const closeModalBtn = document.querySelector('.close-btn');
const modalBody = document.getElementById('modal-body');

// NOVOS ELEMENTOS DA SIDEBAR
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

// VARIÁVEIS DAS ABAS (REMOVIDAS)
// const navButtons = ... (REMOVIDO)
// let currentFilter = 'all'; (REMOVIDO)

// Mapeamento de Subtemas (MANTIDO)
const SUBTHEMES_MAP = {
    'series': ['Fantasia Épica', 'Terror & Suspense', 'Dramas Policiais Premiados', 'Comédias Sitcom Clássicas', 'Ficção Científica Distópica'],
    'filmes': ['Ficção Científica', 'Comédias Irreverentes', 'Aventura e Família'],
    'jogos': ['RPGs de Ação em Destaque', 'Aventura Narrativa', 'E-Sports','Metroidvania'],
    'musicas': ['Rock Clássico e Grunge', 'Pop Internacional', 'Sertanejo Universitário'],
    'anime': ['Animes Shonen Populares', 'Animes de Fantasia e Magia'], 
    'cartoon': ['Animação para Adultos', 'Desenhos Clássicos da Manhã'] 
};

// =================================================================
// 2. FUNÇÕES DE RENDERIZAÇÃO DOS CARROSSÉIS 
// =================================================================

/**
 * MODIFICADO: Cria o card no estilo "Crunchyroll" (Imagem em cima, Título embaixo)
 */
function createCardHTML(item) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = item.id;
    card.title = item.title;

    // A estrutura HTML interna do card foi alterada
    card.innerHTML = `
        <div class="card-image-container">
            <img src="${item.image}" alt="${item.title}" class="card-image">
        </div>
        <div class="card-info">
            <h3>${item.title}</h3>
        </div>
    `;
    card.addEventListener('click', () => openModal(item));
    return card;
}

function createRowContainer(title, items) {
    const rowContainer = document.createElement('section');
    rowContainer.classList.add('category-row');
    
    rowContainer.innerHTML = `<h2 class="row-title">${title}</h2>`;
    
    const cardsList = document.createElement('div');
    cardsList.classList.add('cards-list');
    
    items.forEach(item => {
        cardsList.appendChild(createCardHTML(item));
    });
    
    rowContainer.appendChild(cardsList);
    return rowContainer;
}

// FUNÇÃO renderThemedRows (REMOVIDA, pois não há mais abas de tema)
// A função renderRowsStandard agora é a única que renderiza

function groupDataByCategory(dataList) {
    const groups = dataList.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});
    
    const categoriesOrder = ['series', 'filmes', 'jogos', 'musicas', 'anime', 'cartoon']; 
    const rows = categoriesOrder.map(category => ({
        title: category.charAt(0).toUpperCase() + category.slice(1), 
        category: category,
        items: groups[category] || []
    }));
    
    return rows.filter(row => row.items.length > 0);
}

/**
 * MODIFICADO: Esta é agora a única função de renderização de linhas
 */
function renderRowsStandard(dataToRender) {
    contentRowsContainer.innerHTML = '';
    
    if (dataToRender.length === 0) {
        contentRowsContainer.innerHTML = '<h2 style="padding: 50px 20px; text-align: center; color: var(--text-muted);">Nenhum item encontrado para sua busca.</h2>';
        return;
    }

    const groupedData = groupDataByCategory(dataToRender);
    
    groupedData.forEach(row => {
        if (row.items.length > 0) {
            // Embaralha e limita em 15 por linha
            const shuffledItems = row.items.sort(() => 0.5 - Math.random()).slice(0, 15);
            contentRowsContainer.appendChild(createRowContainer(row.title + ' em Destaque', shuffledItems));
        }
    });
}

// =================================================================
// 3. LÓGICA DE FILTRO E BUSCA (SIMPLIFICADA)
// =================================================================

/**
 * MODIFICADO: A lógica de 'currentFilter' foi removida.
 * A função agora só filtra pela busca ou mostra tudo.
 */
function applyFiltersAndSearch() {
    if (data.length === 0) {
        contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: red;">Os dados da Wiki estão vazios. Verifique o array DADOS_DA_WIKI no arquivo dados.js.</p>';
        return; 
    }
    
    const searchText = searchBar.value.toLowerCase().trim();
    
    if (searchText.length > 0) {
        // Se há texto na busca, filtra os dados
        const filteredData = data.filter(item => {
            return item.title.toLowerCase().includes(searchText) || 
                   (item.description && item.description.toLowerCase().includes(searchText)) || 
                   item.category.toLowerCase().includes(searchText);
        });
        
        renderRowsStandard(filteredData);
    } else {
        // Se a busca está vazia, mostra todos os dados
        renderRowsStandard(data);
    }
}

// Lógica dos botões de navegação (REMOVIDA)
// navButtons.forEach(...) (REMOVIDO)

// MODIFICADO: Evento de busca simplificado
searchBar.addEventListener('input', () => {
    // A busca agora é a única fonte de filtro
    applyFiltersAndSearch();
});


// =================================================================
// 4. NOVA LÓGICA DA SIDEBAR
// =================================================================

function isDesktop() {
    return window.matchMedia("(min-width: 1025px)").matches;
}

function openSidebar() {
    if (!isDesktop()) {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    if (!isDesktop()) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function setupSidebarEvents() {
    menuToggleBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open') && !isDesktop()) {
            closeSidebar();
        }
    });
    
    // Fecha a sidebar se clicar em um link (ex: botão INÍCIO)
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
             if (!isDesktop()) closeSidebar();
        });
    });
    
    // Lida com redimensionamento da tela
    window.addEventListener('resize', () => {
        if (isDesktop()) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}


// =================================================================
// 5. FUNÇÃO DE CARREGAMENTO DE DADOS (SIMPLIFICADA)
// =================================================================

function checkDataLoad() {
    if (data && data.length > 0) {
        console.log(`Dados carregados via import com sucesso: ${data.length} itens.`);
        return true;
    } else {
        contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: red;">Os dados da Wiki estão vazios. Verifique o array DADOS_DA_WIKI no arquivo dados.js.</p>';
        return false;
    }
}


// =================================================================
// 6. WIKIPEDIA API & COMPONENTES DO MODAL (Sem alterações)
// =================================================================

// ... (Todas as funções do modal: fetchWikipediaArticles, createWikipediaPreviewsHTML, createCastListHTML, createSpotifyPlayerHTML, createRelatedSitesHTML, createTrailerCarrosselHTML, switchMainTrailer, openModal, closeModal, etc. permanecem as mesmas) ...

async function fetchWikipediaArticles(query, limit = 5) {
    const API_URL = 'https://pt.wikipedia.org/w/api.php';
    const params = {
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: limit,
        format: 'json',
        srwhat: 'text', 
        srprop: 'snippet|timestamp', 
        origin: '*' 
    };

    const url = new URL(API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.status}`);
        }
        const data = await response.json();
        
        return data.query && data.query.search ? data.query.search : [];
    } catch (error) {
        console.error('Erro ao buscar artigos da Wikipedia:', error);
        return [];
    }
}

function createWikipediaPreviewsHTML(itemTitle) {
    return `
        <div class="wikipedia-box">
            <h3>Artigos Relacionados (Wikipedia)</h3>
            <div id="wikipedia-previews-container" class="wikipedia-previews-container">
                <p style="padding: 10px; flex-shrink: 0; color: var(--text-muted);">Carregando artigos relacionados a <strong>${itemTitle}</strong>...</p>
            </div>
            <p style="font-size: 0.8em; margin-top: 10px;">Busca por: <strong>${itemTitle}</strong></p>
        </div>
    `;
}

function createCastListHTML(castArray) {
    if (!Array.isArray(castArray) || castArray.length === 0) {
        return '<p>Informação do elenco indisponível.</p>';
    }

    const castItems = castArray.map(member => `
        <div class="cast-member" title="${member.name}">
            <img src="${member.img}" alt="${member.name}" class="cast-photo">
            <span class="cast-name">${member.name.split(' ')[0]}</span>
        </div>
    `).join('');

    return `<div class="cast-list-container">${castItems}</div>`;
}

function createSpotifyPlayerHTML(item) {
    if (!item.spotifyEmbedUrl || item.spotifyEmbedUrl.includes('googleusercontent.com') || item.spotifyEmbedUrl.trim() === '') {
        return ''; 
    }
    
    const iframeSrc = item.spotifyEmbedUrl;

    const iframeHTML = `
        <iframe 
            data-testid="embed-iframe" 
            style="border-radius:12px" 
            src="${iframeSrc}" 
            width="100%" 
            height="352" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            loading="lazy">
        </iframe>
    `;

    return `
        <div class="spotify-section">
            <h3>Trilha Sonora Oficial (Embed)</h3>
            <div class="spotify-player-container">
                ${iframeHTML}
            </div>
        </div>
    `;
}

function createRelatedSitesHTML(sitesArray) {
    if (!sitesArray || sitesArray.length === 0) {
        return '';
    }

    const sitesListHTML = sitesArray.map(site => `
        <a href="${site.url}" target="_blank" class="site-link-item" title="Acessar ${site.name}">
            <i class="fas fa-link"></i> 
            <div class="site-info">
                <strong>${site.name}</strong>
                <span>Tipo: ${site.type}</span>
            </div>
            <i class="fas fa-chevron-right"></i>
        </a>
    `).join('');

    return `
        <div class="related-sites-section">
            <h4>Sites e Referências Relacionadas</h4>
            <div>
                ${sitesListHTML}
            </div>
        </div>
    `;
}

function createTrailerCarrosselHTML(trailers) {
    if (!trailers || trailers.length === 0) {
        return '<div><h3 class="trailer-title">Trailer Oficial</h3><p>Trailer indisponível.</p></div>';
    }

    const defaultTrailerUrl = trailers[0].url;
    
    const thumbnailsHTML = trailers.map((trailer, index) => {
        const videoIdMatch = trailer.url.match(/youtube\.com\/embed\/([^?]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) return ''; 

        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; 
        
        return `
            <div 
                class="trailer-thumbnail-item ${index === 0 ? 'active' : ''}" 
                data-trailer-url="${trailer.url}"
                title="${trailer.title}"
            >
                <img src="${thumbnailUrl}" alt="Miniatura: ${trailer.title}">
                <div class="thumbnail-overlay">
                    <i class="fas fa-play"></i>
                    <span>${trailer.title}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <h3 class="trailer-title">Trailers e Clipes</h3>
        
        <div class="trailer-container">
            <iframe 
                id="main-trailer-player"
                src="${defaultTrailerUrl}?rel=0&autoplay=0&mute=0" 
                title="${trailers[0].title}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
        
        <div class="trailer-thumbnails-list">
            ${thumbnailsHTML}
        </div>
    `;
}

function switchMainTrailer(url, title) {
    const player = document.getElementById('main-trailer-player');
    
    if (player) {
        player.src = `${url}?rel=0&autoplay=0&mute=0`; 
        player.title = title;
    }
}


function openModal(item) {
    
    modalBody.innerHTML = `
        <div class="modal-header-info">
            <h2 class="modal-title">${item.title}</h2>
            <span class="modal-category-tag">${item.category.toUpperCase()}</span>
        </div>

        <div class="modal-flex-content">
            <div class="modal-sidebar">
                <img src="${item.image}" alt="${item.title}" class="modal-cover-image"> 
                
                ${createWikipediaPreviewsHTML(item.title)}

                ${createRelatedSitesHTML(item.relatedSites)}
            </div>

            <div class="modal-main-content">
                
                <h3>Sinopse Oficial</h3>
                <p>${item.description || 'Sinopse indisponível.'}</p>

                ${createSpotifyPlayerHTML(item)}

                <h3 class="cast-title">Elenco Principal</h3>
                ${createCastListHTML(item.cast)} 
                
                ${createTrailerCarrosselHTML(item.trailers)}
                
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    
    const previewsContainer = document.getElementById('wikipedia-previews-container');

    fetchWikipediaArticles(item.title).then(results => {
        
        previewsContainer.innerHTML = ''; 

        if (results.length === 0) {
            previewsContainer.innerHTML = `<p style="padding: 10px; flex-shrink: 0; color: var(--text-muted);">Nenhum artigo encontrado para "${item.title}".</p>`;
            return;
        }

        results.forEach(article => {
            const snippetClean = article.snippet.replace(/<[^>]*>?/gm, ''); 
            const articleUrl = `https://pt.wikipedia.org/wiki/${encodeURIComponent(article.title)}`;
            
            const previewItem = document.createElement('div');
            previewItem.classList.add('wikipedia-preview-item');
            
            previewItem.innerHTML = `
                <div class="wikipedia-preview-header" title="${article.title}">
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${article.title}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="wikipedia-preview-content">
                    <p>${snippetClean}...</p>
                    <a href="${articleUrl}" target="_blank">Ler artigo completo <i class="fas fa-external-link-alt"></i></a>
                </div>
            `;
            
            previewsContainer.appendChild(previewItem);
        });

        document.querySelectorAll('.wikipedia-preview-item').forEach(itemToggle => {
            itemToggle.addEventListener('click', () => {
                document.querySelectorAll('.wikipedia-preview-item').forEach(otherItem => {
                    if (otherItem !== itemToggle && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                itemToggle.classList.toggle('active');
            });
        });

    });

    document.querySelectorAll('.trailer-thumbnail-item').forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const url = this.dataset.trailerUrl;
            const title = this.title;
            
            switchMainTrailer(url, title);
            
            document.querySelectorAll('.trailer-thumbnail-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
}


function closeModal() {
    const trailerPlayer = document.getElementById('main-trailer-player');
    if (trailerPlayer) {
        trailerPlayer.src = ''; 
    }

    modalBody.innerHTML = ''; 
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
}

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});


// =================================================================
// 7. INICIALIZAÇÃO 
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configura os eventos da nova sidebar
    setupSidebarEvents();
    
    // 2. Verifica se há dados para renderizar
    const dataIsReady = checkDataLoad();
    
    // 3. Renderiza o conteúdo (agora sem filtro inicial)
    if (dataIsReady) {
        applyFiltersAndSearch();
    }
});
