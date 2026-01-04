document.addEventListener('DOMContentLoaded', () => {
    let currentAudio = null;
    let progressInterval = null;

    // Tabs
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // Abrir Card
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('m-name').innerText = d.name;
            document.getElementById('m-bio').innerText = d.bio;
            document.getElementById('m-icon').className = `fas ${d.icon}`;
            
            document.getElementById('m-music-trigger').onclick = (e) => {
                e.stopPropagation();
                openMusicModal(d.music);
            };
            document.getElementById('tt-modal').style.display = 'flex';
        });
    });

    // FUNÇÃO DE MÚSICA REVISADA (JSON + PROXY ALLORIGINS)
    window.openMusicModal = async (musicString) => {
        const musicList = document.getElementById('music-list');
        const musicModal = document.getElementById('music-modal');
        
        musicList.innerHTML = '<p style="color:#8a2be2; padding:20px;">Buscando frequências...</p>';
        musicModal.style.display = 'flex';

        const queries = musicString.split(',').map(s => s.trim());
        musicList.innerHTML = '';

        for (const [idx, query] of queries.entries()) {
            try {
                // AllOrigins ajuda a burlar o bloqueio de conexão direta
                const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

                const response = await fetch(proxyUrl);
                const container = await response.json();
                const data = JSON.parse(container.contents); // Transforma o conteúdo string em JSON real

                if (data.results && data.results[0]) {
                    const track = data.results[0];
                    const item = document.createElement('div');
                    item.className = 'music-item';
                    item.innerHTML = `
                        <img src="${track.artworkUrl100}">
                        <div style="flex:1; overflow:hidden;">
                            <b style="font-size:12px; white-space:nowrap;">${track.trackName}</b><br>
                            <small style="color:#666;">${track.artistName}</small>
                            <div class="progress-container" id="p-cont-${idx}"><div class="progress-bar" id="p-bar-${idx}"></div></div>
                        </div>
                        <i class="fas fa-play-circle play-btn" onclick="playSong('${track.previewUrl}', this, ${idx})"></i>
                    `;
                    musicList.appendChild(item);
                }
            } catch (err) {
                console.error("Erro ao carregar música:", query);
            }
        }
    };

    window.playSong = (url, btn, idx) => {
        if (currentAudio) {
            currentAudio.pause();
            clearInterval(progressInterval);
            document.querySelectorAll('.play-btn').forEach(b => b.className = 'fas fa-play-circle play-btn');
            document.querySelectorAll('.progress-container').forEach(c => c.style.display = 'none');
            if (currentAudio.src === url) { currentAudio = null; return; }
        }

        currentAudio = new Audio(url);
        currentAudio.play();
        btn.className = 'fas fa-pause-circle play-btn';
        
        const bar = document.getElementById(`p-bar-${idx}`);
        document.getElementById(`p-cont-${idx}`).style.display = 'block';

        progressInterval = setInterval(() => {
            bar.style.width = (currentAudio.currentTime / currentAudio.duration * 100) + '%';
        }, 100);
    };

    window.closeAllModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    window.closeMusicModal = () => {
        if(currentAudio) { currentAudio.pause(); currentAudio = null; }
        document.getElementById('music-modal').style.display = 'none';
    };

    window.onclick = (e) => { if(e.target.className.includes('overlay')) closeAllModals(); };
});
