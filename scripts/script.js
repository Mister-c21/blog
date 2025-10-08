import { searchQuotes } from './quotesService.js';
import { searchWikipedia } from './wikipediaService.js';
import { searchCatalogedSites } from './catalogedSitesService.js'; 
// import { searchImages } from './imageService.js'; // REMOVIDO

// --- Configuração da Paginação ---
const RESULTS_PER_PAGE = 10; 
// Quantidade de resultados de CADA tipo para a prévia de alta relevância (topo do feed "Todo")
const ALL_FEED_PREVIEW_COUNT = 1; // Reduzido para 1 para focar apenas no MAIS relevante de cada

// --- Elementos do DOM ---
const DOMElements = {
    splashScreen: document.querySelector('.splash-screen'),
    searchInputField: document.getElementById('searchInputField'),
    searchForm: document.getElementById('searchForm'),
    clearSearchButton: document.getElementById('clearSearchButton'),
    resultsModal: document.getElementById('resultsModal'),
    modalResultsContent: document.getElementById('modalResultsContent'),
    closeResultsButton: document.getElementById('closeResultsButton'),
    sharePopupMenu: document.getElementById('sharePopupMenu'), 
};

// --- Estado da Aplicação ---
const AppState = {
    allFetchedResults: {}, // { wikipedia: [], quotes: [], catalogedSites: [] }
    // Resultado misturado para a aba 'all'
    allResults: [],
    currentQuery: '',
    currentLanguage: 'pt-br',
    activeShareButton: null, 
    // Gerencia a página atual para cada tipo de resultado
    currentPage: {
        all: 1, // Paginação para o feed 'all'
        wikipedia: 1,
        quotes: 1,
        catalogedSites: 1,
    },
    // Mantém os resultados filtrados para aplicar a paginação
    currentFilteredResults: {
        all: [], // Resultados filtrados para o feed 'all'
        wikipedia: [],
        quotes: [],
        catalogedSites: [],
    },
};

// --- URLs de Compartilhamento Direto ---
const SHARE_URLS = {
    whatsapp: (text, url) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`,
    twitter: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    telegram: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
};

// --- Funções Auxiliares ---
const highlightTerms = (text, query) => {
    if (!text || !query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, `<mark>$1</mark>`);
};

const showModal = () => {
    DOMElements.resultsModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
};

const closeModal = () => {
    DOMElements.resultsModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    hideSharePopup(); 
};

const hideSharePopup = () => {
    DOMElements.sharePopupMenu.classList.remove('show');
    AppState.activeShareButton = null;
    DOMElements.sharePopupMenu.style.top = '-9999px';
    DOMElements.sharePopupMenu.style.left = '-9999px';
};
window.hideSharePopup = hideSharePopup; 


const handleResultClick = (item, event) => {
    if (event.target.closest('.result-actions')) {
        return;
    }
    if (item.link) {
        window.open(item.link, '_blank');
    }
};

const showSharePopup = (button, text) => {
    if (AppState.activeShareButton && AppState.activeShareButton === button && DOMElements.sharePopupMenu.classList.contains('show')) {
        hideSharePopup();
        return;
    }
    if (AppState.activeShareButton) {
        hideSharePopup();
    }
    
    const buttonRect = button.getBoundingClientRect();
    const popupWidth = 180; 
    
    DOMElements.sharePopupMenu.style.top = `${buttonRect.bottom + 5}px`; 
    DOMElements.sharePopupMenu.style.left = `${buttonRect.right - popupWidth}px`; 
    DOMElements.sharePopupMenu.style.width = `${popupWidth}px`;

    const shareUrl = window.location.href; 
    DOMElements.sharePopupMenu.innerHTML = `
        <a href="${SHARE_URLS.whatsapp(text, shareUrl)}" target="_blank" class="share-button-link" onclick="javascript:hideSharePopup();"><i class="fab fa-whatsapp share-whatsapp"></i> WhatsApp</a>
        <a href="${SHARE_URLS.twitter(text, shareUrl)}" target="_blank" class="share-button-link" onclick="javascript:hideSharePopup();"><i class="fab fa-twitter share-twitter"></i> Twitter/X</a>
        <a href="${SHARE_URLS.facebook(text, shareUrl)}" target="_blank" class="share-button-link" onclick="javascript:hideSharePopup();"><i class="fab fa-facebook share-facebook"></i> Facebook</a>
        <a href="${SHARE_URLS.telegram(text, shareUrl)}" target="_blank" class="share-button-link" onclick="javascript:hideSharePopup();"><i class="fab fa-telegram share-telegram"></i> Telegram</a>
    `;

    DOMElements.sharePopupMenu.classList.add('show');
    AppState.activeShareButton = button;
};


// --- Função de Criação de Elementos ---
const createResultItem = (item) => {
    const resultItem = document.createElement('div');
    
    let contentHTML = '';
    let itemTextForCopy = '';

    switch (item.type) {
        case 'wikipedia':
        case 'catalogedSite':
            resultItem.className = `result-item ${item.type}-item ${item.wikiType || ''}`.trim();
            contentHTML = `
                <div class="website-item-content">
                    <h3>${highlightTerms(item.title, AppState.currentQuery)}</h3>
                    <p>${highlightTerms(item.snippet, AppState.currentQuery)}</p>
                    <a href="${item.link}" target="_blank" class="website-url">${item.link}</a>
                </div>
            `;
            itemTextForCopy = `${item.title}\n${item.snippet}\nLink: ${item.link}`;
            break;

        case 'quote':
            resultItem.className = `result-item ${item.type}-item`;
            const quoteText = item.text[AppState.currentLanguage] || item.text['pt-br'];
            const quoteAuthor = item.author[AppState.currentLanguage] || item.author['pt-br'];
            contentHTML = `
                <div class="quote-item-content">
                    <h3>"${highlightTerms(quoteText, AppState.currentQuery)}"</h3>
                    <p>— ${highlightTerms(quoteAuthor, AppState.currentQuery)}</p>
                    <div class="quote-tags">
                        ${item.tags.map(tag => `<span>${highlightTerms(tag, AppState.currentQuery)}</span>`).join('')}
                    </div>
                </div>
            `;
            itemTextForCopy = `"${quoteText}" — ${quoteAuthor}`;
            break;
    }

    resultItem.innerHTML = contentHTML;
    
    // --- Lógica de Ação e Botões (APENAS PARA 'quote') ---
    if (item.type === 'quote') {
        const textToShare = itemTextForCopy + `\n\n— Compartilhado através de Know.`;

        const actionDiv = document.createElement('div');
        actionDiv.className = 'result-actions';
        
        const copyButton = document.createElement('button');
        copyButton.className = 'action-button copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copiar'; 
        copyButton.title = 'Copiar texto';
        copyButton.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            try {
                await navigator.clipboard.writeText(itemTextForCopy);
                alert('Conteúdo copiado para a área de transferência!');
                hideSharePopup(); 
            } catch (err) {
                console.error('Falha ao copiar texto: ', err);
                alert('Erro ao copiar. Seu navegador pode não suportar esta ação.');
            }
        });
        
        const shareButton = document.createElement('button');
        shareButton.className = 'action-button share-button';
        shareButton.innerHTML = '<i class="fas fa-ellipsis-v"></i> Compartilhar'; 
        shareButton.title = 'Compartilhar em Rede Social';
        shareButton.addEventListener('click', (e) => {
            e.stopPropagation(); 
            showSharePopup(shareButton, textToShare);
        });

        actionDiv.appendChild(copyButton);
        actionDiv.appendChild(shareButton);
        resultItem.appendChild(actionDiv);
    }

    resultItem.addEventListener('click', (e) => {
        handleResultClick(item, e);
    });
    
    resultItem.oncontextmenu = (e) => e.preventDefault(); 

    return resultItem;
};


// ----------------------------------------------------------------------
// --- FUNÇÕES DE PAGINAÇÃO ---
// ----------------------------------------------------------------------

/**
 * Renderiza os resultados paginados e o botão de carregar mais.
 */
const renderPaginatedResults = (items, parentElement, tabType) => {
    // Limpa o conteúdo apenas se for a primeira renderização (página 1) ou uma mudança de filtro
    if (AppState.currentPage[tabType] === 1) {
        parentElement.innerHTML = '';
    } else {
        // Remove apenas o botão "Carregar Mais" da renderização anterior
        const oldLoadMoreButton = parentElement.querySelector('.load-more-button');
        if (oldLoadMoreButton) oldLoadMoreButton.remove();
    }
    
    if (items.length === 0) {
        parentElement.innerHTML = '<p class="no-results-message">Nenhum resultado encontrado para esta categoria.</p>';
        return;
    }
    
    // --- Lógica de Paginação ---
    const totalPages = Math.ceil(items.length / RESULTS_PER_PAGE);
    const currentPage = AppState.currentPage[tabType];
    
    // Calcula o subconjunto de itens a serem mostrados
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = currentPage * RESULTS_PER_PAGE;
    
    const itemsToRender = items.slice(startIndex, endIndex);

    itemsToRender.forEach(item => {
        parentElement.appendChild(createResultItem(item));
    });

    // Adiciona o botão "Carregar Mais" se houver mais páginas
    if (currentPage < totalPages) {
        const remainingItems = items.length - (currentPage * RESULTS_PER_PAGE);
        const loadMoreButton = document.createElement('button');
        loadMoreButton.className = 'load-more-button';
        loadMoreButton.textContent = `Carregar Mais (${remainingItems} restantes)`;
        loadMoreButton.addEventListener('click', () => {
            AppState.currentPage[tabType]++;
            // Renderiza novamente com a nova página
            renderPaginatedResults(items, parentElement, tabType);
        });
        parentElement.appendChild(loadMoreButton);
    }
};

/**
 * Reseta a paginação e renderiza o primeiro lote de resultados.
 */
const resetPaginationAndRender = (tabType) => {
    const resultsContainer = DOMElements.modalResultsContent.querySelector('.results-container');
    if (!resultsContainer) return;
    
    // 1. Reseta a página para 1
    AppState.currentPage[tabType] = 1;

    // 2. Obtém os resultados filtrados atuais
    const filteredItems = AppState.currentFilteredResults[tabType];

    // 3. Renderiza a primeira página
    renderPaginatedResults(filteredItems, resultsContainer, tabType);
};

// ----------------------------------------------------------------------
// --- FUNÇÕES DE RENDERIZAÇÃO E FILTRO ---
// ----------------------------------------------------------------------

const switchTab = (tabType) => {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabType);
    });
    
    // Remove qualquer filtro ativo de abas anteriores
    const oldFilter = DOMElements.modalResultsContent.querySelector('.quote-filter-container, .wiki-filter-container, .site-filter-container');
    if (oldFilter) oldFilter.remove();
    
    const resultsContainer = DOMElements.modalResultsContent.querySelector('.results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    
    // Define os resultados iniciais filtrados (sem filtro) para a aba
    if (tabType === 'all') {
        // Para a aba 'all', usamos a lista mista já preparada
        AppState.currentFilteredResults.all = AppState.allResults;
    } else {
        AppState.currentFilteredResults[tabType] = AppState.allFetchedResults[tabType] || [];
    }

    // Renderiza a UI de Filtros específica (APENAS para Wikipedia, Citações, Sites)
    if (tabType === 'quotes') {
        renderQuotesUI();
    } else if (tabType === 'wikipedia') {
        renderWikipediaUI();
    } else if (tabType === 'catalogedSites') {
        renderCatalogedSitesUI();
    }
    
    // Renderiza a primeira página de resultados para a aba ativa
    resetPaginationAndRender(tabType);
};

const renderTabsAndInitialResults = () => {
    DOMElements.modalResultsContent.innerHTML = '';
    
    const tabs = {
        'all': 'Todo', // Aba "Todo"
        'wikipedia': 'Wikipedia',
        'quotes': 'Citações',
        'catalogedSites': 'Sites Catalogados',
    };
    
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'results-tabs';

    Object.keys(tabs).forEach(tabKey => {
        const button = document.createElement('button');
        button.className = 'tab-button';
        button.textContent = tabs[tabKey];
        button.dataset.tab = tabKey;
        button.addEventListener('click', () => switchTab(tabKey));
        tabsContainer.appendChild(button);
    });
    
    DOMElements.modalResultsContent.appendChild(tabsContainer);

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';
    DOMElements.modalResultsContent.appendChild(resultsContainer);

    // Inicializa todos os resultados filtrados
    Object.keys(AppState.currentPage).forEach(key => {
        AppState.currentFilteredResults[key] = AppState.allFetchedResults[key] || [];
    });
    
    // Inicia sempre na primeira aba (Todo)
    switchTab('all');
};

const renderWikipediaUI = () => {
    const resultsContainer = DOMElements.modalResultsContent.querySelector('.results-container');
    if (!resultsContainer) return;

    const filters = { 'all': 'Todos', 'personality': 'Personalidades', 'event': 'Eventos', 'company': 'Empresas' };
    const filterContainer = createFilterContainer('wiki-filter-container', filters, (filter) => {
        let filtered = AppState.allFetchedResults.wikipedia;
        if (filter !== 'all') {
            filtered = AppState.allFetchedResults.wikipedia.filter(item => item.wikiType === `${filter}-item`);
        }
        AppState.currentFilteredResults.wikipedia = filtered;
        resetPaginationAndRender('wikipedia');
    });

    resultsContainer.before(filterContainer);
};

const renderQuotesUI = () => {
    const resultsContainer = DOMElements.modalResultsContent.querySelector('.results-container');
    if (!resultsContainer) return;

    const filters = ['all', 'animes', 'filmes', 'séries', 'desenhos', 'vida real'];
    const formattedFilters = filters.reduce((acc, f) => {
        acc[f] = f.charAt(0).toUpperCase() + f.slice(1).replace(' real', ' Real');
        return acc;
    }, {});

    const filterContainer = createFilterContainer('quote-filter-container', formattedFilters, (filter) => {
        let filtered = AppState.allFetchedResults.quotes;
        if (filter !== 'all') {
            filtered = AppState.allFetchedResults.quotes.filter(q =>
                q.tags.map(tag => tag.toLowerCase()).includes(filter.toLowerCase())
            );
        }
        AppState.currentFilteredResults.quotes = filtered;
        resetPaginationAndRender('quotes');
    });

    resultsContainer.before(filterContainer);
};

const renderCatalogedSitesUI = () => {
    const resultsContainer = DOMElements.modalResultsContent.querySelector('.results-container');
    if (!resultsContainer) return;

    const filters = ['all', 'educação', 'entretenimento', 'notícias', 'esportes'];
    const formattedFilters = filters.reduce((acc, f) => {
        acc[f] = f.charAt(0).toUpperCase() + f.slice(1);
        return acc;
    }, {});

    const filterContainer = createFilterContainer('site-filter-container', formattedFilters, (filter) => {
        let filtered = AppState.allFetchedResults.catalogedSites;
        if (filter !== 'all') {
            filtered = AppState.allFetchedResults.catalogedSites.filter(site =>
                site.tags.map(tag => tag.toLowerCase()).includes(filter.toLowerCase())
            );
        }
        AppState.currentFilteredResults.catalogedSites = filtered;
        resetPaginationAndRender('catalogedSites');
    });

    resultsContainer.before(filterContainer);
};


/**
 * Função genérica para criar o container de filtros.
 */
const createFilterContainer = (className, filters, filterHandler) => {
    const filterContainer = document.createElement('div');
    filterContainer.className = className;

    Object.entries(filters).forEach(([key, value]) => {
        const button = document.createElement('button');
        button.className = className.replace('-container', '-button');
        button.dataset.filter = key;
        button.textContent = value;
        if (key === 'all') button.classList.add('active');
        filterContainer.appendChild(button);
    });

    filterContainer.addEventListener('click', (e) => {
        const clickedButton = e.target.closest(`.${className.replace('-container', '-button')}`);
        if (clickedButton) {
            filterContainer.querySelectorAll(`.${className.replace('-container', '-button')}`).forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');
            filterHandler(clickedButton.dataset.filter);
        }
    });

    return filterContainer;
};


// --- Função Principal de Busca ---
const handleSearch = async (query) => {
    AppState.currentQuery = query;
    DOMElements.modalResultsContent.innerHTML = '<p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Buscando...</p>';
    showModal();

    try {
        const [wikiResults, quoteResults, catalogedSiteResults] = await Promise.all([ 
            searchWikipedia(query, AppState.currentLanguage),
            searchQuotes(query, AppState.currentLanguage),
            searchCatalogedSites(query),
        ]);
        
        // Armazena todos os resultados brutos
        AppState.allFetchedResults = {
            wikipedia: wikiResults,
            quotes: quoteResults,
            catalogedSites: catalogedSiteResults,
        };
        
        // --- CRIAÇÃO DO FEED UNIFICADO "Todo" (All) - ORDENADO ---
        
        const allResults = [];
        
        // 1. PRIMEIRA ORDEM: O MAIS RELEVANTE de cada categoria (1 resultado)
        const wikiTop = wikiResults.slice(0, ALL_FEED_PREVIEW_COUNT);
        const quotesTop = quoteResults.slice(0, ALL_FEED_PREVIEW_COUNT);
        const sitesTop = catalogedSiteResults.slice(0, ALL_FEED_PREVIEW_COUNT);
        
        // Adiciona em ordem de relevância (pode ser Wiki, Site, Citação, dependendo da sua prioridade)
        allResults.push(...wikiTop);
        allResults.push(...sitesTop);
        allResults.push(...quotesTop);
        
        // 2. SEGUNDA ORDEM: Agrupamento em BLOCOS para os resultados restantes
        
        // Adiciona o restante dos resultados da Wikipedia
        const wikiRemaining = wikiResults.slice(ALL_FEED_PREVIEW_COUNT);
        allResults.push(...wikiRemaining);
        
        // Adiciona o restante dos resultados de Sites Catalogados
        const sitesRemaining = catalogedSiteResults.slice(ALL_FEED_PREVIEW_COUNT);
        allResults.push(...sitesRemaining);
        
        // Adiciona o restante dos resultados de Citações
        const quotesRemaining = quoteResults.slice(ALL_FEED_PREVIEW_COUNT);
        allResults.push(...quotesRemaining);
        
        AppState.allResults = allResults;
        // ------------------------------------------------
        
        // Reseta o estado da paginação (incluindo 'all')
        AppState.currentPage = {
            all: 1,
            wikipedia: 1,
            quotes: 1,
            catalogedSites: 1,
        };
        
        renderTabsAndInitialResults();

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        DOMElements.modalResultsContent.innerHTML = '<p class="error-message">Falha ao carregar os resultados. Tente novamente.</p>';
    }
};

// --- Inicialização e Listeners ---
const init = () => {
    if (DOMElements.splashScreen) {
        setTimeout(() => DOMElements.splashScreen.classList.add('fade-out'), 1500);
    }

    DOMElements.searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = DOMElements.searchInputField.value.trim();
        if (query) handleSearch(query);
    });

    DOMElements.searchInputField.addEventListener('input', () => {
        DOMElements.clearSearchButton.style.display = DOMElements.searchInputField.value ? 'block' : 'none';
    });

    DOMElements.clearSearchButton.addEventListener('click', () => {
        DOMElements.searchInputField.value = '';
        DOMElements.clearSearchButton.style.display = 'none';
        DOMElements.searchInputField.focus();
    });

    DOMElements.closeResultsButton.addEventListener('click', closeModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === DOMElements.resultsModal) closeModal();
        
        const isShareButton = AppState.activeShareButton && AppState.activeShareButton.contains(event.target);
        const isInsidePopup = DOMElements.sharePopupMenu.contains(event.target);
        
        if (DOMElements.sharePopupMenu.classList.contains('show') && !isInsidePopup && !isShareButton) {
            hideSharePopup();
        }
    });
};

document.addEventListener('DOMContentLoaded', init);
