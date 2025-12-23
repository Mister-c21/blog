(function() {
    'use strict';

    const ENGINES = {
        internal: { name: 'Interno', icon: 'fa-wand-magic-sparkles', color: '#8A2BE2', url: null },
        google: { name: 'Google', icon: 'fa-brands fa-google', color: '#4285F4', url: 'https://www.google.com/search?q=' },
        youtube: { name: 'YouTube', icon: 'fa-brands fa-youtube', color: '#FF0000', url: 'https://www.youtube.com/results?search_query=' },
        reddit: { name: 'Reddit', icon: 'fa-brands fa-reddit-alien', color: '#FF4500', url: 'https://www.reddit.com/search/?q=' }
    };

    // 1. ALTERAÇÃO: Definir estado inicial como 'reddit'
    let state = { tab: 0, engine: 'reddit', category: 'all' };

    const CAT_ICONS = {
        games: 'fa-gamepad',
        tech: 'fa-microchip',
        culinaria: 'fa-utensils',
        vida: 'fa-leaf',
        reddit: 'fa-brands fa-reddit-alien'
    };

    const slider = document.getElementById('feed-slider');
    const indicatorContainer = document.querySelector('.tab-indicator-container');
    const input = document.getElementById('search-input');
    const modal = document.getElementById('engine-modal');

    // --- FUNÇÃO PARA BUSCAR NO REDDIT ---
    async function fetchReddit(query) {
        const containers = document.querySelectorAll('.post-container');
        containers.forEach(c => c.innerHTML = '<div class="loading-shimmer" style="padding:50px; text-align:center; color:var(--primary);"><i class="fa-solid fa-circle-notch fa-spin"></i> Buscando no Reddit...</div>');

        try {
            // Se não houver busca, traz posts do r/LifeProTips (melhor para "Dicas")
            const endpoint = query 
                ? `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=15`
                : `https://www.reddit.com/r/LifeProTips/hot.json?limit=15`;

            const response = await fetch(endpoint);
            const data = await response.json();
            
            const posts = data.data.children.map(child => ({
                text: child.data.title,
                link: `https://reddit.com${child.data.permalink}`,
                cat: 'reddit'
            }));

            renderCards(posts);
        } catch (error) {
            containers.forEach(c => c.innerHTML = '<p style="padding:50px; text-align:center; color:red;">Erro ao conectar com a API do Reddit.</p>');
        }
    }

    // --- RENDERIZAÇÃO ---
    function renderCards(items) {
        const html = items.map(d => `
            <article class="card">
                <div class="card-icon">
                    <i class="${d.cat === 'reddit' ? 'fa-brands fa-reddit-alien' : 'fa-solid ' + (CAT_ICONS[d.cat] || 'fa-lightbulb')}"></i>
                </div>
                <div class="card-body">
                    <span class="tag" style="background:${d.cat === 'reddit' ? 'rgba(255,69,0,0.1)' : ''}; color:${d.cat === 'reddit' ? '#FF4500' : ''}">${d.cat}</span>
                    <p class="card-text">${d.text}</p>
                    <a href="${d.link}" target="_blank" class="btn-more">
                        Ler no Reddit <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </article>
        `).join('') || `<p style="padding:50px; text-align:center; color:gray;">Nenhuma dica encontrada.</p>`;

        document.querySelectorAll('.post-container').forEach(c => c.innerHTML = html);
    }

    function renderInternal() {
        const query = input.value.toLowerCase();
        const filtered = DICAS_DATA.filter(d => {
            const matchQ = d.text.toLowerCase().includes(query);
            const matchC = state.category === 'all' || d.cat === state.category;
            return matchQ && matchC;
        });
        renderCards(filtered);
    }

    // --- LÓGICA DE INTERFACE ---
    function updateEngineUI(key) {
        const conf = ENGINES[key];
        document.getElementById('active-engine-icon').className = `${conf.icon.includes('brands') ? 'fa-brands' : 'fa-solid'} ${conf.icon}`;
        document.getElementById('active-engine-name').innerText = conf.name;
        document.body.style.setProperty('--accent', conf.color);
        
        document.querySelectorAll('.engine-item').forEach(i => {
            i.classList.toggle('active', i.dataset.engine === key);
        });
    }

    function executeSearch() {
        if (state.engine === 'reddit') fetchReddit(input.value.trim());
        else if (state.engine === 'internal') renderInternal();
        else if (input.value.trim()) window.open(ENGINES[state.engine].url + encodeURIComponent(input.value.trim()), '_blank');
    }

    // --- INICIALIZAÇÃO E EVENTOS ---
    document.getElementById('engine-btn').onclick = () => modal.classList.add('open');
    document.querySelector('.modal-close').onclick = () => modal.classList.remove('open');

    document.querySelectorAll('.engine-item').forEach(item => {
        item.onclick = () => {
            state.engine = item.dataset.engine;
            updateEngineUI(state.engine);
            modal.classList.remove('open');
            executeSearch();
        };
    });

    document.getElementById('search-go').onclick = executeSearch;
    input.onkeyup = (e) => { 
        if (e.key === 'Enter') executeSearch();
        else if (state.engine === 'internal') renderInternal();
    };

    // 2. ALTERAÇÃO: Configurar UI inicial e disparar busca do Reddit
    updateEngineUI('reddit');
    fetchReddit(''); 
    
    // Funções de Tab
    function setTab(idx) {
        state.tab = idx;
        slider.style.transform = `translateX(-${idx * 50}%)`;
        indicatorContainer.style.transform = `translateX(${idx * 100}%)`;
    }
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => setTab(parseInt(btn.dataset.tab));
    });

})();
