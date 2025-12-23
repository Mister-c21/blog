document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const ENGINES = {
        internal: { name: 'Interno', icon: 'fa-wand-magic-sparkles', color: '#8A2BE2', url: null },
        google: { name: 'Google', icon: 'fa-brands fa-google', color: '#4285F4', url: 'https://www.google.com/search?q=' },
        youtube: { name: 'YouTube', icon: 'fa-brands fa-youtube', color: '#FF0000', url: 'https://www.youtube.com/results?search_query=' },
        reddit: { name: 'Reddit', icon: 'fa-brands fa-reddit-alien', color: '#FF4500', url: 'https://www.reddit.com/search/?q=' }
    };

    let state = { tab: 0, engine: 'reddit', category: 'all' };

    const slider = document.getElementById('feed-slider');
    const indicatorContainer = document.querySelector('.tab-indicator-container');
    const input = document.getElementById('search-input');
    const modal = document.getElementById('engine-modal');
    const containers = document.querySelectorAll('.post-container');

    // --- FUNÇÃO PARA BUSCAR NO REDDIT ---
    async function fetchReddit(query = '') {
        containers.forEach(c => c.innerHTML = '<div style="padding:50px; text-align:center; color:#FF4500;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando Reddit...</div>');

        try {
            // Se não houver query, usamos o subreddit LifeProTips (dicas de vida)
            let url = query 
                ? `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=15`
                : `https://www.reddit.com/r/LifeProTips/hot.json?limit=15`;

            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Falha na resposta da API');
            
            const json = await response.json();
            const posts = json.data.children.map(child => ({
                text: child.data.title,
                link: `https://reddit.com${child.data.permalink}`,
                cat: 'reddit',
                subreddit: child.data.subreddit
            }));

            renderCards(posts);
        } catch (error) {
            console.error("Erro Reddit:", error);
            containers.forEach(c => c.innerHTML = `<p style="padding:50px; text-align:center; color:gray;">Erro ao carrerar dados do Reddit.<br><small>${error.message}</small></p>`);
        }
    }

    // --- RENDERIZAÇÃO DE CARDS ---
    function renderCards(items) {
        const html = items.map(d => `
            <article class="card">
                <div class="card-icon">
                    <i class="${d.cat === 'reddit' ? 'fa-brands fa-reddit-alien' : 'fa-solid fa-lightbulb'}"></i>
                </div>
                <div class="card-body">
                    <span class="tag" style="${d.cat === 'reddit' ? 'color:#FF4500; background:rgba(255,69,0,0.1);' : ''}">${d.cat === 'reddit' ? 'r/' + d.subreddit : d.cat}</span>
                    <p class="card-text">${d.text}</p>
                    <a href="${d.link}" target="_blank" class="btn-more">
                        Ver detalhes <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </article>
        `).join('');

        containers.forEach(c => {
            c.innerHTML = html || '<p style="padding:50px; text-align:center; color:gray;">Nenhum resultado encontrado.</p>';
        });
    }

    // --- FUNÇÕES DE INTERFACE ---
    function updateEngineUI(key) {
        const conf = ENGINES[key];
        const iconEl = document.getElementById('active-engine-icon');
        const nameEl = document.getElementById('active-engine-name');
        
        if (iconEl) iconEl.className = `${conf.icon.includes('brands') ? 'fa-brands' : 'fa-solid'} ${conf.icon}`;
        if (nameEl) nameEl.innerText = conf.name;
        
        document.body.style.setProperty('--accent', conf.color);
        document.querySelectorAll('.engine-item').forEach(item => {
            item.classList.toggle('active', item.dataset.engine === key);
        });
    }

    function executeSearch() {
        const val = input.value.trim();
        if (state.engine === 'reddit') {
            fetchReddit(val);
        } else if (state.engine === 'internal') {
            // Caso queira voltar para os dados locais do seu Dicas_dados.js
            if (typeof DICAS_DATA !== 'undefined') {
                const filtered = DICAS_DATA.filter(d => d.text.toLowerCase().includes(val.toLowerCase()));
                renderCards(filtered);
            }
        } else if (val) {
            window.open(ENGINES[state.engine].url + encodeURIComponent(val), '_blank');
        }
    }

    // --- EVENT LISTENERS ---
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
    input.onkeypress = (e) => { if (e.key === 'Enter') executeSearch(); };

    // --- SETUP INICIAL ---
    updateEngineUI('reddit');
    fetchReddit(); // Carrega o Reddit padrão ao abrir

});
