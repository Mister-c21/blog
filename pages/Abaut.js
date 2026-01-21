document.addEventListener('DOMContentLoaded', () => {
    let currentAudio = null;
    let progressInterval = null;

    // --- REFRESH TRANSLATION HELPER ---
    // Função para avisar a API que novos textos foram inseridos dinamicamente
    const refreshTranslation = () => {
        const select = document.querySelector('select.goog-te-combo');
        if (select) select.dispatchEvent(new Event('change'));
    };

    // --- 1. SISTEMA DE ABAS ---
    const setupTabs = () => {
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.dataset.target;
                const targetSection = document.getElementById(targetId);
                if (targetSection) targetSection.classList.add('active');
            });
        });
    };

    // --- 2. MODAL DO CRIADOR ---
    const setupCreatorCards = () => {
        const cards = document.querySelectorAll('.creator-card');
        const modal = document.getElementById('tt-modal');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const d = card.dataset;
                document.getElementById('m-name').innerText = d.name || "Membro LoreSpace";
                document.getElementById('m-bio').innerText = d.bio || "";
                document.getElementById('m-icon').className = `fas ${d.icon || 'fa-user'}`;
                
                ['twitter', 'instagram', 'facebook', 'threads'].forEach(s => {
                    const el = document.getElementById(`m-${s}`);
                    if (el) {
                        if (d[s] && d[s] !== "#") {
                            el.href = d[s];
                            el.style.display = "flex";
                        } else {
                            el.style.display = "none";
                        }
                    }
                });

                const musicBtn = document.getElementById('m-music-trigger');
                if (musicBtn) {
                    musicBtn.onclick = (e) => {
                        e.stopPropagation();
                        window.openMusicModal(d.music);
                    };
                }
                modal.style.display = 'flex';
                // Garante que a bio seja traduzida se o modal abrir
                setTimeout(refreshTranslation, 100);
            });
        });
    };

    // --- 3. SISTEMA DE MÚSICA (iTunes JSONP) ---
    window.openMusicModal = (musicString) => {
        if (!musicString) return;
        const musicModal = document.getElementById('music-modal');
        const musicList = document.getElementById('music-list');
        
        musicList.innerHTML = `<div style="text-align:center; padding:30px;"><i class="fas fa-compact-disc fa-spin" style="color:var(--primary); font-size:30px;"></i><p style="margin-top:10px; color:#888;">Sintonizando frequências...</p></div>`;
        musicModal.style.display = 'flex';

        const queries = musicString.split(',').map(s => s.trim()).filter(s => s !== "");
        musicList.innerHTML = ''; 

        queries.forEach((query, idx) => {
            const callbackName = `loreCallback_${Date.now()}_${idx}`;
            window[callbackName] = (data) => {
                if (data.results && data.results[0]) renderTrack(data.results[0], idx);
                delete window[callbackName];
            };
            const script = document.createElement('script');
            script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1&callback=${callbackName}`;
            document.body.appendChild(script);
            script.onload = () => script.remove();
        });
    };

    function renderTrack(track, idx) {
        const musicList = document.getElementById('music-list');
        const div = document.createElement('div');
        div.className = 'music-item';
        div.innerHTML = `
            <img src="${track.artworkUrl100}" alt="Capa">
            <div style="flex:1; overflow:hidden;">
                <b style="font-size:13px; color:var(--ghost); display:block; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.trackName}</b>
                <small style="color:#666;">${track.artistName}</small>
                <div class="progress-container" id="p-cont-${idx}"><div class="progress-bar" id="p-bar-${idx}"></div></div>
            </div>
            <i class="fas fa-play-circle play-btn" onclick="window.playSong('${track.previewUrl}', this, ${idx})"></i>`;
        musicList.appendChild(div);
    }

    window.playSong = (url, btn, idx) => {
        if (currentAudio) {
            currentAudio.pause();
            clearInterval(progressInterval);
            document.querySelectorAll('.play-btn').forEach(i => i.className = 'fas fa-play-circle play-btn');
            document.querySelectorAll('.progress-container').forEach(c => c.style.display = 'none');
            if (currentAudio.src === url) { currentAudio = null; return; }
        }
        currentAudio = new Audio(url);
        currentAudio.play();
        btn.className = 'fas fa-pause-circle play-btn';
        const pCont = document.getElementById(`p-cont-${idx}`);
        const pBar = document.getElementById(`p-bar-${idx}`);
        pCont.style.display = 'block';
        progressInterval = setInterval(() => {
            if (currentAudio && !currentAudio.paused) {
                const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
                pBar.style.width = percent + '%';
            }
        }, 100);
        currentAudio.onended = () => {
            btn.className = 'fas fa-play-circle play-btn';
            pCont.style.display = 'none';
            clearInterval(progressInterval);
        };
    };

    // --- 4. UTILITÁRIOS ---
    window.closeMusicModal = () => {
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
        clearInterval(progressInterval);
        document.getElementById('music-modal').style.display = 'none';
    };
    window.closeAllModals = () => {
        document.querySelectorAll('.modal-overlay, .music-overlay').forEach(m => m.style.display = 'none');
        window.closeMusicModal();
    };
    window.openNetworkModal = () => {
        const netModal = document.getElementById('network-modal');
        if (netModal) netModal.style.display = 'flex';
    };
    window.onclick = (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.id === 'music-modal') window.closeAllModals();
    };

    setupTabs();
    setupCreatorCards();
});
