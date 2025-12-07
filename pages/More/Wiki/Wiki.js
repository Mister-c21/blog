// =================================================================
// 0. IMPORTAÇÃO DOS DADOS
// ⚠️ IMPORTANTE: Certifique-se que o 'Wiki-dados.js' existe
// na mesma pasta que este arquivo.
// =================================================================
import { DADOS_DA_WIKI } from './Wiki-dados.js'; 

// =================================================================
// INICIALIZAÇÃO E CONFIGURAÇÃO
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // ------------------------------------
    // 1. CONFIGURAÇÃO DE DADOS E ELEMENTOS DOM
    // ------------------------------------
    let data = DADOS_DA_WIKI; 

    // Conteúdo principal
    const contentRowsContainer = document.getElementById('content-rows');
    
    // Busca e Toggle
    const searchBar = document.getElementById('search-bar');
    const searchContainer = document.getElementById('search-bar-container');
    const searchToggle = document.getElementById('search-toggle'); 
    
    // Modal
    const modal = document.getElementById('info-modal');
    // Verifica se o modal existe antes de tentar selecionar o botão de fechar
    const closeModalBtn = modal ? document.querySelector('.modal-content .close-btn') : null;
    const modalBody = document.getElementById('modal-body');

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    
    // Verificação de segurança
    if (!sidebar || !overlay || !menuToggleBtn || !closeSidebarBtn || !searchBar || !searchToggle) {
        console.error("ERRO: Um ou mais elementos essenciais do DOM não foram encontrados. Verifique os IDs no seu Index.html.");
    }
    
    // ------------------------------------
    // 2. FUNÇÕES AUXILIARES GERAIS
    // ------------------------------------
    function isDesktop() {
        return window.matchMedia("(min-width: 1025px)").matches;
    }
    
    /**
     * Alterna o estado da Sidebar (abrir/fechar).
     */
    function toggleSidebar() {
        if (!isDesktop()) {
            const isOpen = sidebar.classList.contains('open');
            if (isOpen) {
                sidebar.classList.remove('open');
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                sidebar.classList.add('open');
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }
    }
    
    // ------------------------------------
    // 3. FUNÇÕES DE RENDERIZAÇÃO DOS CARROSSÉIS 
    // ------------------------------------
    function createCardHTML(item) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = item.id;
        card.title = item.title;

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${item.image}" alt="${item.title}" class="card-image">
            </div>
            <div class="card-info">
                <h3>${item.title}</h3>
            </div>
        `;
        // Adiciona o evento para abrir o modal
        card.addEventListener('click', () => openModal(item)); 
        return card;
    }

    function createRowContainer(title, items) {
        const rowContainer = document.createElement('section');
        rowContainer.classList.add('category-row');
        rowContainer.innerHTML = `<h2 class="row-title">${title}</h2>`;
        
        const cardsList = document.createElement('div');
        cardsList.classList.add('cards-list');
        
        items.forEach(item => cardsList.appendChild(createCardHTML(item)));
        
        rowContainer.appendChild(cardsList);
        return rowContainer;
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
            contentRowsContainer.innerHTML = '<h2 style="padding: 50px 20px; text-align: center; color: var(--text-muted);">Nenhum item encontrado.</h2>';
            return;
        }

        const groupedData = groupDataByCategory(dataToRender);
        
        groupedData.forEach(row => {
            if (row.items.length > 0) {
                // Embaralha e limita em 15 por linha (para simular "destaques")
                const shuffledItems = row.items.sort(() => 0.5 - Math.random()).slice(0, 15);
                contentRowsContainer.appendChild(createRowContainer(row.title + ' em Destaque', shuffledItems));
            }
        });
    }


    // ------------------------------------
    // 4. LÓGICA DE BUSCA E TOGGLE FANDOM
    // ------------------------------------

    /**
     * Filtra os dados locais com base no texto de busca.
     * Ignora se o modo Fandom estiver ativo.
     */
    function applyFiltersAndSearch() {
        if (data.length === 0) return;
        
        // Se o modo Fandom (checked) está ativo, não faz a busca local.
        if (searchToggle.checked) return; 

        const searchText = searchBar.value.toLowerCase().trim();
        
        if (searchText.length > 0) {
            const filteredData = data.filter(item => {
                return item.title.toLowerCase().includes(searchText) || 
                       (item.description && item.description.toLowerCase().includes(searchText)) || 
                       item.category.toLowerCase().includes(searchText);
            });
            
            // Renderiza um único carrossel para os resultados da busca local
            contentRowsContainer.innerHTML = '';
            contentRowsContainer.appendChild(createRowContainer(`Resultados da Busca Local para "${searchText}"`, filteredData));
        } else {
            // Se a busca estiver vazia, retorna à exibição padrão por categoria
            renderRowsStandard(data);
        }
    }

    // Evento de Digitação (filtra em tempo real no modo local)
    searchBar.addEventListener('input', applyFiltersAndSearch);

    // Evento de Alternância do Toggle (muda o modo de busca)
    searchToggle.addEventListener('change', function() {
        if (this.checked) {
            // Modo Fandom ATIVO (Toggle checked)
            searchContainer.classList.add('fandom-active');
            searchBar.placeholder = "Buscar na Fandom Wiki...";
            // Limpa e reseta o filtro local (mostra todos) para não confundir
            applyFiltersAndSearch(); 
        } else {
            // Modo Local ATIVO (Toggle unchecked)
            searchContainer.classList.remove('fandom-active');
            searchBar.placeholder = "Buscar título ou categoria...";
            // Reaplica o filtro caso haja texto no input
            applyFiltersAndSearch(); 
        }
    });

    // Evento de ENTER (Redireciona para o Fandom se o modo externo estiver ativo)
    searchBar.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = searchBar.value.trim();
            
            if (searchToggle.checked && query.length > 0) {
                event.preventDefault(); 
                // Abre a busca do Fandom em nova aba
                const fandomUrl = `https://www.fandom.com/?s=${encodeURIComponent(query)}`;
                window.open(fandomUrl, '_blank');
            }
        }
    });

    // ------------------------------------
    // 5. FUNÇÕES AUXILIARES DO MODAL (WIKIPEDIA, TRAILERS, ETC.)
    // ------------------------------------

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
            if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);
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
            // Garante que o vídeo principal seja carregado sem autoplay e mudo
            player.src = `${url}?rel=0&autoplay=0&mute=0`; 
            player.title = title;
        }
    }


    // ------------------------------------
    // 6. FUNÇÕES PRINCIPAIS DO MODAL
    // ------------------------------------

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

        // Carrega e renderiza os artigos da Wikipedia
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

            // Adiciona o listener de Acordeão para a Wikipedia
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

        // Adiciona o listener para a troca de trailers
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
        if (!modal) return;
        
        // Pausa/Zera o player de vídeo do YouTube
        const trailerPlayer = document.getElementById('main-trailer-player');
        if (trailerPlayer) {
            trailerPlayer.src = ''; 
        }

        // Remove o conteúdo dinâmico.
        modalBody.innerHTML = ''; 
        
        // Oculta e restaura o scroll.
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }

    // ------------------------------------
    // 7. EVENTOS GLOBAIS
    // ------------------------------------

    // Eventos da Sidebar
    if (menuToggleBtn && closeSidebarBtn && overlay) {
        menuToggleBtn.addEventListener('click', toggleSidebar);
        closeSidebarBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        
        // Evento de redimensionamento para desktop
        window.addEventListener('resize', () => {
            if (isDesktop()) {
                sidebar.classList.remove('open');
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }


    // Eventos do Modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Fecha se clicar fora (no overlay do modal)
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Fecha se pressionar ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
        // Fecha sidebar no ESC (se não for desktop)
        if (event.key === 'Escape' && sidebar.classList.contains('open') && !isDesktop()) {
            toggleSidebar();
        }
    });


    // ------------------------------------
    // 8. INICIALIZAÇÃO
    // ------------------------------------
    if (data && data.length > 0) {
        applyFiltersAndSearch(); // Renderiza o conteúdo inicial (modo local padrão)
    } else {
        contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: red;">Os dados da Wiki estão vazios. Verifique o array DADOS_DA_WIKI no arquivo dados.js.</p>';
    }
});
