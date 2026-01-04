document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('tt-modal');
    const musicModal = document.getElementById('music-modal');
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let progressInterval = null;

    // 1. GERENCIADOR DE ABAS PRINCIPAIS (Criadores / Comunidade)
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.target);
            if (target) target.classList.add('active');
        });
    });

    // 2. GERENCIADOR DE SUB-ABAS (Agradecimentos / Sobre Nós)
    document.querySelectorAll('.top-tab-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.top-tab-item, .sub-section').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const subTarget = document.getElementById(btn.dataset.sub);
            if (subTarget) subTarget.classList.add('active');
        });
    });

    // 3. CONFIGURAÇÃO DO MODAL DO CRIADOR
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('m-name').innerText = d.name || "Membro LoreSpace";
            document.getElementById('m-bio').innerText = d.bio || "";
            document.getElementById('m-icon').className = `fas ${d.icon || 'fa-user'}`;
            
            // Atualiza Links de Redes Sociais
            const socials = ['twitter', 'instagram', 'facebook', 'threads'];
            socials.forEach(s => {
                const link = document.getElementById(`m-${s}`);
                if (link) {
                    const url = d[s];
                    if (url && url !== "#") {
                        link.href = url;
                        link.style.display = "flex";
                    } else {
                        link.style.display = "none";
                    }
                }
            });

            // Configura o botão de música do criador
            const trigger = document.getElementById('m-music-trigger');
            trigger.onclick = (e) => {
                e.stopPropagation();
                window.openMusicModal(d.music);
            };
            
            modal.style.display = 'flex';
        });
    });

    // 4. SISTEMA DE MÚSICA VIA JSONP (SOLUÇÃO PARA ERRO DE CONEXÃO)
    window.openMusicModal = (musicString) => {
        if (!musicString) return;
        
        musicList.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <i class="fas fa-compact-disc fa-spin" style="color:var(--primary); font-size:30px;"></i>
                <p style="margin-top:15px; color:#888; font-size:0.9rem;">Sintonizando frequências...</p>
            </div>`;
        musicModal.style.display = 'flex';

        const names = musicString.split(',').map(s => s.trim());
        let resultsCount = 0;
        const tracksFound = [];

        // Criamos um nome de função único e global para o iTunes responder
        const callbackName = 'lorespace_jsonp_' + Date.now();

        window[callbackName] = (data) => {
            if (data.results && data.results.length > 0) {
                tracksFound.push(data.results[0]);
            }
            resultsCount++;
            
            // Quando todos os pedidos terminarem
            if (resultsCount === names.length) {
                renderTracks(tracksFound);
                delete window[callbackName]; // Limpeza de memória
            }
        };

        // Dispara uma requisição de script para cada música
        names.forEach(name => {
            const script = document.createElement('script');
            script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=song&limit=1&callback=${callbackName}`;
            script.onerror = () => {
                resultsCount++;
                if (resultsCount === names.length) renderTracks(tracksFound);
                script.remove();
            };
            script.onload = () => script.remove();
            document.body.appendChild(script);
        });
    };

    // Renderiza a lista de faixas no modal
    function renderTracks(tracks) {
        if (tracks.length === 0) {
            musicList.innerHTML = '<p style="text-align:center; color:#666; padding:30px;">Nenhuma trilha encontrada nesta dimensão.</p>';
            return;
        }

        musicList.innerHTML = '';
        tracks.forEach((track, index) => {
            const div = document.createElement('div');
            div.className = 'music-item';
            div.innerHTML = `
                <img src="${track.artworkUrl100}" alt="Capa">
                <div style="flex:1; overflow:hidden;">
                    <strong style="font-size:13px; color:var(--ghost); display:block; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.trackName}</strong>
                    <span style="font-size:11px; color:#666;">${track.artistName}</span>
                    <div class="progress-container" id="p-cont-${index}">
                        <div class="progress-bar" id="p-bar-${index}"></div>
                    </div>
                </div>
                <i class="fas fa-play-circle play-btn" onclick="window.playSong('${track.previewUrl}', this, ${index})"></i>
            `;
            musicList.appendChild(div);
        });
    }

    // Controle do Player de Áudio
    window.playSong = (url, btn, idx) => {
        if (currentAudio) {
            currentAudio.pause();
            clearInterval(progressInterval);
            document.querySelectorAll('.play-btn').forEach(b => b.className = 'fas fa-play-circle play-btn');
            document.querySelectorAll('.progress-container').forEach(c => c.style.display = 'none');
            
            // Se clicar na mesma música que já está tocando, ela para
            if (currentAudio.src === url) {
                currentAudio = null;
                return;
            }
        }

        currentAudio = new Audio(url);
        currentAudio.play().catch(err => console.error("Erro ao reproduzir:", err));
        
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

    // 5. FUNÇÕES DE FECHAMENTO E MODAIS GERAIS
    window.openNetworkModal = () => {
        document.getElementById('network-modal').style.display = 'flex';
    };

    window.closeAllModals = () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    };

    window.closeMusicModal = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        clearInterval(progressInterval);
        musicModal.style.display = 'none';
    };

    // Fechar ao clicar no fundo escuro
    window.onclick = (e) => {
        if (e.target.classList.contains('modal-overlay')) window.closeAllModals();
        if (e.target === musicModal) window.closeMusicModal();
    };
});
