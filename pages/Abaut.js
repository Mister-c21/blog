document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('tt-modal');
    const musicModal = document.getElementById('music-modal');
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let progressInterval = null;

    // Alternar Abas Principais (Criadores / Comunidade)
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.target);
            if(target) target.classList.add('active');
        });
    });

    // Alternar Sub-Abas da Comunidade
    document.querySelectorAll('.top-tab-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.top-tab-item, .sub-section').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const subTarget = document.getElementById(btn.dataset.sub);
            if(subTarget) subTarget.classList.add('active');
        });
    });

    // Abrir Perfil do Criador
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            
            document.getElementById('m-name').innerText = d.name;
            document.getElementById('m-bio').innerText = d.bio;
            document.getElementById('m-icon').className = `fas ${d.icon}`;
            
            // Atribuir Links Sociais (Reddit foi removido daqui)
            document.getElementById('m-twitter').href = d.twitter || "#";
            document.getElementById('m-instagram').href = d.instagram || "#";
            document.getElementById('m-facebook').href = d.facebook || "#";
            document.getElementById('m-threads').href = d.threads || "#";
            
            // Esconde botões vazios
            const socialLinks = ['m-twitter', 'm-instagram', 'm-facebook', 'm-threads'];
            socialLinks.forEach(id => {
                const el = document.getElementById(id);
                el.style.display = (el.getAttribute('href') === "#") ? "none" : "flex";
            });

            document.getElementById('m-music-trigger').onclick = (e) => {
                e.stopPropagation();
                window.openMusicModal(d.music);
            };
            
            modal.style.display = 'flex';
        });
    });

    // Modal de Músicas com iTunes API
    window.openMusicModal = async (musicString) => {
        if (!musicString) return;
        const names = musicString.split(',').map(s => s.trim());
        musicList.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Sintonizando frequências...</p>';
        musicModal.style.display = 'flex';

        try {
            const reqs = names.map(n => fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&limit=1&entity=song`).then(r => r.json()));
            const res = await Promise.all(reqs);
            musicList.innerHTML = '';
            
            res.forEach((data, index) => {
                if (data.results && data.results[0]) {
                    const track = data.results[0];
                    const div = document.createElement('div');
                    div.className = 'music-item';
                    div.innerHTML = `
                        <img src="${track.artworkUrl100}">
                        <div style="flex:1;">
                            <strong style="font-size:14px; color:var(--ghost);">${track.trackName}</strong><br>
                            <span style="font-size:11px; color:#666;">${track.artistName}</span>
                            <div class="progress-container" id="prog-cont-${index}">
                                <div class="progress-bar" id="prog-bar-${index}"></div>
                            </div>
                        </div>
                        <i class="fas fa-play-circle play-btn" onclick="window.playPreview('${track.previewUrl}', this, ${index})"></i>
                    `;
                    musicList.appendChild(div);
                }
            });
        } catch (e) { 
            musicList.innerHTML = '<p style="text-align:center; color:red;">Erro na conexão.</p>'; 
        }
    };

    // Controle de Player de Áudio
    window.playPreview = (url, btn, index) => {
        const currentProgCont = document.getElementById(`prog-cont-${index}`);
        const currentBar = document.getElementById(`prog-bar-${index}`);

        if (currentAudio) {
            currentAudio.pause();
            clearInterval(progressInterval);
            document.querySelectorAll('.play-btn').forEach(b => b.className = 'fas fa-play-circle play-btn');
            document.querySelectorAll('.progress-container').forEach(p => p.style.display = 'none');

            if (currentAudio.src === url) {
                currentAudio = null;
                return;
            }
        }

        currentAudio = new Audio(url);
        currentAudio.play();
        btn.className = 'fas fa-pause-circle play-btn';
        currentProgCont.style.display = 'block';

        progressInterval = setInterval(() => {
            if (currentAudio) {
                const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
                currentBar.style.width = percent + '%';
            }
        }, 100);

        currentAudio.onended = () => {
            btn.className = 'fas fa-play-circle play-btn';
            currentProgCont.style.display = 'none';
            clearInterval(progressInterval);
        };
    };

    // Funções de Modal Gerais
    window.openNetworkModal = () => document.getElementById('network-modal').style.display = 'flex';
    window.closeAllModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    window.closeMusicModal = () => {
        if (currentAudio) currentAudio.pause();
        clearInterval(progressInterval);
        musicModal.style.display = 'none';
    };

    window.onclick = (e) => {
        if (e.target.classList.contains('modal-overlay')) window.closeAllModals();
        if (e.target === musicModal) window.closeMusicModal();
    };
});
