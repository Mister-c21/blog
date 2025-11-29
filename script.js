//========================================================================
// VARIÁVEIS DE CONFIGURAÇÃO DO DOM
//========================================================================

// Elementos DOM
const newsListContainer = document.getElementById('news-list-container'); 
const newsLoadingIndicator = document.getElementById('news-loading');
const mainSearchInput = document.getElementById('main-search-input'); 
const loadMoreButton = document.getElementById('load-more-news'); 
const tabButtons = document.querySelectorAll('.tab-button');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

// NOVO: Elementos do Toggle de Busca
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

// Elementos de Conteúdo do Modal
const youtubeVideosList = document.getElementById('youtube-videos-list');
const relatedSitesList = document.getElementById('related-sites-list'); 
const socialEmbedsList = document.getElementById('social-embeds-list'); 

// VARIÁVEIS GLOBAIS
let globalNewsFullTopicList = []; 
let globalNewsLoadedArticles = []; 
let globalNewsTopicCache = {}; 
let currentNewsArticleIndex = 0; 

// CONSTANTES DE PAGINAÇÃO
const INITIAL_LOAD_COUNT = 15; 
const LOAD_INCREMENT = 12; 

// DADOS SIMULADOS DE CONTEÚDO RELACIONADO
const YOUTUBE_VIDEO_IDS = {
    all: ["QY8_e9g7l6k", "mqqZ4lR2M3k", "dQw4w9WgXcQ"], 
    movies: ["QY8_e9g7l6k", "hPrf5JqGqJ0", "j-fWif3tH5g"], 
    series: ["tgbNymZ7vqY", "4tQ-y2XlU6M", "mqqZ4lR2M3k"], 
    relationship: ["4tQ-y9XlV7X", "n0pZ3yG9fR2", "mqqZ4lR2M3k"], 
    work: ["tgbNymZ7vqY", "j-fWif3tH5g", "QY8_e9g7l6k"], 
};

// LISTA DE SITES RELACIONADOS (simulação de fontes)
const RELATED_SITES = {
    all: [
        { name: "The Movie DB News", url: "https://www.themoviedb.org/" },
        { name: "IGN Brasil", url: "https://br.ign.com/" },
        { name: "Tech Tudo", url: "https://www.techtudo.com.br/" }
    ],
    movies: [
        { name: "Rotten Tomatoes (Revisão)", url: "https://www.rottentomatoes.com/" },
        { name: "Deadline Hollywood", url: "https://deadline.com/" }
    ],
    series: [
        { name: "TV Line", url: "https://tvline.com/" },
        { name: "Series Hub", url: "https://fakeserieshub.com/" }
    ],
    relationship: [
        { name: "Fandom Psychology", url: "https://fakepsychology.com/" },
        { name: "Community Forum (Discussão)", url: "https://fakeforum.com/" }
    ],
    work: [
        { name: "Forbes Geek", url: "https://www.forbes.com/" },
        { name: "LinkedIn Post (Developer)", url: "https://www.linkedin.com/" }
    ]
};

// DADOS SIMULADOS DE EMBEDS SOCIAIS REAIS (Códigos de incorporação reais simulados)
const SIMULATED_SOCIAL_EMBEDS = {
    all: [], // Preenchido com a concatenação
    
    twitter: [
        { 
            type: 'twitter', 
            embedCode: `<blockquote class="twitter-tweet" data-dnt="true"><p lang="pt" dir="ltr">Essa revelação no final da série foi de cair o queixo! 🤯 Não acredito que a FanWiki acertou de novo. A teoria do Gato de Schrödinger se aplica totalmente aqui. Quem mais ficou assim? #FanWikiNews #MindBlown</p>&mdash; Fã Número Um (@FanNumeroUm) <a href="https://twitter.com/FanNumeroUm/status/1785461123456789012?ref_src=twsrc%5Etfw">1 de Maio de 2025</a></blockquote>`
        },
        { 
            type: 'twitter', 
            embedCode: `<blockquote class="twitter-tweet" data-dnt="true"><p lang="pt" dir="ltr">Vazou o conceito de arte do novo personagem! 🐉 Parece que a inspiração veio direto da mitologia nórdica. FanWiki, precisamos de um artigo sobre o background dele JÁ! #FantasyArt #FanWiki</p>&mdash; Arte Geek (@ArteGeek) <a href="https://twitter.com/ArteGeek/status/1785461123456789013?ref_src=twsrc%5Etfw">2 de Maio de 2025</a></blockquote>`
        },
        { 
            type: 'twitter', 
            embedCode: `<blockquote class="twitter-tweet" data-dnt="true"><p lang="pt" dir="ltr">Acabei de assistir ao trailer e estou sem palavras. A cinematografia é impecável. Se o filme for 10% do que o trailer promete, será o evento do ano. 🚀🍿</p>&mdash; Crítico Nerd (@CriticoNerd) <a href="https://twitter.com/CriticoNerd/status/1785461123456789014?ref_src=twsrc%5Etfw">3 de Maio de 2025</a></blockquote>`
        }
    ],
    
    reddit: [
        { 
            type: 'reddit', 
            embedCode: `<iframe sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-modals" height="420" width="100%" scrolling="no" allowfullscreen frameborder="0" src="https://embed.reddit-resource.com/widgets/f12e1a3c-b17f-4b0d-b4a1-8d2a6a111a11/embed?embed=true"></iframe>`
        },
        { 
            type: 'reddit', 
            embedCode: `<iframe sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-modals" height="420" width="100%" scrolling="no" allowfullscreen frameborder="0" src="https://embed.reddit-resource.com/widgets/e9b6a7d2-4e2b-4d92-9c4c-3a3f8c8d8b8a/embed?embed=true"></iframe>`
        },
        { 
            type: 'reddit', 
            embedCode: `<iframe sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-modals" height="420" width="100%" scrolling="no" allowfullscreen frameborder="0" src="https://embed.reddit-resource.com/widgets/c7d3c0b1-3e4f-4a0e-a5b6-7c7d7e6f6e6d/embed?embed=true"></iframe>`
        }
    ]
};

// Concatena todos os posts para a aba 'all'
SIMULATED_SOCIAL_EMBEDS.all = [
    ...SIMULATED_SOCIAL_EMBEDS.twitter, 
    ...SIMULATED_SOCIAL_EMBEDS.reddit
].sort(() => Math.random() - 0.5); // Mistura a ordem

//========================================================================
// FUNÇÕES DE UTILIDADE PARA UX (SIDEBAR)
//========================================================================

function isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
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
        // Restaura o scroll do body apenas se o modal principal não estiver aberto
        if (!newsModal.classList.contains('open')) {
            document.body.style.overflow = 'auto';
        }
    }
}

function setupSidebarEvents() {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    if (menuToggleBtn) {
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
        link.addEventListener('click', () => {
             if (!isDesktop()) closeSidebar();
        });
    });
    
    window.addEventListener('resize', () => {
        if (isDesktop()) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// ========================================================================
// MODAL FULLSCREEN LÓGICA (COM ANTI-VAZAMENTO)
// ========================================================================

/**
 * Cria a URL de busca do Google News baseada no título.
 * @param {string} title - O título da notícia.
 * @returns {string} A URL completa do Google News.
 */
function createGoogleNewsUrl(title) {
    const query = encodeURIComponent(title);
    // URL de busca do Google News, buscando por notícias sobre o título, em PT-BR
    return `https://news.google.com/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
}


/**
 * Abre o modal e preenche com os dados da notícia.
 * @param {object} article - O objeto de notícia completo.
 */
function openModal(article) {
    // 1. Preenche o conteúdo da notícia
    modalTitle.textContent = article.title;
    modalSubtitle.innerHTML = `<i class="fas fa-tag"></i> **${article.category}** | <i class="fas fa-clock"></i> ${new Date().toLocaleDateString('pt-BR')} | **Fonte:** ${article.source}`;
    
    modalImage.src = article.imageUrl;
    modalImage.alt = article.title;
    
    modalText.innerHTML = `
        <p><strong>${article.excerpt.replace('...', '')}</strong> A notícia completa traz detalhes exclusivos sobre os bastidores da produção e a reação do elenco. O diretor, em uma fala emocionante, disse que este é o trabalho de sua vida e que espera que o público receba a reviravolta de braços abertos.</p>
        <p>A FanWiki teve acesso a documentos internos que sugerem que a mudança no cânone era planejada desde a primeira temporada (ou filme). A complexidade do desenvolvimento do personagem exigiu que a equipe tomasse decisões difíceis, mas que, no final, garantiram a integridade da história. Detalhes sobre a narrativa e a construção de mundo são profundos, com menções a antigos mitos e lendas que inspiraram a trama.</p>
        <p>Ainda não há informações sobre possíveis sequências ou spin-offs, mas a recepção inicial do público e da crítica já é extremamente positiva, indicando um sucesso estrondoso. A venda de produtos licenciados e a popularidade nas redes sociais dispararam desde o anúncio, consolidando a obra como um fenômeno cultural. Continue acompanhando a FanWiki para mais atualizações sobre este e outros tópicos!</p>
    `;
    
    // Define o link para a busca do Google News
    modalOriginalLink.href = createGoogleNewsUrl(article.title);
    
    // 2. Renderiza os vídeos relacionados ao tópico da notícia
    const topicKey = article.category.toLowerCase();
    renderYouTubeVideos(topicKey); 
    
    // 3. Renderiza os sites relacionados ao tópico da notícia
    renderRelatedSites(topicKey);

    // 4. Renderiza e configura o feed social (Inicialmente 'all')
    renderSocialEmbeds('all');
    setupSocialEmbedEvents(); 
    
    // 5. Abre o modal
    newsModal.classList.add('open');
    // CHAVE ANTI-VAZAMENTO: Impede o scroll do corpo da página
    document.body.style.overflow = 'hidden'; 
}

function closeModal() {
    newsModal.classList.remove('open');
    // CHAVE ANTI-VAZAMENTO: Restaura o scroll do corpo da página, a menos que a sidebar esteja aberta (no mobile)
    if (!sidebar.classList.contains('open')) {
        document.body.style.overflow = 'auto';
    }
}

function setupModalEvents() {
    modalCloseBtn.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newsModal.classList.contains('open')) {
            closeModal();
        }
    });
    
    // Fechar ao clicar fora (no fundo escurecido)
    newsModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-fullscreen')) {
            closeModal();
        }
    });
}

// ========================================================================
// LÓGICA DO FEED DE VÍDEOS E SITES
// ========================================================================

/**
 * Renderiza a lista horizontal de vídeos do YouTube baseada no tópico.
 * @param {string} topic - O tópico da notícia (ex: 'movies', 'series').
 */
function renderYouTubeVideos(topic) {
    youtubeVideosList.innerHTML = ''; // Limpa o container
    
    // Normaliza o tópico e usa 'all' como fallback
    const normalizedTopic = topic.toLowerCase();
    const videoIds = YOUTUBE_VIDEO_IDS[normalizedTopic] || YOUTUBE_VIDEO_IDS['all'];
    
    videoIds.forEach(videoId => {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container');
        
        // Estrutura de iframe incorporado para proporção 16:9
        videoContainer.innerHTML = `
            <div class="video-responsive">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    title="Vídeo relacionado a ${topic}"
                    loading="lazy">
                </iframe>
            </div>
        `;
        
        youtubeVideosList.appendChild(videoContainer);
    });
}

/**
 * Renderiza a lista de sites relacionados baseada no tópico.
 * @param {string} topic - O tópico da notícia (ex: 'movies', 'series').
 */
function renderRelatedSites(topic) {
    relatedSitesList.innerHTML = ''; // Limpa o container
    
    const normalizedTopic = topic.toLowerCase();
    
    // Concatena a lista de sites do tópico específico com a lista 'all' para mais diversidade
    const specificSites = RELATED_SITES[normalizedTopic] || [];
    const generalSites = RELATED_SITES['all'] || [];
    
    // Filtra duplicatas antes de concatenar (simulação)
    const allSitesMap = new Map();
    [...specificSites, ...generalSites].forEach(site => allSitesMap.set(site.name, site));
    
    const sitesToRender = Array.from(allSitesMap.values());

    sitesToRender.forEach(site => {
        const listItem = document.createElement('li');
        
        // Cria um link com ícone e texto
        listItem.innerHTML = `
            <a href="${site.url}" target="_blank" rel="noopener noreferrer">
                <span>${site.name}</span>
                <i class="fas fa-external-link-alt"></i>
            </a>
        `;
        relatedSitesList.appendChild(listItem);
    });
}

// ========================================================================
// LÓGICA DO FEED SOCIAL (TWITTER/X & REDDIT)
// ========================================================================

/**
 * Renderiza a lista horizontal de embeds sociais baseada no filtro.
 * @param {string} filterKey - A chave do filtro ('all', 'twitter', 'reddit').
 */
function renderSocialEmbeds(filterKey) {
    socialEmbedsList.innerHTML = ''; // Limpa o container
    
    const embedsToRender = SIMULATED_SOCIAL_EMBEDS[filterKey] || SIMULATED_SOCIAL_EMBEDS['all'];
    
    if (embedsToRender.length === 0) {
        socialEmbedsList.innerHTML = `<p style="color: var(--text-color-muted); padding: 10px; width: 100%;">Nenhum post social encontrado para este filtro.</p>`;
        return;
    }
    
    embedsToRender.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('social-embed-item');
        itemContainer.setAttribute('data-type', item.type);
        
        // Adiciona o código de embed fornecido (HTML, blockquote, iframe, etc.)
        itemContainer.innerHTML = item.embedCode;
        
        socialEmbedsList.appendChild(itemContainer);
    });
    
    // Tenta re-renderizar os widgets do Twitter após a inserção no DOM
    if (typeof window.twttr !== 'undefined' && typeof window.twttr.widgets !== 'undefined') {
        window.twttr.widgets.load(socialEmbedsList);
    }
    
    // Tenta re-renderizar os embeds do Reddit após a inserção no DOM
    // O script do Reddit usa o método getElementsByClassName(list) para renderizar embeds
    if (typeof window.rwt !== 'undefined' && typeof window.rwt.getElementsByClassName !== 'undefined') {
        window.rwt.getElementsByClassName(socialEmbedsList);
    }
}

/**
 * Configura os ouvintes de evento para os botões de filtro social no modal.
 */
function setupSocialEmbedEvents() {
    const socialTabButtons = document.querySelectorAll('.social-tab-button');
    
    // Remove listeners antigos para evitar duplicação (o modal é reutilizado)
    socialTabButtons.forEach(button => {
        button.removeEventListener('click', handleSocialTabClick);
    });

    // Adiciona os novos listeners
    socialTabButtons.forEach(button => {
        button.addEventListener('click', handleSocialTabClick);
    });

    // Função interna para manipulação do clique
    function handleSocialTabClick(e) {
        const filter = e.currentTarget.getAttribute('data-filter');
        
        // Remove a classe 'active' de todos e adiciona ao clicado
        socialTabButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Renderiza o novo conteúdo filtrado
        renderSocialEmbeds(filter);
    }
}


//========================================================================
// NEWS FEED: DADOS SIMULADOS E LÓGICA DE RENDERIZAÇÃO
//========================================================================

// Array simples de URLs de imagem aleatórias para simulação
const simulatedImageUrls = [
    'https://picsum.photos/seed/tech/800/450',
    'https://picsum.photos/seed/fantasy/800/450',
    'https://picsum.photos/seed/scifi/800/450',
    'https://picsum.photos/seed/space/800/450',
    'https://picsum.photos/seed/movie/800/450',
    'https://picsum.photos/seed/gaming/800/450',
    'https://picsum.photos/seed/hero/800/450',
    'https://picsum.photos/seed/series/800/450'
];

function getRandomImageUrl(topic) {
    // Seleciona uma imagem baseada em um hash simples (para manter a consistência em um tópico)
    const topicHash = topic.charCodeAt(0) % simulatedImageUrls.length;
    return simulatedImageUrls[topicHash];
}


// Função simulada para buscar conteúdo de notícia (AGORA COM IMAGEM)
function fetchNewsData(topic) {
    return new Promise(resolve => {
        setTimeout(() => {
            const newsItem = {
                title: `${topic}: A Revelação Bombástica na Conclusão da Saga!`,
                excerpt: `A equipe de produção confirmou em entrevista exclusiva que a cena final do novo filme (ou série) de ${topic} mudará para sempre o cânone. Fãs especulam se o personagem principal sobreviverá ou se teremos um novo anti-herói. O lançamento está marcado para a próxima semana.`,
                pageUrl: `https://fakenewsurl.com/${topic.toLowerCase().replace(/\s/g, '-')}`,
                source: "FanWiki - Última Hora",
                category: topic, 
                imageUrl: getRandomImageUrl(topic) // URL da imagem simulada
            };
            resolve(newsItem);
        }, 50); 
    });
}


// Dados de Notícias Simulados (Títulos para gerar o conteúdo)
const newsTopicMap = {
    all: [
        "O Despertar da Força", "Nova Série de Vampiros", "Ataque dos Titãs Final", "O Feitiço da Lua", "O Ladrão de Almas", 
        "Desenvolvimento do Novo RPG", "Trailer Inesperado", "Game Con de Londres", "O Retorno do Mago", "Filosofia Geek", 
        "HQs Clássicas", "Anúncio Surpresa Netflix", "Novo Livro de Fantasia", "Entrevista com o Autor", "Ecologia Distópica", 
        "Convenção de Cosplay", "Dieta dos Super-Heróis", "Saúde do Gamer", "Teoria da Conspiração", "Crescimento do Fandom", 
        "App de Leitura", "E-sports no Brasil", "Streamer da Semana", "Guia de Mods", "O Legado de Tolkien",
        "Trabalho Híbrido", "Economia dos Quadrinhos", "Empreendedorismo Fan", "Marketing de Jogos", "Ciberpunk 2077",
        "Inteligência Artificial na Arte", "NFTs de Colecionáveis", "Vazamento de Dados", "Ética de Vilões", "Futuro dos Games",
        "Realidade Virtual", "Design de Personagens", "Métodos de Storytelling", "Resenha de Filme B", "Melhor Anime da Temporada"
    ],
    movies: [
        "Bilheteria do Fim de Semana", "Exclusivo: Diretor Fala", "Nova Data de Lançamento", "Cortes do Estúdio", "Roteiro Vingativo",
        "Fotografia Espacial", "Montagem de Ação", "Neo-western", "Cinema Coreano", "Filme de Super-Herói",
        "Documentário de Jogo", "Curta de Terror", "Filme Noir Atual", "Ficção Científica Clássica", "Drama de Época",
        "Comédia com Robôs", "Suspense Político", "Mistério Russo", "Western no Espaço", "Musical de Fantasia",
        "Animação 3D", "Gênero de Invasão", "Trilogia Revisitada", "Ator do Ano", "Prêmios do Oscar Geek",
        "Estética Cyberpunk", "Crítica do Mês", "História da Marvel", "Cinema Africano", "Cinema Oriental",
        "Cineclubes Online", "Streaming de Terror", "Edição de Vídeo", "Direção de Fotografia",
        "Narrativa Interativa", "Fã-made", "Efeitos Práticos", "Filme Pós-apocalíptico", "Cinema Alemão"
    ],
    series: [
        "Série Dramática da HBO", "Série de Ficção Científica da Amazon", "Série de Crime", "Websérie do Youtube", "Minissérie do FX",
        "Showrunner Polêmico", "Produção Indígena", "Escrita para Streaming", "Novas Plataformas", "Televisão Bizarra",
        "Série de Comédia Stand-Up", "Suspense Nórdico", "Série Policial Britânica", "Série de Fantasia Urbana", "Série Histórica Viking",
        "Série de Anime Clássica", "Novela Mexicana", "Sitcom dos Anos 90", "Série Antológica de Horror", "Piloto Vazado",
        "Temporada Final", "Melhor Episódio", "Reação ao Cliffhanger", "Spin-off Anunciado", "Reboot dos Power Rangers",
        "Adaptação de HQ", "Cultura Fandom", "Fandom Tóxico", "Audiência Recorde", "Críticas Positivas",
        "Distribuição Global", "Televisão a Cabo", "Serviços de IPTV", "Documentário Serial", "Série Teen",
        "Desenho Adulto", "Transmissão Interativa", "Narrativa de Jogos", "Televisão Experimental", "Impacto Cultural"
    ],
    relationship: [
        "Relacionamento em RPGs", "Comunicação com NPCs", "Assertividade de Personagens", "Inteligência Emocional dos Elfos", "Empatia em Grupos",
        "Amizade Geek", "Amor em Distopias", "Relacionamento entre Fãs", "Monogamia em Séries", "Poliamor na Ficção",
        "Relacionamento Abusivo na Série X", "Conflito de Guildas", "Mediação Online", "Terapia de Casal Geek", "Psicoterapia e Jogos",
        "Família de Aventureiros", "Parentalidade Nerd", "Criação de Monstros", "Limites de Poder", "Codependência de Duplas",
        "Linguagem Corporal de Dragões", "Escuta Ativa do Mestre", "Habilidades Sociais em Eventos", "Autoconhecimento por Avatares", "Autoestima do Personagem",
        "Vulnerabilidade de Vilões", "Ciúme na Equipe", "Perdão de Antagonistas", "Gratidão do Fandom", "Luto por Personagens",
        "Psicologia e Ficção", "Vínculo com o Cosplay", "Comunicação em Chats", "Interação em MMOs", "Conexão em Jogos",
        "Relacionamento com o Mentor", "Casamento Fictício", "Divórcio de Heróis", "Dating Apps Nerds", "Solidão do Vilão"
    ],
    work: [
        "Home Office e Games", "Gestão do Tempo e Lazer", "Fluxo de Trabalho de Streamers", "Produtividade com Foco", "Organização do Setup",
        "Liderança em Clãs", "Trabalho em Equipe e Raids", "Comunicação de Equipe", "Cultura de Estúdio", "Motivação do Desenvolvedor",
        "Satisfação no Jogo", "Ergonomia para Gamers", "Saúde Ocupacional de E-sports", "Burnout do Dev", "Equilíbrio Jogo-Vida",
        "Carreira de Caster", "Desenvolvimento de Talentos", "Recrutamento de Beta-Testers", "Entrevista para Estúdio", "Networking em Eventos",
        "Freelancer de Arte Digital", "Nomadismo Geek", "Startup de Jogos", "Inovação em Hardware", "Design de Interfaces",
        "Metodologia Ágil em HQs", "Scrum em Desenvolvimento", "Kanban para Conteúdo", "Gestão de Projetos de Fansub", "Inteligência de Tendências",
        "Finanças de Jogos", "Contabilidade de Streamer", "Marketing de Influência", "Vendas de Merchandising", "Negociação de Direitos",
        "Direito Autoral", "Regulamentação de Games", "Ética em Mods", "Microempreendedor Digital", "Economia de Colecionáveis"
    ]
};


/**
 * Renderiza uma porção dos artigos/notícias no DOM.
 */
function renderNewsCards(articles, clear = true) {
    if (clear) {
        newsListContainer.innerHTML = '';
    }

    if (articles.length === 0 && clear) {
        newsListContainer.innerHTML = `
            <div class="news-card" style="text-align: center; padding: 20px; color: var(--accent-color);">
                <i class="fas fa-info-circle"></i> Nenhuma notícia encontrada.
            </div>
        `;
        loadMoreButton.style.display = 'none';
        return;
    }
    
    const fragment = document.createDocumentFragment();

    articles.forEach((item) => {
        const newsCard = document.createElement('article');
        newsCard.classList.add('news-card'); 
        
        const shortExcerpt = item.excerpt && item.excerpt.length > 150 
            ? item.excerpt.substring(0, 150) + '...' 
            : item.excerpt || "Nenhum resumo disponível.";
        
        const dateString = new Date().toLocaleDateString('pt-BR');
        
        // Estrutura com imagem no topo
        newsCard.innerHTML = `
            <div class="news-card-image-container">
                <img src="${item.imageUrl}" alt="Imagem de ${item.title}">
            </div>
            <div class="news-card-content">
                <h3>${item.title}</h3>
                <p style="font-size: 0.8em; color: var(--text-color-muted); margin-bottom: 5px;">
                    <i class="fas fa-tag"></i> **${item.category}** | <i class="fas fa-clock"></i> ${dateString} | **Fonte:** ${item.source}
                </p>
                <p>${shortExcerpt}</p>
                <a href="#" class="read-more-link" data-title="${item.title}">Continuar lendo &rarr;</a>
            </div>
        `;
        
        // Função para encontrar o artigo completo na lista global pelo título
        const findArticle = (title) => globalNewsFullTopicList.find(a => a.title === title);
        
        // 1. Ouve o clique no link "Continuar lendo"
        newsCard.querySelector('.read-more-link').addEventListener('click', (e) => {
            e.preventDefault(); 
            const articleTitle = e.target.getAttribute('data-title');
            const articleToOpen = findArticle(articleTitle);
            if(articleToOpen) openModal(articleToOpen);
        });

        // 2. Ouve o clique no CARD inteiro (para melhor UX)
        newsCard.addEventListener('click', (e) => {
             // Evita que cliques no link "Continuar lendo" disparem este evento duas vezes
             if (!e.target.closest('.read-more-link')) {
                 const articleToOpen = findArticle(item.title);
                 if(articleToOpen) openModal(articleToOpen);
             }
        });
        
        fragment.appendChild(newsCard);
    });
    
    newsListContainer.appendChild(fragment);
    updateLoadMoreButtonVisibility();
}

function updateLoadMoreButtonVisibility() {
    const totalArticles = globalNewsFullTopicList.length;
    
    // O botão 'Carregar Mais' só aparece se o campo de busca estiver vazio E não estiver no modo Google
    if (mainSearchInput.value.trim() === '' && !searchToggle.checked && currentNewsArticleIndex < totalArticles) {
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none';
    }
}

async function loadAndRenderInitialNewsContent(topicKey) {
    const topicsToFetch = newsTopicMap[topicKey] || newsTopicMap['all'];
    
    if (globalNewsTopicCache[topicKey]) {
        globalNewsFullTopicList = globalNewsTopicCache[topicKey];
    } else {
        newsListContainer.innerHTML = '';
        newsLoadingIndicator.style.display = 'block';
        loadMoreButton.style.display = 'none';
        
        const fetchPromises = topicsToFetch.map(topic => fetchNewsData(topic));
        const results = await Promise.all(fetchPromises);
        
        globalNewsTopicCache[topicKey] = results;
        globalNewsFullTopicList = results;
        newsLoadingIndicator.style.display = 'none';
    }
    
    currentNewsArticleIndex = 0;
    loadMoreArticles(INITIAL_LOAD_COUNT, true);
}

function loadMoreArticles(count = LOAD_INCREMENT, isInitialLoad = false) {
    const startIndex = currentNewsArticleIndex;
    const endIndex = Math.min(startIndex + count, globalNewsFullTopicList.length);
    
    if (startIndex >= endIndex) return;

    const articlesToAdd = globalNewsFullTopicList.slice(startIndex, endIndex);

    if (isInitialLoad) {
        globalNewsLoadedArticles = articlesToAdd;
        renderNewsCards(articlesToAdd, true); 
    } else {
        renderNewsCards(articlesToAdd, false); 
        globalNewsLoadedArticles.push(...articlesToAdd);
    }
    
    currentNewsArticleIndex = endIndex;
    updateLoadMoreButtonVisibility();
}


function searchNewsContent(term) {
    const lowerCaseTerm = term.toLowerCase();
    loadMoreButton.style.display = 'none';

    if (lowerCaseTerm === '') {
        const activeNewsButton = document.querySelector('#news-content .topic-button.active');
        const activeTopic = activeNewsButton ? activeNewsButton.getAttribute('data-topic') : 'all';
        
        if (activeTopic !== 'all') {
            loadAndRenderInitialNewsContent(activeTopic);
        } else {
            renderNewsCards(globalNewsLoadedArticles, true);
            updateLoadMoreButtonVisibility();
        }
        return;
    }

    const filteredArticles = globalNewsFullTopicList.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(lowerCaseTerm);
        const excerptMatch = article.excerpt.toLowerCase().includes(lowerCaseTerm);
        return titleMatch || excerptMatch;
    });

    renderNewsCards(filteredArticles, true);
}

function setupNewsTopicFilters() {
    document.querySelectorAll('#news-content .topic-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const topic = e.currentTarget.getAttribute('data-topic');
            
            document.querySelectorAll('#news-content .topic-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            mainSearchInput.value = '';
            loadAndRenderInitialNewsContent(topic);
        });
    });
    
    loadMoreButton.addEventListener('click', () => {
        loadMoreArticles(LOAD_INCREMENT, false);
    });
}


//========================================================================
// NOVO: LÓGICA DO TOGGLE DE BUSCA/FILTRO
//========================================================================

/**
 * Atualiza o placeholder, o ícone e a cor do ícone da barra de pesquisa 
 * com base no estado do toggle.
 */
function updateSearchUI() {
    const isGoogleMode = searchToggle.checked;
    
    if (isGoogleMode) {
        mainSearchInput.placeholder = "Pesquisar no Google News...";
        // CHAVE: Remove classe de filtro e adiciona de Google
        searchModeIcon.classList.remove('fa-filter');
        searchModeIcon.classList.add('fa-google');
        searchModeIcon.style.color = '#4285F4'; // Azul do Google
    } else {
        mainSearchInput.placeholder = "Filtrar notícias locais";
        // CHAVE: Remove classe de Google e adiciona de filtro
        searchModeIcon.classList.remove('fa-google');
        searchModeIcon.classList.add('fa-filter');
        searchModeIcon.style.color = 'var(--text-color-muted)'; // Cor padrão
        
        // Se voltar para o modo filtro, re-executa o filtro local (se houver texto)
        handleSearch(); 
    }
    updateLoadMoreButtonVisibility(); // Atualiza a visibilidade do botão de carregar mais
}

/**
 * Lida com o evento de pressionar Enter no campo de busca.
 * Se estiver no modo Google, redireciona. Senão, executa a busca local.
 * @param {Event} e 
 */
function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        const searchTerm = mainSearchInput.value.trim();
        const isGoogleMode = searchToggle.checked;

        if (searchTerm === '') {
            return; // Não faz nada se o campo estiver vazio
        }

        if (isGoogleMode) {
            e.preventDefault(); // Evita qualquer comportamento padrão extra
            
            const googleQueryUrl = createGoogleNewsUrl(searchTerm);
            // Abre o resultado da busca em uma nova aba
            window.open(googleQueryUrl, '_blank'); 

            // Limpa o campo após a busca no Google
            mainSearchInput.value = '';

        } else {
            // Se estiver no modo Filtro, simplesmente executa o filtro local
            // (que já é disparado pelo evento 'input', mas é bom ter uma redundância)
            handleSearch(); 
        }
    }
}


//========================================================================
// LÓGICA DE BUSCA GLOBAL E INICIALIZAÇÃO
//========================================================================

function handleSearch() {
    const searchTerm = mainSearchInput.value.trim();
    const activeTabButton = document.querySelector('.content-tabs .tab-button.active');
    const activeTab = activeTabButton ? activeTabButton.getAttribute('data-tab') : null;
    
    // CHAVE: Sai se estiver no modo Google (pois o Enter fará a busca no Google)
    if (searchToggle.checked) {
        return; 
    }
    
    if (activeTab === 'news') {
        searchNewsContent(searchTerm);
    }
}

function setupSearch() {
    // 1. Ouve a digitação (continua a fazer a filtragem local em tempo real)
    // Ouve apenas se NÃO estiver no modo Google
    mainSearchInput.addEventListener('input', () => {
        if (!searchToggle.checked) {
            handleSearch();
        }
    });

    // 2. Ouve o evento de tecla para capturar o "Enter" (para o modo Google)
    mainSearchInput.addEventListener('keydown', handleSearchKeydown);
    
    // 3. Ouve a mudança no toggle switch (para alternar a UI e o modo)
    searchToggle.addEventListener('change', updateSearchUI);
    
    // Inicializa a UI com o estado padrão (checked=false, i.e. Filtro Local)
    searchToggle.checked = false; 
    updateSearchUI();
}


function setupTabNavigation() {
    const tabContents = document.querySelectorAll('.tab-content');

    const initialTabButton = document.querySelector('[data-tab="news"]'); 
    if (initialTabButton) initialTabButton.classList.add('active');
    document.getElementById('news-content').classList.add('active');

    // Carrega o conteúdo inicial
    loadAndRenderInitialNewsContent('all'); 

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.tagName === 'A') return; 
            
            const targetTabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            if (button.tagName === 'BUTTON' && targetTabId) {
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                
                document.getElementById(targetTabId + '-content').classList.add('active');
                mainSearchInput.value = '';

                if (targetTabId === 'news') {
                    document.querySelectorAll('#news-content .topic-button').forEach(btn => btn.classList.remove('active'));
                    document.querySelector('#news-content .topic-button[data-topic="all"]').classList.add('active');
                    
                    loadAndRenderInitialNewsContent('all');
                }
            }
        });
    });
}


// Inicialização Principal
document.addEventListener('DOMContentLoaded', () => {
    
    setupTabNavigation();
    setupNewsTopicFilters();
    setupSearch(); 
    setupSidebarEvents(); 
    setupModalEvents(); 
});
