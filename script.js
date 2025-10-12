//========================================================================
// VARIÁVEIS DE CONFIGURAÇÃO DO GITHUB (ATUALIZE AQUI!)
//========================================================================
// **SUBSTITUA** esta URL pela URL RAW do seu arquivo JSON de Sites no GitHub
const GITHUB_SITES_RAW_URL = "https://raw.githubusercontent.com/Mister-c21/Dados/refs/heads/main/Sites.json"; 
// **SUBSTITUA** esta URL pela URL RAW do seu arquivo JSON de Quotes no GitHub
const GITHUB_QUOTES_RAW_URL = "https://raw.githubusercontent.com/Mister-c21/Dados/refs/heads/main/Quotes.json";
// **NOVO** - URL RAW do seu arquivo JSON de Imagens no GitHub (**ATUALIZE ESTA URL**)
const GITHUB_IMAGES_RAW_URL = "https://raw.githubusercontent.com/Mister-c21/Dados/refs/heads/main/Images.json"; 

// Elementos DOM
const wikiListContainer = document.getElementById('wiki-list-container'); 
const wikiLoadingIndicator = document.getElementById('wiki-loading');
const mainSearchInput = document.getElementById('main-search-input'); 
const loadMoreButton = document.getElementById('load-more-wiki'); 
const tabButtons = document.querySelectorAll('.tab-button');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sitesListContainer = document.getElementById('sites-list-container');
const sitesLoadingIndicator = document.getElementById('sites-loading');
const sitesFilterContainer = document.getElementById('sites-filter-container');

// NOVAS VARIÁVEIS DOM PARA QUOTES
const quotesListContainer = document.getElementById('quotes-list-container');
const quotesLoadingIndicator = document.getElementById('quotes-loading');
const quotesFilterContainer = document.getElementById('quotes-filter-container');

// NOVAS VARIÁVEIS DOM PARA IMAGENS
const imagesGridContainer = document.getElementById('images-grid-container');
const imagesLoadingIndicator = document.getElementById('images-loading');
const imagesFilterContainer = document.getElementById('images-filter-container');


// VARIÁVEIS GLOBAIS
let globalSitesData = []; 
let globalQuotesData = []; 
let globalImagesData = []; 
let globalWikiFullTopicList = []; 
let globalWikiLoadedArticles = []; 
let globalWikiTopicCache = {}; 
let currentWikiArticleIndex = 0; 

// CONSTANTES DE PAGINAÇÃO
const INITIAL_LOAD_COUNT = 15; // Número inicial de artigos
const LOAD_INCREMENT = 12; // Número de artigos a carregar por clique

//========================================================================
// WIKIPÉDIA: LISTAS EXPANDIDAS E PAGINAÇÃO 
//========================================================================

const wikiTopicMap = {
    // 40 Tópicos por tema (mínimo de 39)
    all: [
        "Minimalismo", "Produtividade", "Essencialismo", "Gestão do tempo", "Finanças pessoais", 
        "Desenvolvimento pessoal", "Hábitos", "Meditação", "Felicidade", "Filosofia", 
        "Stoicismo", "Epicurismo", "Consumo consciente", "Sustentabilidade", "Ecologia", 
        "Viagem minimalista", "Dieta minimalista", "Saúde mental", "Psicologia positiva", "Crescimento pessoal", 
        "Aprendizagem", "Leitura dinâmica", "Escrita", "Criação de conteúdo", "Propósito de vida",
        "Trabalho remoto", "Economia criativa", "Empreendedorismo social", "Marketing digital", "Cibersegurança",
        "Inteligência artificial", "Blockchain", "Privacidade", "Ética na tecnologia", "Futurismo",
        "Urbanismo", "Design thinking", "Métodos ágeis", "Resiliência", "Bem-estar"
    ],
    movies: [
        "Filme de arte", "Cinema minimalista", "Cinema independente", "Diretores de cinema", "Roteiro",
        "Fotografia (cinema)", "Montagem (cinema)", "Neo-realismo italiano", "Nouvelle Vague", "Dogme 95",
        "Documentário", "Filme experimental", "Filme noir", "Ficção científica", "Drama (gênero)",
        "Comédia dramática", "Suspense psicológico", "Mistério", "Western (gênero)", "Musical (cinema)",
        "Animação", "Gênero cinematográfico", "Trilogia (cinema)", "Atores de cinema", "Prêmios de cinema",
        "Estética (cinema)", "Crítica de cinema", "História do cinema", "Cinema brasileiro", "Cinema europeu",
        "Cinema asiático", "Cineclube", "Plataformas de streaming", "Edição de som (cinema)", "Direção de arte",
        "Narrativa transmidiática", "Fã-clube", "Efeitos visuais", "Filme distópico", "Cinema de autor"
    ],
    series: [
        "Série de televisão dramática", "Série de televisão de ficção científica", "Série limitada", "Websérie", "Minissérie",
        "Showrunner", "Produção de televisão", "Escrita de roteiro para televisão", "Streaming de mídia", "Televisão pública",
        "Série de comédia", "Série de suspense", "Série policial", "Série de fantasia", "Série histórica",
        "Série de anime", "Telenovela", "Sitcom", "Série antológica", "Piloto (televisão)",
        "Temporada (televisão)", "Episódio (televisão)", "Cliffhanger", "Spinoff", "Reboot (ficção)",
        "Adaptação (ficção)", "Cultura pop", "Fandom", "Audiência (televisão)", "Críticas de televisão",
        "Distribuição de conteúdo", "Televisão por assinatura", "Serviços OTT", "Documentário em série", "Série infanto-juvenil",
        "Desenho animado", "Transmissão ao vivo", "Narrativa serializada", "Televisão educativa", "Impacto cultural da televisão"
    ],
    relationship: [
        "Relacionamento interpessoal", "Comunicação não-violenta", "Assertividade", "Inteligência emocional", "Empatia",
        "Amizade", "Amor romântico", "Relacionamento conjugal", "Monogamia", "Poliamor",
        "Relacionamento abusivo", "Conflito interpessoal", "Mediação", "Terapia de casal", "Psicoterapia",
        "Família", "Parentalidade", "Criação com apego", "Limites (psicologia)", "Codependência",
        "Linguagem corporal", "Escuta ativa", "Habilidades sociais", "Autoconhecimento", "Autoestima",
        "Vulnerabilidade", "Ciúme", "Perdão", "Gratidão", "Luto",
        "Psicologia social", "Vínculo afetivo", "Comunicação honesta", "Interação social", "Conexão humana",
        "Relacionamento platônico", "Casamento", "Divórcio", "Dating", "Solidão"
    ],
    work: [
        "Home office", "Gestão do tempo", "Fluxo de trabalho", "Produtividade pessoal", "Organização",
        "Liderança", "Trabalho em equipe", "Comunicação empresarial", "Cultura organizacional", "Motivação",
        "Satisfação no trabalho", "Ergonomia", "Saúde ocupacional", "Burnout", "Equilíbrio trabalho-vida",
        "Carreira profissional", "Desenvolvimento de carreira", "Recrutamento", "Entrevista de emprego", "Networking",
        "Freelancer", "Nomadismo digital", "Startup", "Inovação", "Design de serviço",
        "Metodologia ágil", "Scrum (desenvolvimento de software)", "Kanban", "Gestão de projetos", "Inteligência de mercado",
        "Finanças corporativas", "Contabilidade", "Marketing", "Vendas", "Negociação",
        "Direito do trabalho", "Regulamentação profissional", "Ética profissional", "Microempreendedor individual", "Economia solidária"
    ]
};

async function fetchWikipediaSummary(topic) {
    const encodedTopic = encodeURIComponent(topic);
    const apiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodedTopic}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro HTTP ou página não encontrada para: ${topic}`);
        }
        const data = await response.json();
        
        if (!data.extract || data.extract.includes("página inexistente")) {
             throw new Error(`Página sem resumo útil para: ${topic}`);
        }
        
        return {
            title: data.title,
            excerpt: data.extract,
            pageUrl: data.content_urls.desktop.page
        };
    } catch (error) {
        return {
            title: topic,
            excerpt: "Não foi possível carregar o resumo detalhado da Wikipédia para este tópico específico. Clique para ler a página original.",
            pageUrl: `https://pt.wikipedia.org/wiki/${topic}`
        };
    }
}

/**
 * Renderiza uma porção dos artigos no DOM.
 * @param {Array} articles - A lista de artigos (já processados) a serem exibidos.
 * @param {boolean} clear - Se deve limpar o container antes de renderizar.
 */
function renderWikiCards(articles, clear = true) {
    if (clear) {
        wikiListContainer.innerHTML = '';
        
        // Exibe o aviso no primeiro carregamento, se houver falhas no tema ativo
        if (mainSearchInput.value.trim() === '') {
             const articlesToCheck = globalWikiLoadedArticles.length > 0 ? globalWikiLoadedArticles : articles;
             const validArticles = articlesToCheck.filter(item => 
                 !item.excerpt.includes("Não foi possível carregar o resumo detalhado")
             );

             // Se houve falha e não estamos em modo de busca, mostra o aviso
             if (validArticles.length < articlesToCheck.length && articlesToCheck.length > 0) {
                const warning = document.createElement('div');
                warning.classList.add('wiki-card', 'warning'); // Aplica a classe CSS para o estilo BlueViolet/Aviso
                warning.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> **Aviso:** O carregamento inicial de **${articlesToCheck.length}** artigos foi concluído. Alguns tópicos podem não ter resumo. Clique em **"Carregar Mais"** para os artigos restantes.</p>`;
                wikiListContainer.appendChild(warning);
            }
        }
    }

    if (articles.length === 0 && clear) {
        wikiListContainer.innerHTML = `
            <div class="wiki-card" style="text-align: center; color: var(--accent-color);">
                <i class="fas fa-info-circle"></i> Nenhum artigo encontrado.
            </div>
        `;
        loadMoreButton.style.display = 'none';
        return;
    }
    
    const fragment = document.createDocumentFragment();

    articles.forEach(item => {
        const wikiCard = document.createElement('article');
        wikiCard.classList.add('wiki-card');
        
        const shortExcerpt = item.excerpt && item.excerpt.length > 200 
            ? item.excerpt.substring(0, 200) + '...' 
            : item.excerpt || "Nenhum resumo disponível.";

        wikiCard.innerHTML = `
            <h3>${item.title} (Via Wikipedia)</h3>
            <p>${shortExcerpt}</p>
            <a href="${item.pageUrl}" target="_blank">Ler artigo completo na Wikipedia &rarr;</a>
        `;
        fragment.appendChild(wikiCard);
    });
    
    wikiListContainer.appendChild(fragment);
    updateLoadMoreButtonVisibility();
}

function updateLoadMoreButtonVisibility() {
    const totalArticles = globalWikiFullTopicList.length;
    
    if (mainSearchInput.value.trim() === '' && currentWikiArticleIndex < totalArticles) {
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none';
    }
}

async function loadAndRenderInitialWikiContent(topicKey) {
    const topicsToFetch = wikiTopicMap[topicKey] || wikiTopicMap['all'];
    
    if (globalWikiTopicCache[topicKey]) {
        globalWikiFullTopicList = globalWikiTopicCache[topicKey];
    } else {
        wikiListContainer.innerHTML = '';
        wikiLoadingIndicator.style.display = 'block';
        loadMoreButton.style.display = 'none';
        
        const fetchPromises = topicsToFetch.map(topic => fetchWikipediaSummary(topic));
        const results = await Promise.all(fetchPromises);
        
        globalWikiTopicCache[topicKey] = results;
        globalWikiFullTopicList = results;
        wikiLoadingIndicator.style.display = 'none';
    }
    
    currentWikiArticleIndex = 0;
    loadMoreArticles(INITIAL_LOAD_COUNT, true);
}

function loadMoreArticles(count = LOAD_INCREMENT, isInitialLoad = false) {
    const startIndex = currentWikiArticleIndex;
    const endIndex = Math.min(startIndex + count, globalWikiFullTopicList.length);
    
    if (startIndex >= endIndex) return;

    const articlesToAdd = globalWikiFullTopicList.slice(startIndex, endIndex);

    if (isInitialLoad) {
        globalWikiLoadedArticles = articlesToAdd;
        // Limpa e renderiza (com aviso, se aplicável)
        renderWikiCards(articlesToAdd, true); 
    } else {
        // Renderiza apenas os novos (sem limpar o container)
        renderWikiCards(articlesToAdd, false); 
        globalWikiLoadedArticles.push(...articlesToAdd);
    }
    
    currentWikiArticleIndex = endIndex;
    updateLoadMoreButtonVisibility();
}


function searchWikiContent(term) {
    const lowerCaseTerm = term.toLowerCase();
    loadMoreButton.style.display = 'none';

    if (lowerCaseTerm === '') {
        renderWikiCards(globalWikiLoadedArticles, true);
        updateLoadMoreButtonVisibility();
        return;
    }

    const filteredArticles = globalWikiFullTopicList.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(lowerCaseTerm);
        const excerptMatch = article.excerpt.toLowerCase().includes(lowerCaseTerm);
        return titleMatch || excerptMatch;
    });

    renderWikiCards(filteredArticles, true);
}

function setupWikiTopicFilters() {
    document.querySelectorAll('#wiki-content .topic-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const topic = e.currentTarget.getAttribute('data-topic');
            
            document.querySelectorAll('#wiki-content .topic-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            mainSearchInput.value = '';
            loadAndRenderInitialWikiContent(topic);
        });
    });
    
    loadMoreButton.addEventListener('click', () => {
        loadMoreArticles(LOAD_INCREMENT, false);
    });
}


//========================================================================
// LÓGICA DA ABA SITES
//========================================================================

function renderSitesList(sites) {
    sitesListContainer.innerHTML = '';
    if (sites.length === 0) {
        const noResults = document.createElement('li');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '20px';
        noResults.style.color = 'var(--accent-color)';
        noResults.innerHTML = '<i class="fas fa-info-circle"></i> Nenhum site encontrado para a busca ou filtro atual.';
        sitesListContainer.appendChild(noResults);
        return;
    }
    sites.forEach(site => {
        const title = site.title || 'Título Indisponível';
        const link = site.link || '#';
        const snippet = site.snippet || '';
        const tags = site.tags || [];
        const tagsHtml = tags.map(tag => `<span class="site-tag">${tag}</span>`).join('');
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div>
                <a href="${link}" target="_blank">${title}</a>
                <p>${snippet}</p>
                <div class="site-tags">${tagsHtml}</div>
            </div>
        `;
        sitesListContainer.appendChild(listItem);
    });
}

function filterSitesByTag(tag) {
    mainSearchInput.value = ''; 
    sitesFilterContainer.querySelectorAll('.topic-button').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`#sites-filter-container .topic-button[data-tag="${tag}"]`);
    if(activeBtn) {
        activeBtn.classList.add('active');
    }
    
    if (tag === 'all') {
        renderSitesList(globalSitesData);
    } else {
        const filteredSites = globalSitesData.filter(site => 
            site.tags && site.tags.includes(tag)
        );
        renderSitesList(filteredSites);
    }
}

function searchSitesContent(term) {
    const lowerCaseTerm = term.toLowerCase();
    sitesFilterContainer.querySelectorAll('.topic-button').forEach(btn => {
        const tag = btn.getAttribute('data-tag');
        if (tag !== 'all') {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active'); 
        }
    });

    if (lowerCaseTerm === '') {
        renderSitesList(globalSitesData); 
        return;
    }

    const filteredSites = globalSitesData.filter(site => {
        const titleMatch = (site.title || '').toLowerCase().includes(lowerCaseTerm);
        const snippetMatch = (site.snippet || '').toLowerCase().includes(lowerCaseTerm);
        const tagsMatch = (site.tags || []).some(tag => tag.toLowerCase().includes(lowerCaseTerm));
        return titleMatch || snippetMatch || tagsMatch;
    });
    renderSitesList(filteredSites);
}

function setupSitesFilters(data) {
    const allTags = new Set();
    data.forEach(site => {
        if (site.tags && Array.isArray(site.tags)) {
            site.tags.forEach(tag => allTags.add(tag));
        }
    });
    const sortedTags = Array.from(allTags).sort();
    sitesFilterContainer.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.classList.add('topic-button', 'active');
    allButton.setAttribute('data-tag', 'all');
    allButton.textContent = 'Todos';
    sitesFilterContainer.appendChild(allButton);
    sortedTags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.classList.add('topic-button');
        tagButton.setAttribute('data-tag', tag);
        tagButton.textContent = tag.charAt(0).toUpperCase() + tag.slice(1); 
        sitesFilterContainer.appendChild(tagButton);
    });
    sitesFilterContainer.querySelectorAll('.topic-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedTag = e.currentTarget.getAttribute('data-tag');
            filterSitesByTag(selectedTag);
        });
    });
}

async function loadAndRenderSites() {
    sitesListContainer.innerHTML = '';
    sitesLoadingIndicator.style.display = 'block';
    sitesFilterContainer.innerHTML = ''; 
    try {
        const response = await fetch(GITHUB_SITES_RAW_URL);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o JSON de Sites do GitHub. Status: ${response.status}. Verifique a URL RAW.`);
        }
        const sitesData = await response.json();
        if (!Array.isArray(sitesData)) {
            throw new Error("O JSON de Sites do GitHub não está no formato de lista (Array).");
        }
        globalSitesData = sitesData;
        setupSitesFilters(globalSitesData);
        renderSitesList(globalSitesData);
    } catch (error) {
        console.error("Erro na API do GitHub Sites:", error);
        const errorItem = document.createElement('li');
        errorItem.style.color = '#e74c3c';
        errorItem.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Erro ao carregar sites: ${error.message}`;
        sitesListContainer.appendChild(errorItem);
    } finally {
        sitesLoadingIndicator.style.display = 'none';
    }
}


//========================================================================
// LÓGICA DA ABA QUOTES
//========================================================================

function renderQuotesList(quotes) {
    quotesListContainer.innerHTML = '';
    if (quotes.length === 0) {
        quotesListContainer.innerHTML = `
            <div class="wiki-card" style="text-align: center; color: var(--accent-color);">
                <i class="fas fa-info-circle"></i> Nenhuma quote encontrada para a busca ou filtro atual.
            </div>
        `;
        return;
    }
    quotes.forEach(quote => {
        // CORREÇÃO: Acessa a propriedade 'pt-br'
        const text = (quote.text && quote.text['pt-br']) || 'Quote Indisponível';
        const author = (quote.author && quote.author['pt-br']) || 'Autor Desconhecido';

        const listItem = document.createElement('article');
        listItem.classList.add('quote-card');
        listItem.innerHTML = `
            <p class="text">${text}</p>
            <p class="author">${author}</p>
        `;
        quotesListContainer.appendChild(listItem);
    });
}

function filterQuotesByTag(tag) {
    mainSearchInput.value = ''; 
    quotesFilterContainer.querySelectorAll('.topic-button').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`#quotes-filter-container .topic-button[data-tag="${tag}"]`);
    if(activeBtn) {
        activeBtn.classList.add('active');
    }

    if (tag === 'all') {
        renderQuotesList(globalQuotesData);
    } else {
        const filteredQuotes = globalQuotesData.filter(quote => 
            quote.tags && quote.tags.includes(tag)
        );
        renderQuotesList(filteredQuotes);
    }
}

function searchQuotesContent(term) {
    const lowerCaseTerm = term.toLowerCase();
    quotesFilterContainer.querySelectorAll('.topic-button').forEach(btn => {
        const tag = btn.getAttribute('data-tag');
        if (tag !== 'all') {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active'); 
        }
    });

    if (lowerCaseTerm === '') {
        renderQuotesList(globalQuotesData); 
        return;
    }

    const filteredQuotes = globalQuotesData.filter(quote => {
        // CORREÇÃO: Acessa o texto e o autor em português para a pesquisa
        const ptBrText = (quote.text && quote.text['pt-br']) || '';
        const ptBrAuthor = (quote.author && quote.author['pt-br']) || '';
        
        const textMatch = ptBrText.toLowerCase().includes(lowerCaseTerm);
        const authorMatch = ptBrAuthor.toLowerCase().includes(lowerCaseTerm);
        
        const tagsMatch = (quote.tags || []).some(tag => tag.toLowerCase().includes(lowerCaseTerm));
        return textMatch || authorMatch || tagsMatch;
    });
    renderQuotesList(filteredQuotes);
}

function setupQuotesFilters(data) {
    const allTags = new Set();
    data.forEach(quote => {
        if (quote.tags && Array.isArray(quote.tags)) {
            quote.tags.forEach(tag => allTags.add(tag));
        }
    });
    const sortedTags = Array.from(allTags).sort();
    quotesFilterContainer.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.classList.add('topic-button', 'active');
    allButton.setAttribute('data-tag', 'all');
    allButton.textContent = 'Todos';
    quotesFilterContainer.appendChild(allButton);
    sortedTags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.classList.add('topic-button');
        tagButton.setAttribute('data-tag', tag);
        tagButton.textContent = tag.charAt(0).toUpperCase() + tag.slice(1); 
        quotesFilterContainer.appendChild(tagButton);
    });
    quotesFilterContainer.querySelectorAll('.topic-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedTag = e.currentTarget.getAttribute('data-tag');
            filterQuotesByTag(selectedTag);
        });
    });
}

async function loadAndRenderQuotes() {
    quotesListContainer.innerHTML = '';
    quotesLoadingIndicator.style.display = 'block';
    quotesFilterContainer.innerHTML = '';
    try {
        const response = await fetch(GITHUB_QUOTES_RAW_URL);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o JSON de Quotes do GitHub. Status: ${response.status}. Verifique a URL RAW.`);
        }
        const quotesData = await response.json();
        if (!Array.isArray(quotesData)) {
            throw new Error("O JSON de Quotes do GitHub não está no formato de lista (Array).");
        }
        globalQuotesData = quotesData;
        setupQuotesFilters(globalQuotesData);
        renderQuotesList(globalQuotesData);
    } catch (error) {
        console.error("Erro na API do GitHub Quotes:", error);
        const errorItem = document.createElement('div');
        errorItem.classList.add('wiki-card', 'warning');
        errorItem.style.color = '#e74c3c';
        errorItem.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> Erro ao carregar quotes: ${error.message}</p>`;
        quotesListContainer.appendChild(errorItem);
    } finally {
        quotesLoadingIndicator.style.display = 'none';
    }
}


//========================================================================
// LÓGICA DA ABA IMAGENS (NOVA SEÇÃO)
//========================================================================

function renderImagesGrid(images) {
    imagesGridContainer.innerHTML = '';
    if (images.length === 0) {
        imagesGridContainer.innerHTML = `
            <div class="wiki-card" style="text-align: center; grid-column: 1 / -1; color: var(--accent-color);">
                <i class="fas fa-info-circle"></i> Nenhuma imagem encontrada para a busca ou filtro atual.
            </div>
        `;
        return;
    }
    
    images.forEach(image => {
        // Assume que o JSON tem: { url: "link_da_imagem", tags: ["tag1", "tag2"], title: "Título da imagem" }
        const url = image.url || '';
        const title = image.title || 'Imagem';

        const imageCard = document.createElement('a');
        imageCard.classList.add('image-card');
        imageCard.href = url; // Abre a imagem em tela cheia ao clicar
        imageCard.target = "_blank";
        
        // Estrutura para manter a proporção e exibir a imagem
        imageCard.innerHTML = `
            <div class="image-card-wrapper">
                <img src="${url}" alt="${title}">
            </div>
            <div class="image-info">${title}</div>
        `;
        imagesGridContainer.appendChild(imageCard);
    });
}

function filterImagesByTag(tag) {
    mainSearchInput.value = ''; 
    imagesFilterContainer.querySelectorAll('.topic-button').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`#images-filter-container .topic-button[data-tag="${tag}"]`);
    if(activeBtn) {
        activeBtn.classList.add('active');
    }

    if (tag === 'all') {
        renderImagesGrid(globalImagesData);
    } else {
        const filteredImages = globalImagesData.filter(image => 
            image.tags && image.tags.includes(tag)
        );
        renderImagesGrid(filteredImages);
    }
}

function searchImagesContent(term) {
    const lowerCaseTerm = term.toLowerCase();
    imagesFilterContainer.querySelectorAll('.topic-button').forEach(btn => {
        const tag = btn.getAttribute('data-tag');
        if (tag !== 'all') {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active'); 
        }
    });

    if (lowerCaseTerm === '') {
        renderImagesGrid(globalImagesData); 
        return;
    }

    const filteredImages = globalImagesData.filter(image => {
        const titleMatch = (image.title || '').toLowerCase().includes(lowerCaseTerm);
        const tagsMatch = (image.tags || []).some(tag => tag.toLowerCase().includes(lowerCaseTerm));
        return titleMatch || tagsMatch;
    });
    renderImagesGrid(filteredImages);
}

function setupImagesFilters(data) {
    const allTags = new Set();
    data.forEach(image => {
        if (image.tags && Array.isArray(image.tags)) {
            image.tags.forEach(tag => allTags.add(tag));
        }
    });
    const sortedTags = Array.from(allTags).sort();
    imagesFilterContainer.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.classList.add('topic-button', 'active');
    allButton.setAttribute('data-tag', 'all');
    allButton.textContent = 'Todas';
    imagesFilterContainer.appendChild(allButton);
    sortedTags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.classList.add('topic-button');
        tagButton.setAttribute('data-tag', tag);
        tagButton.textContent = tag.charAt(0).toUpperCase() + tag.slice(1); 
        imagesFilterContainer.appendChild(tagButton);
    });
    imagesFilterContainer.querySelectorAll('.topic-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedTag = e.currentTarget.getAttribute('data-tag');
            filterImagesByTag(selectedTag);
        });
    });
}

async function loadAndRenderImages() {
    imagesGridContainer.innerHTML = '';
    imagesLoadingIndicator.style.display = 'block';
    imagesFilterContainer.innerHTML = '';
    try {
        const response = await fetch(GITHUB_IMAGES_RAW_URL);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o JSON de Imagens do GitHub. Status: ${response.status}. Verifique a URL RAW.`);
        }
        const imagesData = await response.json();
        if (!Array.isArray(imagesData)) {
            throw new Error("O JSON de Imagens do GitHub não está no formato de lista (Array).");
        }
        globalImagesData = imagesData;
        setupImagesFilters(globalImagesData);
        renderImagesGrid(globalImagesData);
    } catch (error) {
        console.error("Erro na API do GitHub Imagens:", error);
        const errorItem = document.createElement('div');
        errorItem.classList.add('wiki-card', 'warning');
        errorItem.style.color = '#e74c3c';
        errorItem.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> Erro ao carregar imagens: ${error.message}</p>`;
        imagesGridContainer.appendChild(errorItem);
    } finally {
        imagesLoadingIndicator.style.display = 'none';
    }
}


//========================================================================
// LÓGICA DE BUSCA GLOBAL E INICIALIZAÇÃO
//========================================================================

function handleSearch() {
    const searchTerm = mainSearchInput.value.trim();
    const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
    
    if (activeTab === 'wiki') {
        if (searchTerm === '') {
            renderWikiCards(globalWikiLoadedArticles, true);
            updateLoadMoreButtonVisibility();
        } else {
             searchWikiContent(searchTerm);
        }
        return;
    }

    if (activeTab === 'sites') {
        if (searchTerm === '') {
            const activeTagButton = document.querySelector('#sites-filter-container .topic-button.active');
            const activeTag = activeTagButton ? activeTagButton.getAttribute('data-tag') : 'all';
            filterSitesByTag(activeTag); 
        } else {
             searchSitesContent(searchTerm);
        }
        return;
    }
    
     if (activeTab === 'quotes') {
        if (searchTerm === '') {
            const activeTagButton = document.querySelector('#quotes-filter-container .topic-button.active');
            const activeTag = activeTagButton ? activeTagButton.getAttribute('data-tag') : 'all';
            filterQuotesByTag(activeTag); 
        } else {
             searchQuotesContent(searchTerm);
        }
        return;
    }
    
    // NOVO: LÓGICA DA ABA IMAGENS
    if (activeTab === 'images') {
        if (searchTerm === '') {
            const activeTagButton = document.querySelector('#images-filter-container .topic-button.active');
            const activeTag = activeTagButton ? activeTagButton.getAttribute('data-tag') : 'all';
            filterImagesByTag(activeTag); 
        } else {
             searchImagesContent(searchTerm);
        }
        return;
    }
}

function setupSearch() {
    mainSearchInput.addEventListener('input', handleSearch);
}

//========================================================================
// LÓGICA DE SIDEBAR: DESKTOP vs MOBILE (NOVO)
//========================================================================

function openSidebar() {
    // Só abre e aplica overflow:hidden no mobile (< 768px, conforme CSS)
    if (window.innerWidth < 768) { 
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function checkDesktopAndInit() {
    // Se a tela for desktop (>= 768px), o CSS já garante que a sidebar está aberta.
    if (window.innerWidth >= 768) {
        // No desktop, garantimos que os estados de mobile sejam desativados.
        sidebar.classList.remove('open'); 
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Garante que o scroll não seja bloqueado
    } else {
        // No mobile, garante que a sidebar comece fechada (por padrão no CSS).
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function setupSidebarEvents() {
    // Use o ID do novo botão de menu adicionado no HTML
    const menuToggleBtn = document.getElementById('menu-toggle-btn'); 
    
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', openSidebar);
    }
    
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Fecha a sidebar ao pressionar ESC (apenas no mobile)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open') && window.innerWidth < 768) {
            closeSidebar();
        }
    });
    
    // Fecha a sidebar ao clicar em um link (apenas se estiver aberta, ou seja, no mobile)
    sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                 closeSidebar();
            }
        });
    });
    
    // NOVO: Adiciona a verificação de estado inicial e a escuta para redimensionamento
    checkDesktopAndInit();
    window.addEventListener('resize', checkDesktopAndInit);
}

// FIM LÓGICA SIDEBAR
//========================================================================

function setupTabNavigation() {
    const tabContents = document.querySelectorAll('.tab-content');

    // Configuração inicial para a aba 'wiki'
    const initialTabButton = document.querySelector('[data-tab="wiki"]');
    if (initialTabButton) initialTabButton.classList.add('active');
    document.getElementById('wiki-content').classList.add('active');

    loadAndRenderInitialWikiContent('all'); 
    // Carrega Sites, Quotes e Imagens em background ou na inicialização
    loadAndRenderSites(); 
    loadAndRenderQuotes(); 
    loadAndRenderImages(); 

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTabId + '-content').classList.add('active');

            mainSearchInput.value = '';

            // Lógica de Carregamento Condicional (Garante que os dados sejam exibidos)
            if (targetTabId === 'quotes' && globalQuotesData.length > 0) {
                 renderQuotesList(globalQuotesData); // Apenas renderiza se já carregado
            } else if (targetTabId === 'sites' && globalSitesData.length > 0) {
                 renderSitesList(globalSitesData); // Apenas renderiza se já carregado
            } else if (targetTabId === 'images' && globalImagesData.length > 0) { 
                 renderImagesGrid(globalImagesData); // Apenas renderiza se já carregado
            } else if (targetTabId === 'wiki') {
                 // Garante que o filtro 'Todos' esteja ativo ao voltar para a Wiki sem pesquisa
                 const activeWikiButton = document.querySelector('#wiki-content .topic-button.active');
                 if (!activeWikiButton || activeWikiButton.getAttribute('data-topic') === 'all') {
                     renderWikiCards(globalWikiLoadedArticles, true);
                 }
            }
            
            handleSearch(); // Para aplicar filtros ou restaurar o estado original após a troca
        });
    });
}


// Inicialização Principal
document.addEventListener('DOMContentLoaded', () => {
    
    setupTabNavigation();
    setupWikiTopicFilters();
    setupSearch(); 
    setupSidebarEvents(); 
});
