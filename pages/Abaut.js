document.addEventListener('DOMContentLoaded', () => {
    const musicModal = document.getElementById('music-modal');
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let progressInterval = null;

    // Navegação de Abas
    document.querySelectorAll('.tab-item, .top-tab-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const isSub = btn.classList.contains('top-tab-item');
            const group = isSub ? '.top-tab-item, .sub-section' : '.tab-item, .tab-section';
            const targetId = isSub ? btn.dataset.sub : btn.dataset.target;
            
            document.querySelectorAll(group).forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Modal Criador
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('m-name').innerText = d.name;
            document.getElementById('m-bio').innerText = d.bio;
            document.getElementById('m-icon').className = `fas ${d.icon}`;
            
            ['twitter', 'instagram', 'facebook', 'threads'].forEach(s => {
                const link = document.getElementById(`m-${s}`);
                link.href = d[s] || "#";
                link.style.display = (d[s] && d[s] !== "#") ? "flex" : "none";
            });

            document.getElementById('m-music-trigger').onclick = (e) => {
                e.stopPropagation();
                window.openMusicModal(d.music);
            };
            document.getElementById('tt-modal').style.display = 'flex';
        });
    });

    // PLAYER COM FIX DE CONEXÃO (CORS PROXY)
    window.openMusicModal = async (musicString) => {
        if (!musicString) return;
        musicList.innerHTML = '<p style="text-align:center; padding:20px; color:var(--primary);">A carregar trilhas...</p>';
        musicModal.style.display = 'flex';

        const songs = musicString.split(',').map(s => s.trim());
        const proxy = "https://corsproxy.io/?"; 
        
        musicList.innerHTML = '';
        for (const [idx, name] of songs.entries()) {
            try {
                const target = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=song&limit=1`;
                const res = await fetch(proxy + encodeURIComponent(target));
                const data = await res.json();

                if (data.results[0]) {
                    const track = data.results[0];
                    const div = document.createElement('div');
                    div.className = 'music-item';
                    div.innerHTML = `
                        <img src="${track.artworkUrl100}">
                        <div style="flex:1;">
                            <strong style="color:white; font-size:13px;">${track.trackName}</strong><br>
                            <span style="color:#666; font-size:11px;">${track.artistName}</span>
                            <div class="progress-container" id="p-cont-${idx}"><div class="progress-bar" id="p-bar-${idx}"></div></div>
                        </div>
                        <i class="fas fa-play-circle play-btn" onclick="window.playSong('${track.previewUrl}', this, ${idx})"></i>`;
                    musicList.appendChild(div);
                }
            } catch (e) { console.error("Erro ao carregar:", name); }
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
        const container = document.getElementById(`p-cont-${idx}`);
        const bar = document.getElementById(`p-bar-${idx}`);
        container.style.display = 'block';

        progressInterval = setInterval(() => {
            bar.style.width = (currentAudio.currentTime / currentAudio.duration * 100) + '%';
        }, 100);
    };

    window.closeAllModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    window.closeMusicModal = () => { if(currentAudio) currentAudio.pause(); musicModal.style.display = 'none'; };
    window.openNetworkModal = () => document.getElementById('network-modal').style.display = 'flex';

    window.onclick = (e) => { if(e.target.classList.contains('modal-overlay')) window.closeAllModals(); };
});
