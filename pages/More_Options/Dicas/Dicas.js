document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const input = document.getElementById('search-input');
    const button = document.getElementById('search-go');
    const containers = document.querySelectorAll('.post-container');

    /* ===============================
       UTIL
    =============================== */
    function showLoading(msg) {
        containers.forEach(c => {
            c.innerHTML = `
                <div style="padding:40px;text-align:center;color:#666;">
                    <i class="fa-solid fa-spinner fa-spin"></i> ${msg}
                </div>
            `;
        });
    }

    function showError(msg) {
        containers.forEach(c => {
            c.innerHTML += `
                <p style="text-align:center;color:#999;font-size:13px;">
                    ${msg}
                </p>
            `;
        });
    }

    /* ===============================
       REDDIT (FUNCIONAL)
    =============================== */
    async function fetchReddit(query) {
        try {
            const res = await fetch(
                'https://www.reddit.com/search.json?q=' +
                encodeURIComponent(query) +
                '&limit=10&sort=relevance',
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 SocialSearch'
                    }
                }
            );

            if (!res.ok) throw new Error('Reddit bloqueou');

            const json = await res.json();

            if (!json?.data?.children) return [];

            return json.data.children
                .map(c => c.data)
                .filter(d => d && d.title && d.permalink)
                .map(d => ({
                    source: 'Reddit',
                    icon: 'fa-brands fa-reddit-alien',
                    text: d.title,
                    link: 'https://www.reddit.com' + d.permalink,
                    meta: 'r/' + d.subreddit,
                    score: d.score || 0
                }));
        } catch (e) {
            showError('Reddit indisponível');
            return [];
        }
    }

    /* ===============================
       HACKER NEWS (FUNCIONAL)
    =============================== */
    async function fetchHackerNews(query) {
        try {
            const res = await fetch(
                'https://hn.algolia.com/api/v1/search?query=' +
                encodeURIComponent(query)
            );

            if (!res.ok) throw new Error('HN erro');

            const json = await res.json();

            if (!Array.isArray(json.hits)) return [];

            return json.hits
                .filter(d => d.title || d.story_title)
                .map(d => ({
                    source: 'Hacker News',
                    icon: 'fa-brands fa-hacker-news',
                    text: d.title || d.story_title,
                    link: d.url || 'https://news.ycombinator.com/item?id=' + d.objectID,
                    meta: 'HN',
                    score: d.points || 0
                }));
        } catch (e) {
            showError('Hacker News indisponível');
            return [];
        }
    }

    /* ===============================
       BUSCA SOCIAL
    =============================== */
    async function socialSearch(query) {
        showLoading('Buscando conteúdo social...');

        const reddit = await fetchReddit(query);
        const hn = await fetchHackerNews(query);

        const merged = reddit.concat(hn).sort((a, b) => b.score - a.score);

        if (!merged.length) {
            containers.forEach(c => {
                c.innerHTML = `
                    <p style="padding:40px;text-align:center;color:#999;">
                        Nenhum resultado encontrado
                    </p>
                `;
            });
            return;
        }

        renderCards(merged);
    }

    /* ===============================
       RENDER
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
                    <a href="${d.link}" target="_blank" class="btn-more">
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
        socialSearch(q);
    }

    button.onclick = executeSearch;
    input.onkeypress = function (e) {
        if (e.key === 'Enter') executeSearch();
    };

});
