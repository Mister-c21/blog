// =================================================================
// 0. IMPORTAÇÃO DOS DADOS E VARIÁVEIS GLOBAIS
// =================================================================
import { DADOS_DA_WIKI } from './dados.js'; 

let data = DADOS_DA_WIKI; 

const contentRowsContainer = document.getElementById('content-rows');
const searchBar = document.getElementById('search-bar');
const modal = document.getElementById('info-modal');
const closeModalBtn = document.querySelector('.modal-content .close-btn');
const modalBody = document.getElementById('modal-body');

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggleBtn = document.getElementById('menu-toggle-btn');

// NOVAS VARIÁVEIS GLOBAIS PARA O SPOTIFY
const spotifyModal = document.getElementById('spotify-modal');
const closeSpotifyModalBtn = document.querySelector('.close-btn-spotify');
const spotifyPlayerBody = document.getElementById('spotify-player-body');


// =================================================================
// 1. FUNÇÕES DE RENDERIZAÇÃO E BUSCA (CARDS)
// =================================================================

function createCardHTML(item) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = item.id;
    card.title = item.title;

    const imageUrl = item.image || (item.profile ? item.profile.avatarUrl : 'https://i.pravatar.cc/150?u=' + item.id); 
    const detailText = item.profile ? `${item.profile.ocupacao || 'N/A'} | ${item.profile.status || 'N/A'}` : item.category;

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${imageUrl}" alt="${item.title}" class="card-image">
        </div>
        <div class="card-info">
            <h3>${item.title}</h3>
            <span class="card-details">${detailText.toUpperCase()}</span>
        </div>
    `;
    card.addEventListener('click', () => openModal(item));
    return card;
}

function createRowContainer(title, items) {
    const rowContainer = document.createElement('section');
    rowContainer.classList.add('category-row');
    rowContainer.innerHTML = `<h2 class="row-title">${title}</h2>`;
    const cardsList = document.createElement('div');
    cardsList.classList.add('cards-list');
    items.forEach(item => { cardsList.appendChild(createCardHTML(item)); });
    rowContainer.appendChild(cardsList);
    return rowContainer;
}

function groupDataByCategory(dataList) {
    const groups = dataList.reduce((acc, item) => {
        const category = item.category || 'Outros';
        if (!acc[category]) { acc[category] = []; }
        acc[category].push(item);
        return acc;
    }, {});
    
    const categoriesOrder = [
        'Protagonista', 'Anti-Herói', 'Antagonista', 'Aliado', 'Mentor', 
        'Coadjuvante', 'Outros'
    ]; 
    
    const rows = categoriesOrder.map(category => ({
        title: category, 
        category: category,
        items: groups[category] || []
    }));
    
    return rows.filter(row => row.items.length > 0);
}

function renderRowsStandard(dataToRender) {
    contentRowsContainer.innerHTML = '';
    
    if (dataToRender.length === 0) {
        contentRowsContainer.innerHTML = '<h2 style="padding: 50px 20px; text-align: center; color: var(--text-muted);">Nenhum personagem encontrado para sua busca.</h2>';
        return;
    }

    const groupedData = groupDataByCategory(dataToRender);
    
    groupedData.forEach(row => {
        if (row.items.length > 0) {
            const limitedItems = row.items.slice(0, 15);
            contentRowsContainer.appendChild(createRowContainer(`Categoria: ${row.title}`, limitedItems));
        }
    });
}

function applyFiltersAndSearch() {
    if (!data || data.length === 0) {
        contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: red;">Os dados da Wiki estão vazios. Verifique o array DADOS_DA_WIKI no arquivo dados.js.</p>';
        return; 
    }
    
    const searchText = searchBar.value.toLowerCase().trim();
    
    if (searchText.length > 0) {
        const filteredData = data.filter(item => {
            return item.title.toLowerCase().includes(searchText) || 
                   item.category.toLowerCase().includes(searchText) ||
                   (item.profile && item.profile.ocupacao.toLowerCase().includes(searchText));
        });
        
        renderRowsStandard(filteredData);
    } else {
        renderRowsStandard(data);
    }
}

searchBar.addEventListener('input', applyFiltersAndSearch);


// =================================================================
// 2. LÓGICA DA SIDEBAR
// =================================================================

function isDesktop() {
    return window.matchMedia("(min-width: 1025px)").matches;
}

function openSidebar() {
    if (!isDesktop()) {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        document.body.classList.add('no-scroll'); 
    }
}

function closeSidebar() {
    if (!isDesktop()) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        document.body.classList.remove('no-scroll'); 
    }
}

function setupSidebarEvents() {
    menuToggleBtn.addEventListener('click', openSidebar);
    document.getElementById('close-sidebar-btn').addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open') && !isDesktop()) {
            closeSidebar();
        }
    });
    
    window.addEventListener('resize', () => {
        if (isDesktop() && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}


// =================================================================
// 3. BIOGRAFIA LOCAL E ACORDEÃO 
// =================================================================

/**
 * Aplica a lógica de abrir/fechar ao acordeão (chamado após a injeção do HTML).
 */
function setupAcordeonLogic() {
    document.querySelectorAll('.story-acordeon-header').forEach(header => {
        header.addEventListener('click', function() {
            const parentItem = this.closest('.story-acordeon-item');
            const isActive = parentItem.classList.contains('active');
            
            // Fecha todos os outros acordeões abertos
            document.querySelectorAll('.story-acordeon-item.active').forEach(openItem => {
                if (openItem !== parentItem) {
                    openItem.classList.remove('active');
                }
            });

            // Abre ou fecha o item clicado
            if (!isActive) {
                parentItem.classList.add('active');
            } else {
                parentItem.classList.remove('active');
            }
        });
    });
}

/**
 * Cria o HTML do acordeão de história usando o array 'historia' do profile.
 */
function createAcordeonHTML(historiaArray) {
    if (!historiaArray || historiaArray.length === 0) {
        return `
            <div class="content-box profile-main-history">
                <h3><i class="fas fa-book-open"></i> História e Biografia</h3>
                <p style="text-align: center; color: var(--text-muted);">História/Arco do personagem indisponível nos dados locais.</p>
            </div>
        `;
    }

    const itemsHTML = historiaArray.map((item, index) => `
        <div class="story-acordeon-item" data-index="${index}">
            <div class="story-acordeon-header">
                ${item.title}
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="story-acordeon-content">
                <p>${item.content}</p> 
            </div>
        </div>
    `).join('');

    return `
        <div class="content-box profile-main-history">
            <h3><i class="fas fa-book-open"></i> História e Biografia</h3>
            <div>${itemsHTML}</div>
        </div>
    `;
}

// =================================================================
// 4. FUNÇÕES AUXILIARES DE RENDERIZAÇÃO DO MODAL
// =================================================================

function createDetailCarouselItem(label, value, isStatus = false) {
    let content = `<span>${value}</span>`;
    
    if (isStatus) {
        const statusColor = value === 'Vivo' ? 'green' : (value === 'Desconhecido' ? 'orange' : 'red');
        content = `<span><i class="fas fa-circle" style="color: ${statusColor}; font-size: 0.6em; margin-right: 5px;"></i>${value}</span>`;
    }
    
    return `
        <div class="carousel-detail-item">
            <strong>${label}</strong>
            ${content}
        </div>
    `;
}

function createAmigosEFamiliaHTML(amigosArray, familiaArray) {
    const amigosHTML = amigosArray.map(amigo => `
        <div class="list-item">
            <span class="name">${amigo.name}</span>
            <a href="${amigo.link || '#'}" class="detail" ${amigo.link ? 'target="_blank"' : ''}>${amigo.username || 'Perfil'}</a>
        </div>
    `).join('');

    const familiaHTML = familiaArray.map(membro => `
        <div class="list-item">
            <span class="name">${membro.name}</span>
            <span class="detail">${membro.parentesco}</span>
        </div>
    `).join('');
    
    const amigosBlock = `
        <div class="content-box profile-sidebar-amigos">
            <h3><i class="fas fa-user-friends"></i> Amigos</h3>
            ${amigosHTML || '<p class="detail">Nenhum amigo listado.</p>'}
        </div>
    `;
    const familiaBlock = `
        <div class="content-box profile-sidebar-familia">
            <h3><i class="fas fa-heart"></i> Família</h3>
            ${familiaHTML || '<p class="detail">Nenhum membro da família listado.</p>'}
        </div>
    `;

    return amigosBlock + familiaBlock;
}

function createLinksExternosHTML(linksArray) {
    if (!linksArray || linksArray.length === 0) {
        return '';
    }

    const linksHTML = linksArray.map(link => `
        <a href="${link.url}" target="_blank" class="profile-link-item" title="${link.description || link.title}">
            <i class="${link.iconClass || 'fas fa-link'}"></i> ${link.title}
        </a>
    `).join('');

    return `
        <div class="profile-links-container">
            ${linksHTML}
        </div>
    `;
}

function createYouTubePostsHTML(postsArray) {
    if (!postsArray || postsArray.length === 0) {
        return '';
    }

    const postsHTML = postsArray.map(post => `
        <div class="video-post-item">
            <h4><i class="fab fa-youtube"></i> ${post.title}</h4>
            <div class="video-iframe-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${post.id}" 
                    title="${post.title}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `).join('');

    return `
        <div class="content-box youtube-posts-container">
            <h3><i class="fas fa-video"></i> Postagens de Vídeo</h3>
            ${postsHTML}
        </div>
    `;
}


// =================================================================
// 5. LÓGICA DO SPOTIFY
// =================================================================

function openSpotifyModal(trackId, characterName) {
    if (!trackId) {
        spotifyPlayerBody.innerHTML = `<p style="text-align: center; padding: 20px; color: var(--text-muted);">Música de perfil não configurada para ${characterName}.</p>`;
    } else {
        // URL de embed do Spotify com o track ID
        // Nota: A URL real deve ser algo como: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`
        // A sintaxe usada abaixo está sendo mantida do código anterior, mas a URL deve ser verificada.
        const iframeSrc = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
        
        spotifyPlayerBody.innerHTML = `
            <iframe 
                src="${iframeSrc}" 
                width="100%" 
                height="352" 
                frameborder="0" 
                allowtransparency="true" 
                allow="encrypted-media">
            </iframe>
        `;
    }

    spotifyModal.style.display = 'block';
}

function closeSpotifyModal() {
    spotifyModal.style.display = 'none';
    // Limpa o player para evitar que continue tocando em segundo plano
    spotifyPlayerBody.innerHTML = `<p style="text-align: center; padding: 20px; color: var(--text-color);">Carregando prévia do Spotify...</p>`;
}

// =================================================================
// 6. FUNÇÃO openModal (PRINCIPAL) - COM BIOGRAFIA LOCAL
// =================================================================

function openModal(item) {
    const profile = item.profile;
    
    if (!profile) {
         modalBody.innerHTML = `<div style="padding: 20px;"><h2>Erro de Perfil</h2><p>O item "${item.title}" não possui dados de perfil.</p></div>`;
        modal.style.display = 'block';
        document.body.classList.add('no-scroll'); 
        return;
    }

    modal.style.display = 'block';
    document.body.classList.add('no-scroll'); 
    
    const defaultAvatarUrl = 'https://i.pravatar.cc/150?u=' + item.id;
    const defaultBannerUrl = 'https://picsum.photos/900/250?random=' + item.id;
    
    // 1. Cria o HTML da História/Biografia usando o campo 'historia' local.
    const historyHTML = createAcordeonHTML(profile.historia || []);

    // 2. Renderiza todo o conteúdo estático, incluindo a biografia
    modalBody.innerHTML = `
        <div class="profile-container">
            
            <div class="profile-header-social">
                <img src="${profile.bannerUrl || defaultBannerUrl}" alt="Banner de Perfil" class="profile-banner">
                <div class="profile-avatar-box">
                    <img src="${profile.avatarUrl || defaultAvatarUrl}" alt="Foto de Perfil de ${item.title}" class="profile-avatar">
                </div>
                ${profile.spotifyTrackId ? 
                    '<button class="music-button" id="music-profile-btn" title="Ouvir Música do Perfil"><i class="fas fa-music"></i></button>' 
                    : ''
                }
            </div>

            <div class="profile-info-main">
                <div class="profile-name-username-container">
                    <h2 class="profile-name-title">${item.title}</h2>
                    <span class="profile-username">${profile.username || `@${item.title.replace(/\s/g, '')}`}</span>
                </div>
                
                <p class="profile-bio">"${profile.bio || 'Biografia não informada.'}"</p>
                
                ${createLinksExternosHTML(profile.links)} 
                
                <div class="profile-details-carousel">
                    ${createDetailCarouselItem('Status', profile.status || 'N/A', true)}
                    ${createDetailCarouselItem('Espécie', profile.especie || 'Desconhecida')}
                    ${createDetailCarouselItem('Ocupação', profile.ocupacao || 'N/A')}
                    ${createDetailCarouselItem('Localização', profile.localidade || 'Desconhecida')}
                    ${createDetailCarouselItem('Tipo', item.category || 'Outros')}
                    ${createDetailCarouselItem('Primeira Aparição', profile.primeiraAparicao || 'N/A')}
                </div>
                
            </div>

            <div class="profile-content-wrapper">
                <div class="profile-sidebar">
                    ${createAmigosEFamiliaHTML(profile.amigos || [], profile.familia || [])}
                </div>
                <div class="profile-main-content">
                    ${createYouTubePostsHTML(profile.youtubePosts || [])}
                    
                    ${historyHTML}
                </div>
            </div>
        </div>
    `;

    // 3. Adiciona o listener ao botão de música
    const musicButton = document.getElementById('music-profile-btn');
    if (musicButton) {
        musicButton.addEventListener('click', () => openSpotifyModal(profile.spotifyTrackId, item.title));
    }
    
    // 4. Ativa a lógica do acordeão (agora com o conteúdo local)
    setupAcordeonLogic();
}


// =================================================================
// 7. EVENTOS DE FECHAMENTO E INICIALIZAÇÃO
// =================================================================

function closeModal() {
    modalBody.innerHTML = ''; 
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll'); 
}

closeModalBtn.addEventListener('click', closeModal);

// Evento de fechar o modal do Spotify
closeSpotifyModalBtn.addEventListener('click', closeSpotifyModal);

window.addEventListener('click', (event) => { 
    if (event.target === modal) { 
        closeModal(); 
    } 
    // Garante que o modal do Spotify feche se clicado fora dele
    if (event.target === spotifyModal) { 
        closeSpotifyModal(); 
    }
});

document.addEventListener('keydown', (event) => { 
    if (event.key === 'Escape') { 
        if (spotifyModal.style.display === 'block') { 
            closeSpotifyModal(); // Prioriza fechar o modal de música se estiver aberto
        } else if (modal.style.display === 'block') { 
            closeModal(); 
        } 
    } 
});

function checkDataLoad() {
    if (data && data.length > 0) { return true; } 
    contentRowsContainer.innerHTML = '<p style="padding: 100px; text-align: center; color: red;">Os dados da Wiki estão vazios. Verifique o array DADOS_DA_WIKI no arquivo dados.js.</p>';
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    setupSidebarEvents();
    if (checkDataLoad()) {
        applyFiltersAndSearch();
    }
});
