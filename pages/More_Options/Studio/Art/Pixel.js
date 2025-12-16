document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração e Referências ---
    
    // Limite de resolução física para evitar problemas de memória/GPU no navegador
    const MAX_CANVAS_RESOLUTION = 2048; 
    
    // Dimensões Lógicas Iniciais (Pixels de Arte)
    let logicalWidth = 128; 
    let logicalHeight = 128; 

    // O Canvas Físico (Visualização)
    const physicalWidth = Math.min(window.innerWidth, MAX_CANVAS_RESOLUTION);
    const physicalHeight = Math.min(window.innerHeight, MAX_CANVAS_RESOLUTION);

    // Elementos do DOM
    const canvasContainer = document.getElementById('canvas-container');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const displayCanvas = document.getElementById('display-canvas');
    const displayCtx = displayCanvas.getContext('2d');
    const cursor = document.getElementById('cursor-preview');
    const zoomIndicator = document.getElementById('zoom-level');
    
    // Sliders e Botões
    const sizeSlider = document.getElementById('size-slider');
    const opacitySlider = document.getElementById('opacity-slider');
    const smoothingSlider = document.getElementById('smoothing-slider');
    const layerOpacitySlider = document.getElementById('layer-opacity-slider');
    const colorPicker = document.getElementById('color-picker');
    const pixelWidthInput = document.getElementById('pixel-width');
    const pixelHeightInput = document.getElementById('pixel-height');

    // Inicialização do Canvas Físico (Mantido Pequeno para Performance)
    displayCanvas.width = physicalWidth;
    displayCanvas.height = physicalHeight;
    canvasWrapper.style.width = physicalWidth + 'px';
    canvasWrapper.style.height = physicalHeight + 'px';

    // --- ESTADO GLOBAL (State) ---
    const state = {
        isDrawing: false,
        tool: 'pen', // pen, eraser, picker, fill
        brushShape: 'square', // Forçado para square em Pixel Art
        color: '#BB86FC',
        size: 1, // Tamanho em pixels de arte
        opacity: 1.0,
        smoothing: 0, // Suavização desativada para Pixel Art
        shapeMode: 'none',
        
        startX: 0, startY: 0,
        
        layers: [],
        activeLayerIndex: 0,
        
        history: [],
        historyRedo: [],
        maxHistory: 20,

        // Câmera (Zoom/Pan)
        scale: 4, // Zoom inicial alto para começar em 128x128
        panX: 0,
        panY: 0,
        isPanning: false, 
        lastPanX: 0,
        lastPanY: 0,
        
        // Mobile Pinch
        pinchStartDist: 0,
        pinchStartScale: 1
    };

    // --- CLASSE LAYER ---
    class Layer {
        constructor(id, w, h) {
            this.id = id;
            this.canvas = document.createElement('canvas');
            // O canvas da camada usa as dimensões LÓGICAS (pixels de arte)
            this.canvas.width = w; 
            this.canvas.height = h;
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
            this.visible = true;
            this.opacity = 1.0;
            this.name = `Camada ${id}`;
            this.ctx.clearRect(0,0,w,h);
            // Configuração para pixel art: desativa suavização
            this.ctx.imageSmoothingEnabled = false; 
        }
    }

    // --- GERENCIAMENTO DE CAMADAS E REDIMENSIONAMENTO ---
    let layerCounter = 1;
    const layersListContainer = document.getElementById('layers-list-container');

    function createInitialLayer() {
        const newLayer = new Layer(layerCounter++, logicalWidth, logicalHeight);
        if(state.layers.length === 0) {
            newLayer.ctx.fillStyle = '#ffffff';
            newLayer.ctx.fillRect(0,0,logicalWidth,logicalHeight);
            newLayer.name = "Fundo";
        }
        state.layers.unshift(newLayer); 
        state.activeLayerIndex = 0;
        
        saveState();
        renderLayersUI();
        renderCanvas();
    }
    
    function addLayer() {
        const newLayer = new Layer(layerCounter++, logicalWidth, logicalHeight);
        state.layers.unshift(newLayer); 
        state.activeLayerIndex = 0;
        saveState(); renderLayersUI(); renderCanvas();
    }

    function resizeLogicalCanvas() {
        logicalWidth = parseInt(pixelWidthInput.value);
        logicalHeight = parseInt(pixelHeightInput.value);
        
        // Crie um canvas temporário maior para a nova resolução
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = logicalWidth;
        tempCanvas.height = logicalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        
        // Crie novas camadas com o novo tamanho, transferindo o conteúdo
        state.layers = state.layers.map(layer => {
            tempCtx.clearRect(0, 0, logicalWidth, logicalHeight);
            tempCtx.drawImage(layer.canvas, 0, 0); 

            const newLayer = new Layer(layer.id, logicalWidth, logicalHeight);
            newLayer.ctx.drawImage(tempCanvas, 0, 0);
            newLayer.name = layer.name;
            newLayer.visible = layer.visible;
            newLayer.opacity = layer.opacity;
            return newLayer;
        });

        layerCounter = state.layers.length + 1;
        state.history = []; // Limpa o histórico após redimensionamento
        saveState();
        renderLayersUI();
        renderCanvas();
        updateView();
    }
    
    document.getElementById('resize-canvas-btn').onclick = () => {
        if(confirm(`Redimensionar para ${pixelWidthInput.value}x${pixelHeightInput.value}? O conteúdo existente será mantido no canto superior esquerdo. Esta ação limpará o histórico.`)) {
            resizeLogicalCanvas();
        }
    };

    function renderLayersUI() {
        layersListContainer.innerHTML = '';
        state.layers.forEach((layer, index) => {
            const el = document.createElement('div');
            el.className = `layer-item ${index === state.activeLayerIndex ? 'active' : ''}`;
            
            // Preview
            const preview = document.createElement('div');
            preview.className = 'layer-preview';
            // Reduz o preview para evitar estouro de memória no DOM
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 36;
            previewCanvas.height = 36;
            const pCtx = previewCanvas.getContext('2d');
            pCtx.imageSmoothingEnabled = false;
            pCtx.drawImage(layer.canvas, 0, 0, 36, 36);
            const thumbUrl = previewCanvas.toDataURL('image/png'); 
            preview.style.backgroundImage = `url(${thumbUrl})`;
            preview.style.backgroundSize = "cover";

            // Info e Ações... (restante da lógica de UI)
            const info = document.createElement('div');
            info.className = 'layer-info';
            info.innerText = layer.name;
            info.onclick = () => setActiveLayer(index);

            const actions = document.createElement('div');
            actions.className = 'layer-actions';
            const visBtn = document.createElement('button');
            visBtn.className = 'layer-btn';
            visBtn.innerHTML = layer.visible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
            visBtn.onclick = (e) => { e.stopPropagation(); toggleVisibility(index); };
            actions.appendChild(visBtn);

            el.appendChild(preview); el.appendChild(info); el.appendChild(actions);
            layersListContainer.appendChild(el);
        });
    }

    function renderCanvas() {
        displayCtx.clearRect(0, 0, physicalWidth, physicalHeight);

        // Composição de todas as camadas no canvas lógico
        const composedCanvas = document.createElement('canvas');
        composedCanvas.width = logicalWidth;
        composedCanvas.height = logicalHeight;
        const composedCtx = composedCanvas.getContext('2d');
        composedCtx.imageSmoothingEnabled = false;
        
        for(let i = state.layers.length - 1; i >= 0; i--) {
            const layer = state.layers[i];
            if(layer.visible) {
                composedCtx.globalAlpha = layer.opacity;
                composedCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        composedCtx.globalAlpha = 1.0;

        displayCtx.save();
        
        // Aplica o pan e zoom ao canvas de display (o visualizador)
        displayCtx.translate(state.panX, state.panY);
        
        // Desenha a imagem composta (do canvas lógico) no visualizador (displayCanvas)
        displayCtx.drawImage(composedCanvas, 
                             0, 0, logicalWidth, logicalHeight, // Fonte
                             0, 0, logicalWidth * state.scale, logicalHeight * state.scale); // Destino (Escalado)
        
        displayCtx.restore();
    }

    // ... (funções setActiveLayer, deleteActiveLayer, toggleVisibility, mergeDown) ...
    function setActiveLayer(index) {
        if(index >= 0 && index < state.layers.length) {
            state.activeLayerIndex = index;
            layerOpacitySlider.value = state.layers[index].opacity * 100;
            renderLayersUI();
        }
    }

    function deleteActiveLayer() {
        if(state.layers.length <= 1) { alert("Você precisa de pelo menos uma camada."); return; }
        state.layers.splice(state.activeLayerIndex, 1);
        state.activeLayerIndex = Math.max(0, state.activeLayerIndex - 1);
        saveState(); renderLayersUI(); renderCanvas();
    }

    function toggleVisibility(index) {
        state.layers[index].visible = !state.layers[index].visible;
        renderLayersUI(); renderCanvas();
    }

    function mergeDown() {
        const index = state.activeLayerIndex;
        if(index >= state.layers.length - 1) return;
        const topLayer = state.layers[index];
        const bottomLayer = state.layers[index + 1];
        
        bottomLayer.ctx.globalAlpha = topLayer.opacity;
        bottomLayer.ctx.drawImage(topLayer.canvas, 0, 0);
        bottomLayer.ctx.globalAlpha = 1.0;
        
        state.layers.splice(index, 1);
        saveState(); renderLayersUI(); renderCanvas();
    }


    // --- CÂMERA: ZOOM & PAN ---

    function updateView() {
        zoomIndicator.innerText = `${Math.round(state.scale * 100)}%`;
        updateCursorPreview();
        renderCanvas(); // Redesenha para aplicar pan/zoom
    }

    function getWorldPos(screenX, screenY) {
        // screenX/Y -> Coordenadas na tela
        // panX/Y -> Offset da visão
        // scale -> Zoom
        // Retorna as coordenadas do pixel LÓGICO clicado
        
        const logicalX = (screenX - state.panX) / state.scale;
        const logicalY = (screenY - state.panY) / state.scale;
        
        // Aplica o floor para obter a coordenada do pixel (Pixel Art)
        return {
            x: Math.floor(logicalX), 
            y: Math.floor(logicalY)
        };
    }

    function resetView() {
        state.scale = 4; state.panX = 0; state.panY = 0; updateView();
    }

    document.getElementById('reset-view-btn').onclick = resetView;
    zoomIndicator.onclick = resetView;

    canvasContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvasContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calcula a posição do mouse em coordenadas lógicas antes do zoom
        const worldXBefore = (mouseX - state.panX) / state.scale;
        const worldYBefore = (mouseY - state.panY) / state.scale;

        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -1 : 1;
        const newScale = Math.min(Math.max(0.1, state.scale + delta * zoomIntensity), 50); // Limite de zoom em 50x
        state.scale = newScale;

        // Recalcula o Pan para manter o ponto sob o mouse
        state.panX = mouseX - worldXBefore * state.scale;
        state.panY = mouseY - worldYBefore * state.scale;

        updateView();
    }, { passive: false });


    // --- DESENHO PIXEL ART ---
    let points = []; 

    function startDraw(e) {
        if(e.type === 'mousedown' && e.buttons === 1 && (keysPressed[' '] || keysPressed['Space'])) {
            state.isPanning = true;
            state.lastPanX = e.clientX;
            state.lastPanY = e.clientY;
            canvasContainer.style.cursor = 'grabbing';
            return;
        }

        if(state.tool === 'picker') { pickColor(e); return; }
        if(state.tool === 'fill') { floodFill(e); return; }
        if(e.touches && e.touches.length > 1) return;

        state.isDrawing = true;
        
        const rect = canvasContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pos = getWorldPos(clientX - rect.left, clientY - rect.top);

        state.startX = pos.x; state.startY = pos.y;
        points = [{x: pos.x, y: pos.y}];

        const activeCtx = state.layers[state.activeLayerIndex].ctx;

        // Configuração do contexto para pixel art
        activeCtx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
        activeCtx.fillStyle = state.color;
        activeCtx.globalAlpha = state.opacity;
        
        // Desenha o primeiro pixel (fillRect é fundamental para Pixel Art)
        activeCtx.fillRect(pos.x, pos.y, state.size, state.size); 
        
        renderCanvas();
    }

    function draw(e) {
        if(state.isPanning && !e.touches) {
            const dx = e.clientX - state.lastPanX;
            const dy = e.clientY - state.lastPanY;
            state.panX += dx; state.panY += dy;
            state.lastPanX = e.clientX; state.lastPanY = e.clientY;
            updateView(); return;
        }

        if(!state.isDrawing || (e.touches && e.touches.length > 1)) return;
        e.preventDefault();

        const rect = canvasContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pos = getWorldPos(clientX - rect.left, clientY - rect.top);

        const activeLayer = state.layers[state.activeLayerIndex];
        const ctx = activeLayer.ctx;
        if(!activeLayer.visible) return;

        // Formas não têm preview contínuo com a implementação de Pixel Art de alta escala.
        if(state.shapeMode !== 'none') return; 

        // Desenho de Pixel
        const lastPos = points[points.length - 1];
        if (pos.x !== lastPos.x || pos.y !== lastPos.y) {
            
            // Desenho simples do pixel atual
            ctx.fillRect(pos.x, pos.y, state.size, state.size);
            
            // Opcional: Implementar Bresenham para desenhar linha entre pontos
            
            points.push(pos);
            renderCanvas();
        }
    }

    function stopDraw(e) {
        if(state.isPanning) {
            state.isPanning = false; canvasContainer.style.cursor = 'default'; return;
        }
        if(!state.isDrawing) return;
        state.isDrawing = false;
        
        const activeLayer = state.layers[state.activeLayerIndex];
        const ctx = activeLayer.ctx;

        // Finalizar Forma (Desenho com Pixels Lógicos)
        if(state.shapeMode !== 'none') {
            const rect = canvasContainer.getBoundingClientRect();
            let clientX = e.clientX; let clientY = e.clientY;
            if(e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY;
            }
            const pos = getWorldPos(clientX - rect.left, clientY - rect.top);
            
            ctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
            ctx.fillStyle = state.color;
            
            if(state.shapeMode === 'line') {
                // Implementar Algoritmo de Linha de Pixel (Bresenham) aqui
            } else if (state.shapeMode === 'rect') {
                const w = pos.x - state.startX + state.size; 
                const h = pos.y - state.startY + state.size;
                if(state.tool !== 'eraser') ctx.fillRect(state.startX, state.startY, w, h);
                else ctx.clearRect(state.startX, state.startY, w, h);
            } else if (state.shapeMode === 'circle') {
                 // Implementar Algoritmo de Círculo de Pixel
                 // Simplificação: usa o preenchimento nativo do canvas (não é pixel art puro)
                 const r = Math.sqrt(Math.pow(pos.x - state.startX, 2) + Math.pow(pos.y - state.startY, 2));
                 ctx.beginPath();
                 ctx.arc(state.startX, state.startY, r, 0, Math.PI * 2); 
                 ctx.fill(); 
            }
        }

        ctx.globalCompositeOperation = 'source-over';
        points = [];
        saveState(); renderLayersUI(); renderCanvas();
    }

    // --- MOBILE PINCH ZOOM ---
    function getDistance(touches) { return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY); }
    function getCenter(touches) { return { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 }; }

    canvasContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            state.isDrawing = false;
            state.pinchStartDist = getDistance(e.touches);
            state.pinchStartScale = state.scale;
            const center = getCenter(e.touches);
            state.lastPanX = center.x; state.lastPanY = center.y;
            state.isPanning = true;
        } else if (e.touches.length === 1) { startDraw(e); }
    }, {passive: false});

    canvasContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && state.isPanning) {
            e.preventDefault();
            const dist = getDistance(e.touches);
            const scaleChange = dist / state.pinchStartDist;
            const newScale = Math.min(Math.max(0.1, state.pinchStartScale * scaleChange), 50);
            
            const center = getCenter(e.touches);
            const dx = center.x - state.lastPanX;
            const dy = center.y - state.lastPanY;

            state.scale = newScale;
            state.panX += dx; state.panY += dy;
            state.lastPanX = center.x; state.lastPanY = center.y;
            
            updateView();
        } else if (e.touches.length === 1) { draw(e); }
    }, {passive: false});

    canvasContainer.addEventListener('touchend', (e) => {
        if(state.isPanning && e.touches.length < 2) state.isPanning = false;
        stopDraw(e);
    });

    // --- FERRAMENTAS ---
    function pickColor(e) {
        const rect = canvasContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pos = getWorldPos(clientX - rect.left, clientY - rect.top);
        
        const activeLayer = state.layers[state.activeLayerIndex];
        if (pos.x < 0 || pos.y < 0 || pos.x >= logicalWidth || pos.y >= logicalHeight) return; // Fora dos limites
        
        // Obter cor do pixel lógico
        const p = activeLayer.ctx.getImageData(pos.x, pos.y, 1, 1).data; 
        const hex = "#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1).toUpperCase();
        state.color = hex;
        colorPicker.value = hex;
        document.getElementById('tool-pen').click();
    }

    function floodFill(e) {
        // Para uma implementação real, seria necessário um algoritmo de Flood Fill (recursivo/pilha)
        if (confirm("Flood Fill real exige um algoritmo de rastreamento de pixels. Deseja preencher toda a camada ativa?")) {
            const ctx = state.layers[state.activeLayerIndex].ctx;
            ctx.fillStyle = state.color;
            ctx.globalAlpha = state.opacity;
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillRect(0, 0, logicalWidth, logicalHeight);
            saveState(); renderLayersUI(); renderCanvas();
        }
    }

    // --- UNDO / REDO (Adaptado para usar a resolução lógica) ---
    function saveState() {
        const currentState = state.layers.map(layer => ({
            data: layer.canvas.toDataURL(),
            visible: layer.visible, opacity: layer.opacity, name: layer.name, id: layer.id
        }));
        state.history.push(currentState);
        if(state.history.length > state.maxHistory) state.history.shift();
        state.historyRedo = [];
        updateUndoButtons();
    }

    function loadState(historyItem) {
        state.layers = [];
        let loadedCount = 0;
        historyItem.forEach((layerData, idx) => {
            const img = new Image(); img.src = layerData.data;
            img.onload = () => {
                // Dimensões do canvas da camada são baseadas na imagem carregada (resolução lógica)
                const w = img.width; const h = img.height;
                // Atualiza a resolução lógica do projeto se o estado de histórico tiver uma diferente
                logicalWidth = w; logicalHeight = h;
                pixelWidthInput.value = w; pixelHeightInput.value = h;
                
                const newLayer = new Layer(layerData.id, w, h);
                newLayer.ctx.drawImage(img, 0, 0);
                newLayer.visible = layerData.visible; newLayer.opacity = layerData.opacity; newLayer.name = layerData.name;
                state.layers[idx] = newLayer;
                loadedCount++;
                if(loadedCount === historyItem.length) {
                    state.activeLayerIndex = 0; renderLayersUI(); renderCanvas();
                }
            };
            state.layers[idx] = null; 
        });
        updateUndoButtons();
    }
    
    function updateUndoButtons() {
        document.getElementById('undo-btn').style.opacity = state.history.length > 1 ? 1 : 0.3;
        document.getElementById('redo-btn').style.opacity = state.historyRedo.length > 0 ? 1 : 0.3;
    }

    document.getElementById('undo-btn').onclick = () => { if(state.history.length > 1) { state.historyRedo.push(state.history.pop()); loadState(state.history[state.history.length - 1]); }};
    document.getElementById('redo-btn').onclick = () => { if(state.historyRedo.length > 0) { const next = state.historyRedo.pop(); state.history.push(next); loadState(next); }};

    // --- IO (Import/Export) ---
    document.getElementById('import-img-btn').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
                addLayer();
                const ctx = state.layers[0].ctx;
                // Desenha a imagem na camada (escala para o tamanho lógico, se necessário)
                ctx.drawImage(img, 0, 0, logicalWidth, logicalHeight);
                state.layers[0].name = "Imagem";
                renderLayersUI(); renderCanvas(); saveState();
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Limpa o input file
    };

    document.getElementById('export-btn').onclick = () => {
        // Cria um canvas temporário de EXPORTAÇÃO (na resolução lógica)
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = logicalWidth;
        exportCanvas.height = logicalHeight;
        const exportCtx = exportCanvas.getContext('2d');
        exportCtx.imageSmoothingEnabled = false;

        // Compõe todas as camadas no canvas de exportação
        for(let i = state.layers.length - 1; i >= 0; i--) {
            const layer = state.layers[i];
            if(layer.visible) {
                exportCtx.globalAlpha = layer.opacity;
                exportCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        
        const link = document.createElement('a'); link.download = 'pixel_art.png';
        link.href = exportCanvas.toDataURL(); link.click();
    };
    
    // Salvar/Carregar Projeto (.draw JSON)
    document.getElementById('save-project-btn').onclick = () => {
        const projectData = { 
            width: logicalWidth, 
            height: logicalHeight, 
            layers: state.layers.map(l => ({ 
                id: l.id, name: l.name, visible: l.visible, opacity: l.opacity, data: l.canvas.toDataURL() 
            })) 
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
        const link = document.createElement('a'); link.href = dataStr; link.download = "projeto.draw"; link.click();
    };

    document.getElementById('load-project-btn').onclick = () => document.getElementById('project-input').click();
    document.getElementById('project-input').onchange = (e) => {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const project = JSON.parse(evt.target.result);
                logicalWidth = project.width; logicalHeight = project.height;
                pixelWidthInput.value = logicalWidth; pixelHeightInput.value = logicalHeight;
                state.layers = []; state.history = [];
                let count = 0;
                project.layers.forEach((lData, i) => {
                    const img = new Image(); img.src = lData.data;
                    img.onload = () => {
                        const l = new Layer(lData.id, project.width, project.height);
                        l.name = lData.name; l.visible = lData.visible; l.opacity = lData.opacity;
                        l.ctx.drawImage(img, 0, 0);
                        state.layers[i] = l;
                        count++;
                        if(count === project.layers.length) { renderLayersUI(); renderCanvas(); saveState(); }
                    };
                    state.layers[i] = null; 
                });
            } catch(err) { alert("Erro ao carregar o projeto. Verifique se o arquivo está no formato correto."); }
        };
        reader.readAsText(file);
        e.target.value = ''; // Limpa o input file
    };

    // --- CURSOR UPDATE ---
    function updateCursorPreview() {
        const visualSize = state.size * state.scale;
        cursor.style.width = visualSize + 'px'; cursor.style.height = visualSize + 'px';
        cursor.style.borderRadius = '0'; // Força quadrado
    }

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
        cursor.style.display = (state.tool === 'pen' || state.tool === 'eraser') ? 'block' : 'none';
        draw(e);
    });

    // --- EVENTOS UI ---
    // Painéis... (lógica permanece)
    function togglePanel(panelId) {
        const target = document.getElementById(panelId);
        const isOpen = target.classList.contains('open');
        document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
        if(!isOpen) target.classList.add('open');
    }
    document.getElementById('actions-btn').onclick = () => togglePanel('actions-panel');
    document.getElementById('layers-btn').onclick = () => togglePanel('layers-panel');
    document.querySelectorAll('.close-btn').forEach(b => b.onclick = () => document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open')));
    document.getElementById('tool-pen').addEventListener('dblclick', () => togglePanel('settings-panel'));
    document.getElementById('tool-eraser').addEventListener('dblclick', () => togglePanel('settings-panel'));
    document.getElementById('home-btn').onclick = (e) => {
        e.preventDefault(); 
        if (confirm("Se você não salvou, seu trabalho será perdido. Deseja realmente sair e ir para a página inicial?")) {
            window.location.href = e.currentTarget.href;
        }
    };


    // Teclado (lógica permanece)
    const keysPressed = {};
    window.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        if(e.key === ' ' && !state.isDrawing) canvasContainer.style.cursor = 'grab';
        if((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); document.getElementById('undo-btn').click(); }
        if((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); document.getElementById('redo-btn').click(); }
    });
    window.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
        if(e.key === ' ') canvasContainer.style.cursor = 'default';
    });

    // Ferramentas (lógica permanece)
    const toolBtns = document.querySelectorAll('.dock-btn');
    toolBtns.forEach(btn => {
        btn.onclick = () => {
            toolBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
            state.tool = btn.id.replace('tool-', '');
        };
    });

    // Sliders
    sizeSlider.oninput = (e) => { 
        state.size = parseInt(e.target.value); 
        document.getElementById('size-val').innerText = state.size + 'x'; 
        updateCursorPreview(); 
    };
    opacitySlider.oninput = (e) => state.opacity = parseInt(e.target.value)/100;
    smoothingSlider.oninput = (e) => state.smoothing = parseInt(e.target.value);
    colorPicker.oninput = (e) => state.color = e.target.value;
    layerOpacitySlider.oninput = (e) => { state.layers[state.activeLayerIndex].opacity = parseInt(e.target.value)/100; renderCanvas(); };
    
    // Botões
    document.getElementById('add-layer-btn').onclick = addLayer;
    document.getElementById('delete-layer-btn').onclick = deleteActiveLayer;
    document.getElementById('merge-layer-btn').onclick = mergeDown;
    document.getElementById('clear-layer-btn').onclick = () => { if(confirm('Tem certeza que deseja Limpar a Camada?')) { state.layers[state.activeLayerIndex].ctx.clearRect(0,0,logicalWidth,logicalHeight); renderLayersUI(); renderCanvas(); saveState(); }};

    document.querySelectorAll('.brush-btn').forEach(btn => btn.onclick = () => { 
        if(btn.dataset.brush !== 'square') {
            alert("Apenas a ponta Quadrada é suportada para Pixel Art.");
            return;
        }
        document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active')); 
        btn.classList.add('active'); 
        state.brushShape = btn.dataset.brush; 
    });
    document.querySelectorAll('.shape-btn').forEach(btn => btn.onclick = () => { 
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active')); 
        btn.classList.add('active'); 
        state.shapeMode = btn.dataset.shape; 
    });
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => btn.onclick = () => {
        if(btn.disabled) return;
        const type = btn.dataset.filter;
        const ctx = state.layers[state.activeLayerIndex].ctx;
        
        const imgData = ctx.getImageData(0,0,logicalWidth,logicalHeight); 
        const data = imgData.data;
        for(let i=0; i<data.length; i+=4) {
            if(type === 'invert') { data[i]=255-data[i]; data[i+1]=255-data[i+1]; data[i+2]=255-data[i+2]; }
            else if (type === 'grayscale') { const avg=(data[i]+data[i+1]+data[i+2])/3; data[i]=avg; data[i+1]=avg; data[i+2]=avg; }
        }
        ctx.putImageData(imgData, 0, 0);
        
        renderLayersUI(); renderCanvas(); saveState();
    });

    // Listeners Mouse/Touch para Desenho
    canvasContainer.addEventListener('mousedown', startDraw);
    window.addEventListener('mouseup', stopDraw);
    
    // Init
    createInitialLayer();
    updateView();
});
