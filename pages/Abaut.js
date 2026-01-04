document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('tt-modal');
    const musicModal = document.getElementById('music-modal');
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let progressInterval = null;

    // Gerenciador de Abas Principais
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.target);
            if (target) target.classList.add('active');
        });
    });

    // Gerenciador de Sub-Abas (Comunidade)
    document.querySelectorAll('.top-tab-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.top-tab-item, .sub-section').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const subTarget = document.getElementById(btn.dataset.sub);
            if (subTarget) subTarget.classList.add('active');
        });
    });

    // Configuração do Modal do Criador
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('m-name').innerText = d.name || "Criador";
            document.getElementById('m-bio').innerText = d.bio || "";
            document.getElementById('m-icon').className = `fas ${d.icon || 'fa-user'}`;
            
            const socials = ['twitter', 'instagram', 'facebook', 'threads'];
            socials.forEach(s => {
                const link = document.getElementById(`m-${s}`);
                if (link) {
                    link.href = d[s] && d[s] !== "#" ? d[s] : "#";
                    link.style.display = (d[s] && d[s] !== "#") ? "flex" : "none";
                }
            });

            const trigger = document.getElementById('m-music-trigger');
            trigger.onclick = (e) => {
                e.stopPropagation();
                window.openMusicModal(d.music);
            };
            modal.style.display = 'flex';
        });
    });

    // Player de Música com Tratamento de Erro de API
    window.openMusicModal = async (musicString) => {
        if (!musicString) return;
        musicList.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin" style="color:var(--primary); font-size:24px;"></i><p style="margin-top:10px; color:#888;">Sintonizando frequências...</p></div>';
        musicModal.style.display = 'flex';

        const names = musicString.split(',').map(s => s.trim());
        
        try {
            // Usamos HTTPS explicitamente e um seletor de entidade 'song'
            const reqs = names.map(n => 
                fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&entity=song&limit=1`)
                .then(r => {
                    if (!r.ok) throw new Error('Falha na rede');
                    return r.json();
                })
                .catch(() => ({ results: [] })) // Se uma música falhar, continua as outras
            );

            const results = await Promise.all(reqs);
            musicList.innerHTML = '';
            
            let foundAny = false;

            results.forEach((data, index) => {
                if (data.results && data.results.length > 0) {
                    foundAny = true;
                    const track = data.results[0];
                    const div = document.createElement('div');
                    div.className = 'music-item';
                    div.innerHTML = `
                        <img src="${track.artworkUrl100}" alt="Capa">
                        <div style="flex:1;">
                            <strong style="font-size:13px; color:var(--ghost);">${track.trackName}</strong><br>
                            <span style="font-size:11px; color:#666;">${track.artistName}</span>
                            <div class="progress-container" id="p-cont-${index}">
                                <div class="progress-bar" id="p-bar-${index}"></div>
                            </div>
                        </div>
                        <i class="fas fa-play-circle play-btn" onclick="window.playSong('${track.previewUrl}', this, ${index})"></i>
                    `;
                    musicList.appendChild(div);
                }
            });

            if (!foundAny) {
                musicList.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Nenhuma trilha encontrada no multiverso.</p>';
            }

        } catch (error) {
            console.error("Erro na API:", error);
            musicList.innerHTML = '<p style="text-align:center; color:#ff4444; padding:20px;">Erro de conexão com a API de áudio. Verifique sua internet.</p>';
        }
    };

    window.playSong = (url, btn, idx) => {
        if (currentAudio) {
            currentAudio.pause();
            clearInterval(progressInterval);
            document.querySelectorAll('.play-btn').forEach(b => b.className = 'fas fa-play-circle play-btn');
            document.querySelectorAll('.progress-container').forEach(c => c.style.display = 'none');
            if (currentAudio.src === url) {
                currentAudio = null;
                return;
            }
        }

        currentAudio = new Audio(url);
        currentAudio.play().catch(e => console.error("Erro ao dar play:", e));
        btn.className = 'fas fa-pause-circle play-btn';
        
        const container = document.getElementById(`p-cont-${idx}`);
        const bar = document.getElementById(`p-bar-${idx}`);
        container.style.display = 'block';

        progressInterval = setInterval(() => {
            if (currentAudio && !currentAudio.paused) {
                const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
                bar.style.width = percent + '%';
            }
        }, 100);

        currentAudio.onended = () => {
            container.style.display = 'none';
            btn.className = 'fas fa-play-circle play-btn';
            clearInterval(progressInterval);
        };
    };

    // Funções de Fechamento
    window.openNetworkModal = () => document.getElementById('network-modal').style.display = 'flex';
    window.closeAllModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    window.closeMusicModal = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        clearInterval(progressInterval);
        musicModal.style.display = 'none';
    };

    // Fechar ao clicar fora
    window.onclick = (e) => {
        if (e.target.classList.contains('modal-overlay')) window.closeAllModals();
        if (e.target === musicModal) window.closeMusicModal();
    };
});
