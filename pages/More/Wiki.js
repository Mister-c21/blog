// =================================================================
// 1. CONFIGURAÇÃO DE DADOS DINÂMICOS (ATUALIZADA)
// =================================================================

// ✅ ALTERADO: O caminho aponta agora para um arquivo local na mesma pasta.
const DATA_SOURCE_URL = 'Wiki.json'; 

// A variável 'data' agora é declarada com 'let' e será preenchida via fetch.
let data = []; 

const contentRowsContainer = document.getElementById('content-rows');
const navButtons = document.querySelectorAll('.nav-btn');
const searchBar = document.getElementById('search-bar');
const modal = document.getElementById('info-modal');
const closeModalBtn = document.querySelector('.close-btn');
const modalBody = document.getElementById('modal-body');

let currentFilter = 'all';

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

function createCardHTML(item) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = item.id;
    card.title = item.title;

    card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="card-image">
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

function renderThemedRows(category, dataList) {
    contentRowsContainer.innerHTML = '';
    
    const categoryData = dataList.filter(item => item.category === category);
    const subthemes = SUBTHEMES_MAP[category] || [];
    
    if (subthemes.length === 0) {
        contentRowsContainer.innerHTML = `<p style="padding: 50px; text-align: center; color: var(--text-dark);">Nenhum subtema definido para ${category.toUpperCase()}.</p>`;
        return;
    }
    
    subthemes.forEach((subthemeTitle) => {
        let itemsForCarousel = categoryData.filter(item => item.subtheme === subthemeTitle);
        
        if (itemsForCarousel.length >= 3) {
            const shuffledItems = itemsForCarousel.sort(() => 0.5 - Math.random()).slice(0, 10); 
            const rowContainer = createRowContainer(subthemeTitle, shuffledItems);
            contentRowsContainer.appendChild(rowContainer);
        } else if (itemsForCarousel.length > 0) {
            const rowContainer = createRowContainer(subthemeTitle + ' (Destaques)', itemsForCarousel);
            contentRowsContainer.appendChild(rowContainer);
        }
    });
}

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

function renderRowsStandard(dataToRender) {
    contentRowsContainer.innerHTML = '';
    
    if (dataToRender.length === 0) {
        contentRowsContainer.innerHTML = '<p style="padding: 50px; text-align: center; color: var(--text-dark);">Nenhum item encontrado.</p>';
        return;
    }

    const groupedData = groupDataByCategory(dataToRender);
    
    groupedData.forEach(row => {
        if (row.items.length > 0) {
            const shuffledItems = row.items.sort(() => 0.5 - Math.random());
            contentRowsContainer.appendChild(createRowContainer(row.title + ' em Destaque', shuffledItems));
        }
    });
}

// =================================================================
// 3. LÓGICA DE FILTRO E BUSCA PRINCIPAL 
// =================================================================

function applyFiltersAndSearch() {
    // Garante que 'data' foi carregado antes de tentar filtrar
    if (data.length === 0) {
        // Se a busca falhou ou está vazia, sai da função. A mensagem de erro já deve estar na tela.
        return; 
    }
    
    const searchText = searchBar.value.toLowerCase().trim();
    
    if (searchText.length > 0) {
        const filteredData = data.filter(item => {
            return item.title.toLowerCase().includes(searchText) || 
                   item.description.toLowerCase().includes(searchText) ||
                   item.category.toLowerCase().includes(searchText);
        });
        
        renderRowsStandard(filteredData);
        return;
    }

    if (currentFilter === 'all') {
        renderRowsStandard(data);
    } else {
        renderThemedRows(currentFilter, data);
    }
}

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.category;
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        searchBar.value = ''; 
        applyFiltersAndSearch();
    });
});

searchBar.addEventListener('input', () => {
    const homeButton = document.querySelector('.nav-btn[data-category="all"]');
    navButtons.forEach(btn => btn.classList.remove('active'));
    homeButton.classList.add('active');
    currentFilter = 'all'; 
    applyFiltersAndSearch();
});


// =================================================================
// 4. FUNÇÃO DE CARREGAMENTO DE DADOS (ATUALIZADA)
// =================================================================
async function loadData() {
    try {
        console.log("Tentando carregar dados do arquivo local (Wiki.json)...");
        // Exibe uma mensagem de carregamento enquanto aguarda a resposta
        contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: var(--text-dark);">Carregando dados...</p>';
        
        const response = await fetch(DATA_SOURCE_URL);
        
        if (!response.ok) {
            // Se o status HTTP não for 200-299, lança um erro
            throw new Error(`Erro de rede ao carregar dados: ${response.status} ${response.statusText}. Certifique-se de que o arquivo "Wiki.json" existe.`);
        }
        
        const fetchedData = await response.json();
        
        // Popula a variável global 'data' com os dados
        data = fetchedData; 
        console.log(`Dados carregados com sucesso: ${data.length} itens.`);
        
    } catch (error) {
        console.error("Erro ao carregar dados. Nenhuma informação será exibida.", error);
        contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: red;">Não foi possível carregar os dados. Verifique se o arquivo **Wiki.json** está na mesma pasta e se seu navegador permite requisições locais (usando um Live Server).</p>';
        // Limpa 'data' em caso de falha para evitar erros de renderização com dados incompletos.
        data = []; 
    }
}


// =================================================================
// 5. WIKIPEDIA API & COMPONENTES DO MODAL (MANTIDO)
// =================================================================

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
                <p style="padding: 10px; flex-shrink: 0; color: var(--text-dark);">Carregando artigos relacionados a <strong>${itemTitle}</strong>...</p>
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
    if (!item.spotifyEmbedUrl || item.spotifyEmbedUrl.includes('googleusercontent.com')) {
        // Se a URL ainda for um placeholder ou estiver faltando.
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
        const videoId = trailer.url.split('/').pop().split('?')[0]; 
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
        // Pausa e reseta a reprodução ao trocar a fonte
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
                <p>${item.description}</p>

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
            previewsContainer.innerHTML = `<p style="padding: 10px; flex-shrink: 0; color: var(--text-dark);">Nenhum artigo encontrado para "${item.title}".</p>`;
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
        // Para o vídeo ao fechar o modal
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
// 6. INICIALIZAÇÃO ASSÍNCRONA (ATUALIZADA)
// =================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega os dados do arquivo local
    await loadData();
    
    // 2. Renderiza o conteúdo APÓS o carregamento dos dados
    applyFiltersAndSearch();
});
