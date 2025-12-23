document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const input = document.getElementById('search-input');
    const button = document.getElementById('search-go');
    const containers = document.querySelectorAll('.post-container');

    /* ===============================
       HELPERS
    =============================== */
    function setLoading(msg) {
        containers.forEach(c => {
            c.innerHTML = `
                <div style="padding:40px;text-align:center;color:#666;">
                    <i class="fa-solid fa-spinner fa-spin"></i> ${msg}
                </div>
            `;
        });
    }

    function appendError(msg) {
        containers.forEach(c => {
            c.innerHTML += `
                <p style="text-align:center;color:gray;font-size:13px;">
                    ${msg}
                </p>
            `;
        });
    }

    function clearContainers() {
        containers.forEach(c => c.innerHTML = '');
    }

    /* ===============================
       REDDIT
    =============================== */
    async function fetchReddit(query) {
        try {
            const res = await fetch(
                'https://www.reddit.com/search.json?q=' + encodeURIComponent(query) + '&limit=10&sort=relevance',
                {
                    headers: {
                        'User-Agent': 'SocialSearchApp/1.0'
                    }
                }
            );

            if (!res.ok) throw new Error('Reddit indisponível');

            const json = await res.json();

            if (!json || !json.data || !Array.isArray(json.data.children)) {
                throw new Error('Formato inválido do Reddit');
            }

            return json.data.children
                .map(c => c.data)
                .filter(d =>
                    d &&
                    d.title &&
                    d.permalink &&
                    d.title !== '[deleted]' &&
                    d.title !== '[removed]'
                )
                .map(d => ({
                    source: 'Reddit',
                    icon: 'fa-brands fa-reddit-alien',
                    text: d.title,
                    link: 'https://www.reddit.com' + d.permalink,
                    meta: 'r/' + d.subreddit,
                    score: d.score || 0
                }));
        } catch (e) {
            appendError('Reddit não respondeu');
            return [];
        }
    }

    /* ===============================
       HACKER NEWS
    =============================== */
    async function fetchHackerNews(query) {
        try {
            const res = await fetch(
                'https://hn.algolia.com/api/v1/search?query=' + encodeURIComponent(query)
            );

            if (!res.ok) throw new Error('HN indisponível');

            const json = await res.json();

            if (!json || !Array.isArray(json.hits)) {
                throw new Error('Formato inválido do HN');
            }

            return json.hits
                .map(d => ({
                    source: 'Hacker News',
                    icon: 'fa-brands fa-hacker-news',
                    text: d.title || d.story_title,
                    link: d.url || 'https://news.ycombinator.com/item?id=' + d.objectID,
                    meta: 'HN',
                    score: d.points || 0
                }))
                .filter(d => d.text && d.link);
        } catch (e) {
            appendError('Hacker News não respondeu');
            return [];
        }
    }

    /* ===============================
       LOBSTERS
    =============================== */
    async function fetchLobsters(query) {
        try {
            const res = await fetch(
                'https://lobste.rs/search.json?q=' + encodeURIComponent(query)
            );

            if (!res.ok) throw new Error('Lobsters indisponível');

            const json = await res.json();

            if (!Array.isArray(json)) {
                throw new Error('Formato inválido do Lobsters');
            }

            return json
                .filter(d => d && d.title && d.url)
                .map(d => ({
                    source: 'Lobsters',
                    icon: 'fa-solid fa-bug',
                    text: d.title,
                    link: d.url,
                    meta: (d.tags || []).join(', '),
                    score: d.score || 0
                }));
        } catch (e) {
            appendError('Lobsters não respondeu');
            return [];
        }
    }

    /* ===============================
       BUSCA SOCIAL UNIFICADA
    =============================== */
    async function socialSearch(query) {
        setLoading('Buscando nas redes sociais...');

        const results = await Promise.all([
            fetchReddit(query),
            fetchHackerNews(query),
            fetchLobsters(query)
        ]);

        const merged = results
            .flat()
            .sort(function (a, b) {
                return b.score - a.score;
            });

        if (!merged.length) {
            containers.forEach(c => {
                c.innerHTML = `
                    <p style="padding:40px;text-align:center;color:gray;">
                        Nenhum resultado social encontrado
                    </p>
                `;
            });
            return;
        }

        renderCards(merged);
    }

    /* ===============================
       RENDERIZAÇÃO
    =============================== */
    function renderCards(items) {
        const html = items.map(d => `
            <article class="card">
                <div class="card-icon">
                    <i class="${d.icon}"></i>
                </div>
                <div class="card-body">
                    <span class="tag">${d.source} • ${d.meta}</span>
                    <p class="card-text">${d.text}</p>
                    <a href="${d.link}" target="_blank" rel="noopener noreferrer" class="btn-more">
                        Abrir <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </article>
        `).join('');

        containers.forEach(c => c.innerHTML = html);
    }

    /* ===============================
       EVENTOS
    =============================== */
    function executeSearch() {
        const q = input.value.trim();
        if (q.length < 2) return;
        clearContainers();
        socialSearch(q);
    }

    if (button) button.onclick = executeSearch;

    if (input) {
        input.onkeypress = function (e) {
            if (e.key === 'Enter') executeSearch();
        };
    }

});
