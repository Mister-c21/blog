(function() {
    'use strict';

    const ENGINES = {
        internal: { name: 'Interno', icon: 'fa-wand-magic-sparkles', color: '#8A2BE2', url: null },
        google: { name: 'Google', icon: 'fa-brands fa-google', color: '#4285F4', url: 'https://www.google.com/search?q=' },
        youtube: { name: 'YouTube', icon: 'fa-brands fa-youtube', color: '#FF0000', url: 'https://www.youtube.com/results?search_query=' },
        reddit: { name: 'Reddit', icon: 'fa-brands fa-reddit-alien', color: '#FF4500', url: 'https://www.reddit.com/search/?q=' }
    };

    const CAT_ICONS = {
        games: 'fa-gamepad',
        tech: 'fa-microchip',
        culinaria: 'fa-utensils',
        vida: 'fa-leaf'
    };

    let state = { tab: 0, engine: 'internal', category: 'all' };

    const slider = document.getElementById('feed-slider');
    const indicatorContainer = document.querySelector('.tab-indicator-container');
    const input = document.getElementById('search-input');
    const modal = document.getElementById('engine-modal');

    function setTab(idx) {
        state.tab = idx;
        slider.style.transform = `translateX(-${idx * 50}%)`;
        indicatorContainer.style.transform = `translateX(${idx * 100}%)`;
        document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === idx));
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => setTab(parseInt(btn.dataset.tab));
    });

    document.getElementById('engine-btn').onclick = () => modal.classList.add('open');
    document.querySelector('.modal-close').onclick = () => modal.classList.remove('open');

    document.querySelectorAll('.engine-item').forEach(item => {
        item.onclick = () => {
            const key = item.dataset.engine;
            state.engine = key;
            const conf = ENGINES[key];
            document.getElementById('active-engine-icon').className = `${conf.icon.includes('brands') ? 'fa-brands' : 'fa-solid'} ${conf.icon}`;
            document.getElementById('active-engine-name').innerText = conf.name;
            document.body.style.setProperty('--accent', conf.color);
            document.querySelectorAll('.engine-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            modal.classList.remove('open');
            input.focus();
        };
    });

    function render() {
        const query = input.value.toLowerCase();
        const filtered = DICAS_DATA.filter(d => {
            const matchQ = d.text.toLowerCase().includes(query);
            const matchC = state.category === 'all' || d.cat === state.category;
            return matchQ && matchC;
        });

        const html = filtered.map(d => `
            <article class="card">
                <div class="card-icon">
                    <i class="fa-solid ${CAT_ICONS[d.cat] || 'fa-lightbulb'}"></i>
                </div>
                <div class="card-body">
                    <span class="tag">${d.cat}</span>
                    <p class="card-text">${d.text}</p>
                    <a href="${d.link}" target="_blank" class="btn-more">
                        Ver detalhes <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </article>
        `).join('') || `<p style="padding:50px; text-align:center; color:gray; font-size:14px;">Nenhuma dica interna encontrada.</p>`;

        document.querySelectorAll('.post-container').forEach(c => c.innerHTML = html);
    }

    document.querySelectorAll('.chip').forEach(chip => {
        chip.onclick = () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.category = chip.dataset.cat;
            render();
        };
    });

    function executeSearch() {
        const val = input.value.trim();
        if (!val) return;
        if (state.engine === 'internal') {
            render();
        } else {
            window.open(ENGINES[state.engine].url + encodeURIComponent(val), '_blank');
        }
    }

    document.getElementById('search-go').onclick = executeSearch;
    input.onkeyup = (e) => {
        if (e.key === 'Enter') executeSearch();
        else if (state.engine === 'internal') render();
    };

    render();
    setTab(0);
})();
