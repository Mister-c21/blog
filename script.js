const API_KEY = 'aa199db9b7774c639b8f68779ad3fcb9'; 
let currentPage = 1;
let currentQuery = 'cultura geek';
let currentArticleData = null;

const newsList = document.getElementById('news-list-container');
const loading = document.getElementById('news-loading');
const loadMoreBtn = document.getElementById('load-more-news');
const searchInput = document.getElementById('main-search-input');

// Elementos Modais
const mainModal = document.getElementById('news-modal');
const enginesSubmodal = document.getElementById('engines-submodal');
const videosSubmodal = document.getElementById('videos-submodal');
const suggestionsContainer = document.getElementById('suggestions-container');
const redditContainer = document.getElementById('reddit-container'); // Novo

// Elementos Busca por Voz
const voiceBtn = document.getElementById('voice-search-btn');
const voiceModal = document.getElementById('voice-modal');
const voiceStatus = document.getElementById('voice-status');
const voiceTranscript = document.getElementById('voice-transcript');
const cancelVoiceBtn = document.getElementById('cancel-voice-btn');

async function fetchNews(query, page = 1, append = false) {
    loading.style.display = 'block';
    if (!append) newsList.innerHTML = '';
    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&pageSize=10&page=${page}&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
    try {
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        if (data.articles) {
            renderArticles(data.articles, append);
            loadMoreBtn.style.display = data.articles.length >= 10 ? 'inline-block' : 'none';
        }
    } catch (err) { console.error("Erro ao carregar notícias"); } 
    finally { loading.style.display = 'none'; }
}

function renderArticles(articles, append) {
    articles.forEach(art => {
        if (!art.title || art.title === "[Removed]") return;
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-card-image-container"><img src="${art.urlToImage || 'https://via.placeholder.com/400x200/222/8a2be2?text=LoreSpace'}" alt=""></div>
            <div class="news-card-content">
                <small style="color:var(--primary-color); font-weight:bold;">${art.source.name}</small>
                <h3>${art.title}</h3>
                <p>${art.description || 'Clique para ver mais detalhes.'}</p>
            </div>
        `;
        card.onclick = () => openModal(art);
        newsList.appendChild(card);
    });
}

// Nova Função para Buscar posts do Reddit
async function fetchRedditPosts(title) {
    redditContainer.innerHTML = '<p style="font-size:0.8em; color:var(--text-color-muted); padding:10px;">Buscando discussões...</p>';
    const query = encodeURIComponent(title.split(' ').slice(0, 4).join(' '));
    const url = `https://www.reddit.com/search.json?q=${query}&limit=6&sort=relevance`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        redditContainer.innerHTML = '';

        if (data.data.children && data.data.children.length > 0) {
            data.data.children.forEach(post => {
                const p = post.data;
                const card = document.createElement('div');
                card.className = 'reddit-card';
                card.innerHTML = `
                    <div>
                        <span class="subreddit-name">r/${p.subreddit}</span>
                        <h4>${p.title}</h4>
                    </div>
                    <div class="reddit-stats">
                        <span><i class="fas fa-arrow-up"></i> ${p.ups}</span>
                        <span><i class="fas fa-comment"></i> ${p.num_comments}</span>
                    </div>
                `;
                card.onclick = () => window.open(`https://www.reddit.com${p.permalink}`, '_blank');
                redditContainer.appendChild(card);
            });
        } else {
            redditContainer.innerHTML = '<p style="font-size:0.8em; color:var(--text-color-muted); padding:10px;">Nenhuma discussão encontrada.</p>';
        }
    } catch (err) {
        redditContainer.innerHTML = '<p>Erro ao carregar Reddit.</p>';
    }
}

async function fetchSuggestions(title) {
    suggestionsContainer.innerHTML = '<p style="font-size:0.8em; color:var(--text-color-muted); padding:10px;">Buscando sugestões...</p>';
    const simplifiedQuery = title.split(' ').slice(0, 3).join(' ');
    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(simplifiedQuery)}&language=pt&pageSize=6&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
    try {
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        suggestionsContainer.innerHTML = ''; 
        if (data.articles && data.articles.length > 0) {
            data.articles.forEach(art => {
                if (!art.title || art.title === "[Removed]" || art.title === title) return;
                const div = document.createElement('div');
                div.className = 'suggestion-card';
                div.innerHTML = `<img src="${art.urlToImage || 'https://via.placeholder.com/160x90/222/8a2be2'}" alt=""><h4>${art.title}</h4>`;
                div.onclick = () => { mainModal.scrollTo({ top: 0, behavior: 'smooth' }); openModal(art); };
                suggestionsContainer.appendChild(div);
            });
        } else {
            suggestionsContainer.innerHTML = '<p style="font-size:0.8em; color:var(--text-color-muted); padding:10px;">Sem sugestões no momento.</p>';
        }
    } catch (err) { suggestionsContainer.innerHTML = '<p>Erro ao carregar sugestões.</p>'; }
}

function openModal(art) {
    currentArticleData = art;
    document.getElementById('modal-title').innerText = art.title;
    document.getElementById('modal-subtitle').innerText = `${art.source.name} • ${new Date(art.publishedAt).toLocaleDateString()}`;
    document.getElementById('modal-image').src = art.urlToImage || 'https://via.placeholder.com/800x400/222/8a2be2?text=LoreSpace';
    document.getElementById('modal-text').innerHTML = art.content || art.description || 'Conteúdo indisponível.';
    document.getElementById('modal-original-link').href = art.url;
    const q = encodeURIComponent(art.title);
    
    // Links dos motores de busca
    document.getElementById('link-google').href = `https://www.google.com/search?q=${q}`;
    document.getElementById('link-google-news').href = `https://news.google.com/search?q=${q}`;
    document.getElementById('link-uol').href = `https://noticias.uol.com.br/busca/?q=${q}`;
    document.getElementById('link-naver').href = `https://search.naver.com/search.naver?where=news&query=${q}`;
    document.getElementById('link-baidu').href = `https://www.baidu.com/s?tn=news&word=${q}`;
    
    // Links de vídeo
    document.getElementById('video-youtube').href = `https://www.youtube.com/results?search_query=${q}`;
    document.getElementById('video-naver').href = `https://tv.naver.com/search?query=${q}`;
    document.getElementById('video-google').href = `https://www.google.com/search?q=${q}&tbm=vid`;
    document.getElementById('video-baidu').href = `https://www.baidu.com/sf/vsearch?word=${q}`;
    document.getElementById('video-yandex').href = `https://yandex.com/video/search?text=${q}`;
    
    mainModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Novas chamadas integradas
    fetchSuggestions(art.title);
    fetchRedditPosts(art.title);
}

// LOGICA DE VOZ (ORIGINAL)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    voiceBtn.addEventListener('click', () => recognition.start());
    cancelVoiceBtn.onclick = () => { recognition.stop(); voiceModal.style.display = 'none'; };

    recognition.onstart = () => {
        voiceModal.style.display = 'flex';
        voiceStatus.innerText = "Ouvindo...";
        voiceTranscript.innerText = "";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        voiceTranscript.innerText = `"${transcript}"`;
        voiceStatus.innerText = "Entendi!";
        
        setTimeout(() => {
            searchInput.value = transcript;
            currentQuery = transcript;
            currentPage = 1;
            fetchNews(currentQuery);
            voiceModal.style.display = 'none';
        }, 800);
    };

    recognition.onend = () => {
        setTimeout(() => {
            if (voiceStatus.innerText === "Ouvindo...") voiceModal.style.display = 'none';
        }, 1500);
    };

    recognition.onerror = () => {
        voiceStatus.innerText = "Não consegui ouvir...";
        setTimeout(() => { voiceModal.style.display = 'none'; }, 1500);
    };
}

// EVENTOS DE INTERFACE (ORIGINAL)
document.getElementById('share-news-btn').onclick = async () => {
    if (navigator.share && currentArticleData) {
        try { await navigator.share({ title: currentArticleData.title, text: 'LoreSpace News:', url: currentArticleData.url }); } catch (e) {}
    } else { alert("Link original: " + currentArticleData.url); }
};

document.getElementById('modal-close-btn').onclick = () => { mainModal.style.display = 'none'; document.body.style.overflow = 'auto'; };
document.getElementById('open-engines-submodal').onclick = (e) => { e.stopPropagation(); enginesSubmodal.style.display = 'flex'; };
document.getElementById('open-videos-submodal').onclick = (e) => { e.stopPropagation(); videosSubmodal.style.display = 'flex'; };
document.getElementById('close-engines-submodal').onclick = () => enginesSubmodal.style.display = 'none';
document.getElementById('close-videos-submodal').onclick = () => videosSubmodal.style.display = 'none';

window.onclick = (e) => {
    if (e.target == enginesSubmodal) enginesSubmodal.style.display = 'none';
    if (e.target == videosSubmodal) videosSubmodal.style.display = 'none';
    if (e.target == voiceModal) { voiceModal.style.display = 'none'; }
};

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        currentQuery = searchInput.value;
        currentPage = 1;
        fetchNews(currentQuery);
    }
});

loadMoreBtn.onclick = () => { currentPage++; fetchNews(currentQuery, currentPage, true); };

document.getElementById('menu-toggle-btn').onclick = () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
};

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
}

document.getElementById('close-sidebar-btn').onclick = closeSidebar;
document.getElementById('overlay').onclick = closeSidebar;

// Inicialização
window.onload = () => fetchNews(currentQuery);
