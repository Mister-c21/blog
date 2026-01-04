document.addEventListener('DOMContentLoaded', () => {
    const musicModal = document.getElementById('music-modal');
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let progressInterval = null;

    // Navegação de Abas
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // Abrir Perfil do Criador
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('m-name').innerText = d.name;
            document.getElementById('m-bio').innerText = d.bio;
            document.getElementById('m-icon').className = `fas ${d.icon}`;
            
            const insta = document.getElementById('m-instagram');
            insta.href = d.instagram || "#";
            insta.style.display = d.instagram ? "flex" : "none";

            document.getElementById('m-music-trigger').onclick = (e) => {
                e.stopPropagation();
                openMusicModal(d.music);
            };
            document.getElementById('tt-modal').style.display = 'flex';
        });
    });

    // REQUISIÇÃO JSON COM PROXY (Definitivo)
    window.openMusicModal = async (musicString) => {
        if (!musicString) return;
        musicList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--primary);"><i class="fas fa-circle-notch fa-spin"></i> Sintonizando...</div>';
        musicModal.style.display = 'flex';

        const songs = musicString.split(',').map(s => s.trim());
        const proxy = "https://corsproxy.io/?"; 
        
        musicList.innerHTML = '';
        
        for (const [idx, name] of songs.entries()) {
            try {
                const targetUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=song&limit=1`;
                // Requisição formatada como JSON via Proxy
                const response = await fetch(proxy + encodeURIComponent(targetUrl));
                const data = await response.json(); // Transformando em JSON

                if (data.results && data.results[0]) {
                    const track = data.results[0];
                    renderTrack(track, idx);
                }
            } catch (err) {
                console.error("Erro na requisição JSON:", err);
            }
        }
    };

    function renderTrack(track, idx) {
        const div = document.createElement('div');
        div.className = 'music-item';
        div.innerHTML = `
            <img src="${track.artworkUrl100}">
            <div style="flex:1;">
                <strong style="color:white; font-size:13px;">${track.trackName}</strong><br>
                <span style="color:#666; font-size:11px;">${track.artistName}</span>
                <div class="progress-container" id="p-cont-${idx}"><div class="progress-bar" id="p-bar-${idx}"></div></div>
            </div>
            <i class="fas fa-play-circle play-btn" onclick="playSong('${track.previewUrl}', this, ${idx})"></i>`;
        musicList.appendChild(div);
    }

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
        
        const container = document.getElementById(`p-cont-${idx}`);
        const bar = document.getElementById(`p-bar-${idx}`);
        container.style.display = 'block';

        progressInterval = setInterval(() => {
            bar.style.width = (currentAudio.currentTime / currentAudio.duration * 100) + '%';
        }, 100);
    };

    window.closeAllModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    window.closeMusicModal = () => { if(currentAudio) currentAudio.pause(); musicModal.style.display = 'none'; };
    
    window.onclick = (e) => { 
        if(e.target.classList.contains('modal-overlay')) closeAllModals(); 
        if(e.target === musicModal) closeMusicModal();
    };
});
