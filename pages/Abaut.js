document.addEventListener('DOMContentLoaded', () => {
    let currentAudio = null;

    // Configura os cliques nos cards
    document.querySelectorAll('.creator-card').forEach(card => {
        card.addEventListener('click', () => {
            const musicData = card.getAttribute('data-music');
            openMusicModal(musicData);
        });
    });

    window.openMusicModal = (musicString) => {
        const musicList = document.getElementById('music-list');
        const musicModal = document.getElementById('music-modal');
        
        musicList.innerHTML = '<p style="text-align:center; color:var(--primary);">Buscando trilhas no multiverso...</p>';
        musicModal.style.display = 'flex';

        // Divide por vírgula e limpa espaços vazios
        const queries = musicString.split(',').map(s => s.trim()).filter(s => s !== "");
        
        // Limpa a lista antes de começar a carregar via JSONP
        musicList.innerHTML = '';
        let foundAny = false;
        let processed = 0;

        queries.forEach((query, idx) => {
            const callbackName = `itunesCB_${Date.now()}_${idx}`;
            
            window[callbackName] = (data) => {
                processed++;
                if (data.results && data.results.length > 0) {
                    foundAny = true;
                    const track = data.results[0];
                    renderTrack(track, idx);
                }

                // Se terminou de processar tudo e não achou nada
                if (processed === queries.length && !foundAny) {
                    musicList.innerHTML = '<p style="text-align:center; color:#666;">Nenhuma música encontrada para esta busca.</p>';
                }
                delete window[callbackName];
            };

            // Criamos o script de busca (JSONP)
            const script = document.createElement('script');
            // encodeURIComponent é vital para nomes com espaços
            script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1&callback=${callbackName}`;
            document.body.appendChild(script);
            
            // Tratamento de erro se o script falhar ao carregar
            script.onerror = () => {
                processed++;
                script.remove();
            };
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
                <b style="font-size:14px; display:block; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.trackName}</b>
                <small style="color:#888;">${track.artistName}</small>
            </div>
            <i class="fas fa-play-circle play-btn" onclick="playSong('${track.previewUrl}', this)"></i>
        `;
        musicList.appendChild(div);
    }

    window.playSong = (url, btn) => {
        if (currentAudio) {
            currentAudio.pause();
            document.querySelectorAll('.play-btn').forEach(i => i.className = 'fas fa-play-circle play-btn');
            if (currentAudio.src === url) {
                currentAudio = null;
                return;
            }
        }
        currentAudio = new Audio(url);
        currentAudio.play();
        btn.className = 'fas fa-pause-circle play-btn';
    };

    window.closeMusicModal = () => {
        if(currentAudio) { currentAudio.pause(); currentAudio = null; }
        document.getElementById('music-modal').style.display = 'none';
    };

    // Fechar ao clicar fora
    window.onclick = (e) => {
        if (e.target.id === 'music-modal') closeMusicModal();
    };
});
