document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('main-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalOptionsContainer = document.getElementById('modal-options');
    const closeBtn = document.querySelector('.close-btn');
    const cards = document.querySelectorAll('.card');

    // 1. Definição do conteúdo exclusivo para cada modal
    const modalContent = {
        'modal-game': {
            // Título atualizado
            title: 'Tipos de Jogo',
            options: [
                // Opções de Jogo (Inalteradas)
                { text: 'Ação / Aventura', icon: 'fas fa-gun', link: '#' },
                { text: 'RPG (Role-Playing Game)', icon: 'fas fa-hat-wizard', link: '#' },
                { text: 'Estratégia / Simulação', icon: 'fas fa-chess-knight', link: '#' },
                { text: 'Esportes / Corrida', icon: 'fas fa-football-ball', link: '#' },
            ]
        },
        'modal-mods': {
            title: 'Opções de Mods & Extensões',
            options: [
                // APENAS MCPE (Inalterado da requisição anterior)
                { text: 'MCPE (Minecraft Pocket Edition)', icon: 'fas fa-mobile-alt', link: '#' },
            ]
        },
        'modal-skin': {
            title: 'Opções de Skins & Aparências',
            options: [
                // ALTERADO: Apenas MCPE e MCJA
                { text: 'MCPE (Minecraft Pocket Edition)', icon: 'fas fa-mobile-alt', link: './Skin/Mcpe.html' },
                { text: 'MCJA (Minecraft Java Edition)', icon: 'fas fa-laptop', link: '#' },
            ]
        },
        'modal-art': {
            title: 'Opções de Artes & Criações',
            options: [
                // ALTERADO: Apenas Pixelart e Desenho
                { text: 'Pixelart', icon: 'fas fa-cube', link: './Art/Pixel/Pixel.html' },
                { text: 'Desenho', icon: 'fas fa-pencil-ruler', link: './Art/Draw/Draw.html' },
            ]
        },
        'modal-video': {
            title: 'Opções de Vídeos & Clips',
            options: [
                // ALTERADO: Animação Desenho e Animação Pixel
                { text: 'Animação Desenho', icon: 'fas fa-film', link: '#' },
                { text: 'Animação Pixel', icon: 'fas fa-dice-d6', link: '#' },
            ]
        },
        'modal-music': {
            title: 'Opções de Músicas & Trilhas',
            options: [
                // ALTERADO: Apenas Melodia
                { text: 'Melodia', icon: 'fas fa-spa', link: '#' },
            ]
        }
    };

    // 2. Função para abrir o modal
    const openModal = (modalId) => {
        const content = modalContent[modalId];
        
        if (!content) return; // Garante que o ID existe

        modalTitle.textContent = content.title;
        modalOptionsContainer.innerHTML = ''; // Limpa as opções antigas

        // Cria e insere os links de subopções
        content.options.forEach(option => {
            const link = document.createElement('a');
            link.href = option.link;
            link.classList.add('modal-option');
            link.innerHTML = `<i class="${option.icon}"></i> ${option.text}`;
            modalOptionsContainer.appendChild(link);
        });

        modal.style.display = 'block';
    };

    // 3. Event Listener para os cards
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal-id');
            openModal(modalId);
        });
        
        // Suporte para acessibilidade via teclado
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const modalId = card.getAttribute('data-modal-id');
                openModal(modalId);
            }
        });
    });

    // 4. Fechar Modal (Botão X)
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    }

    // 5. Fechar Modal (Clicar fora)
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});
