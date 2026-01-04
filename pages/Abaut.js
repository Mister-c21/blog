document.addEventListener('DOMContentLoaded', () => {
    // Referências Globais
    const modal = document.getElementById('tt-modal');
    const musicModal = document.getElementById('music-modal');
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let progressInterval = null;

    // --- 1. NAVEGAÇÃO ENTRE ABAS (CRIADORES / COMUNIDADE) ---
    const setupTabs = () => {
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab-item, .tab-section').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                const target = document.getElementById(tab.dataset.target);
                if (target) target.classList.add('active');
            });
        });
    };

    // --- 2. NAVEGAÇÃO DE SUB-ABAS (AGRADECIMENTOS / SOBRE NÓS) ---
    const setupSubTabs = () => {
        const subTabs = document.querySelectorAll('.top-tab-item');
        subTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.top-tab-item, .sub-section').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                const subTarget = document.getElementById(btn.dataset.sub);
                if (subTarget) subTarget.classList.add('active');
            });
        });
    };

    // --- 3. CONFIGURAÇÃO DOS CARDS DOS CRIADORES ---
    const setupCreatorCards = () => {
        const cards = document.querySelectorAll('.creator-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const data = card.dataset;
                
                // Preencher dados no Modal
                document.getElementById('m-name').innerText = data.name || "LoreSpace Member";
                document.getElementById('m-bio').innerText = data.bio || "";
                document.getElementById('m-icon').className = `fas ${data.icon || 'fa-user-astronaut'}`;
                
                // Links Sociais com Verificação
                const socialPlatforms = ['twitter', 'instagram', 'facebook', 'threads'];
                socialPlatforms.forEach(plat => {
                    const element = document.getElementById(`m-${plat}`);
                    if (element) {
                        const url = data[plat];
                        if (url && url !== "#") {
                            element.href = url;
                            element.style.display = "flex";
                        } else {
                            element.style.display = "none";
                        }
                    }
                });

                // Botão de Música no Perfil do Criador
                const musicBtn = document.getElementById('m-music-trigger');
                musicBtn.onclick = (e) => {
                    e.stopPropagation();
                    window.openMusicModal(data.music);
                };

                modal.style.display = 'flex';
            });
        });
    };

    // --- 4. SISTEMA DE MÚSICA (FIX: ERRO DE LIGAÇÃO / CORS) ---
    window.openMusicModal = async (musicString) => {
        if (!musicString) return;

        // Feedback visual de carregamento
        musicList.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <i class="fas fa-compact-disc fa-spin" style="color:var(--primary); font-size:35px;"></i>
                <p style="margin-top:20px; color:#888; font-size:0.9rem; letter-spacing:1px;">SINTONIZANDO MULTIVERSO...</p>
            </div>`;
        musicModal.style.display = 'flex';

        const songNames = musicString.split(',').map(s => s.trim());
        const validTracks = [];

        // Proxy de CORS para garantir a ligação (Solução definitiva para o erro de conexão)
        const proxyURL = "https://corsproxy.io/?";

        for (const name of songNames) {
            try {
                const targetURL = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=song&limit=1`;
                const finalURL = proxyURL + encodeURIComponent(targetURL);

                const response = await fetch(finalURL);
                if (!response.ok) throw new Error("Erro na resposta da rede");
                
                const data = await response.json();

                if (data.results && data.results[0]) {
                    validTracks.push(data.results[0]);
                }
            } catch (error) {
                console.warn(`Não foi possível carregar a faixa: ${name}. Erro:`, error);
            }
        }

        renderMusicUI(validTracks);
    };

    const renderMusicUI = (tracks) => {
        if (tracks.length === 0) {
            musicList.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">Nenhuma trilha encontrada nesta frequência.</p>';
            return;
        }

        musicList.innerHTML = '';
        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'music-item';
            item.innerHTML = `
                <img src="${track.artworkUrl100}" alt="Cover">
                <div style="flex:1; overflow:hidden;">
                    <strong style="font-size:13px; color:var(--ghost); display:block; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.trackName}</strong>
                    <span style="font-size:11px; color:#666;">${track.artistName}</span>
                    <div class="progress-container" id="p-cont-${index}">
                        <div class="progress-bar" id="p-bar-${index}"></div>
                    </div>
                </div>
                <i class="fas fa-play-circle play-btn" onclick="window.playSong('${track.previewUrl}', this, ${index})"></i>
            `;
            musicList.appendChild(item);
        });
    };

    window.playSong = (url, btn, idx) => {
        // Reset de outros players ativos
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

        // Iniciar novo áudio
        currentAudio = new Audio(url);
        currentAudio.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
        
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

    // --- 5. UTILITÁRIOS E FECHAMENTO ---
    window.openNetworkModal = () => {
        const netModal = document.getElementById('network-modal');
        if (netModal) netModal.style.display = 'flex';
    };

    window.closeAllModals = () => {
        document.querySelectorAll('.modal-overlay, .music-overlay').forEach(m => m.style.display = 'none');
    };

    window.closeMusicModal = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        clearInterval(progressInterval);
        musicModal.style.display = 'none';
    };

    // Fechar ao clicar fora do conteúdo (no overlay)
    window.onclick = (event) => {
        if (event.target.classList.contains('modal-overlay')) window.closeAllModals();
        if (event.target === musicModal) window.closeMusicModal();
    };

    // Inicialização
    setupTabs();
    setupSubTabs();
    setupCreatorCards();
});
