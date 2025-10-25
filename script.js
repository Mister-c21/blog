//========================================================================
// VARIÁVEIS DE CONFIGURAÇÃO DO GITHUB (ATUALIZE AQUI!)
// Todas as URLs de Sites, Quotes, Imagens e GIFs foram removidas.
//========================================================================

// Elementos DOM
const wikiListContainer = document.getElementById('wiki-list-container'); 
const wikiLoadingIndicator = document.getElementById('wiki-loading');
const mainSearchInput = document.getElementById('main-search-input'); 
const loadMoreButton = document.getElementById('load-more-wiki'); 
const tabButtons = document.querySelectorAll('.tab-button');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

// VARIÁVEIS GLOBAIS
let globalWikiFullTopicList = []; 
let globalWikiLoadedArticles = []; 
let globalWikiTopicCache = {}; 
let currentWikiArticleIndex = 0; 

// CONSTANTES DE PAGINAÇÃO
const INITIAL_LOAD_COUNT = 15; 
const LOAD_INCREMENT = 12; 

//========================================================================
// FUNÇÕES DE UTILIDADE PARA UX
//========================================================================

function isDesktop() {
    // Retorna true se a largura da tela for maior ou igual a 1024px
    return window.matchMedia("(min-width: 1024px)").matches;
}

function openSidebar() {
    // Abrir apenas se não for desktop
    if (!isDesktop()) {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impede o scroll do corpo da página
    }
}

function closeSidebar() {
    // Fechar apenas se não for desktop
    if (!isDesktop()) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function setupSidebarEvents() {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    if (menuToggleBtn) {
        // O ícone de menu só é visível no mobile/tablet
        menuToggleBtn.addEventListener('click', openSidebar);
    }
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open') && !isDesktop()) {
            closeSidebar();
        }
    });
    sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
        // No mobile, fechar o menu ao clicar em um link
        link.addEventListener('click', () => {
             if (!isDesktop()) closeSidebar();
        });
    });
    
    // Lida com a transição entre mobile e desktop
    window.addEventListener('resize', () => {
        if (isDesktop()) {
            // Garante que a classe 'open' seja removida se o usuário redimensionar
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}


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
                warning.classList.add('wiki-card', 'warning'); 
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
// LÓGICA DE BUSCA GLOBAL E INICIALIZAÇÃO
//========================================================================

function handleSearch() {
    const searchTerm = mainSearchInput.value.trim();
    const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
    
    // Como só temos a aba 'wiki', a lógica se resume a ela
    if (activeTab === 'wiki') {
        if (searchTerm === '') {
            renderWikiCards(globalWikiLoadedArticles, true);
            updateLoadMoreButtonVisibility();
        } else {
             searchWikiContent(searchTerm);
        }
    }
}

function setupSearch() {
    mainSearchInput.addEventListener('input', handleSearch);
}


function setupTabNavigation() {
    const tabContents = document.querySelectorAll('.tab-content');

    // Configuração inicial para a aba 'wiki'
    const initialTabButton = document.querySelector('[data-tab="wiki"]');
    if (initialTabButton) initialTabButton.classList.add('active');
    document.getElementById('wiki-content').classList.add('active');

    loadAndRenderInitialWikiContent('all'); 

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Verifica se o clique foi no botão de aba, e não nos links <a>
            if (button.tagName === 'BUTTON' && targetTabId) {
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(targetTabId + '-content').classList.add('active');
                mainSearchInput.value = '';

                // Garante que o estado correto da Wiki seja exibido
                if (targetTabId === 'wiki') {
                     const activeWikiButton = document.querySelector('#wiki-content .topic-button.active');
                     if (!activeWikiButton || activeWikiButton.getAttribute('data-topic') === 'all') {
                         renderWikiCards(globalWikiLoadedArticles, true);
                     }
                }
                handleSearch(); // Para aplicar filtros ou restaurar o estado original após a troca
            }
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
