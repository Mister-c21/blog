document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração e Referências ---
    const width = window.innerWidth;
    const height = window.innerHeight;

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

    // Inicialização do Canvas Físico
    displayCanvas.width = width;
    displayCanvas.height = height;
    canvasWrapper.style.width = width + 'px';
    canvasWrapper.style.height = height + 'px';

    // --- ESTADO GLOBAL (State) ---
    const state = {
        // Ferramentas
        isDrawing: false,
        tool: 'pen', // pen, eraser, picker, fill
        brushShape: 'round',
        color: '#BB86FC', // Nova cor padrão
        size: 10,
        opacity: 1.0,
        smoothing: 20, // 0 a 100
        shapeMode: 'none',
        
        // Coordenadas
        startX: 0, startY: 0,
        
        // Camadas
        layers: [],
        activeLayerIndex: 0,
        
        // Histórico
        history: [],
        historyRedo: [],
        maxHistory: 20,

        // Câmera (Zoom/Pan)
        scale: 1,
        panX: 0,
        panY: 0,
        isPanning: false, // Pan via Barra de Espaço
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
            this.canvas.width = w;
            this.canvas.height = h;
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
            this.visible = true;
            this.opacity = 1.0;
            this.name = `Camada ${id}`;
            this.ctx.clearRect(0,0,w,h);
        }
    }

    // --- GERENCIAMENTO DE CAMADAS ---
    let layerCounter = 1;
    const layersListContainer = document.getElementById('layers-list-container');

    function addLayer() {
        const newLayer = new Layer(layerCounter++, width, height);
        if(state.layers.length === 0) {
            newLayer.ctx.fillStyle = '#ffffff';
            newLayer.ctx.fillRect(0,0,width,height);
            newLayer.name = "Fundo";
        }
        state.layers.unshift(newLayer); 
        state.activeLayerIndex = 0;
        
        saveState();
        renderLayersUI();
        renderCanvas();
    }

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

    function renderLayersUI() {
        layersListContainer.innerHTML = '';
        state.layers.forEach((layer, index) => {
            const el = document.createElement('div');
            el.className = `layer-item ${index === state.activeLayerIndex ? 'active' : ''}`;
            
            // Preview
            const preview = document.createElement('div');
            preview.className = 'layer-preview';
            const thumbUrl = layer.canvas.toDataURL('image/png', 0.1); 
            preview.style.backgroundImage = `url(${thumbUrl})`;
            preview.style.backgroundSize = "contain";
            preview.style.backgroundRepeat = "no-repeat";
            preview.style.backgroundPosition = "center";

            // Info
            const info = document.createElement('div');
            info.className = 'layer-info';
            info.innerText = layer.name;
            info.onclick = () => setActiveLayer(index);

            // Ações
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
        displayCtx.clearRect(0, 0, width, height);
        for(let i = state.layers.length - 1; i >= 0; i--) {
            const layer = state.layers[i];
            if(layer.visible) {
                displayCtx.globalAlpha = layer.opacity;
                displayCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        displayCtx.globalAlpha = 1.0;
    }

    // --- CÂMERA: ZOOM & PAN ---

    function updateView() {
        canvasWrapper.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
        zoomIndicator.innerText = `${Math.round(state.scale * 100)}%`;
        updateCursorPreview();
    }

    function getWorldPos(screenX, screenY) {
        return {
            x: (screenX - state.panX) / state.scale,
            y: (screenY - state.panY) / state.scale
        };
    }

    function resetView() {
        state.scale = 1; state.panX = 0; state.panY = 0; updateView();
    }

    document.getElementById('reset-view-btn').onclick = resetView;
    zoomIndicator.onclick = resetView;

    canvasContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvasContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldPosBefore = getWorldPos(mouseX, mouseY);

        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -1 : 1;
        const newScale = Math.min(Math.max(0.1, state.scale + delta * zoomIntensity), 5);
        state.scale = newScale;

        state.panX = mouseX - worldPosBefore.x * state.scale;
        state.panY = mouseY - worldPosBefore.y * state.scale;

        updateView();
    }, { passive: false });


    // --- DESENHO ---
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
        if(state.tool === 'fill') { fillLayer(); return; }
        if(e.touches && e.touches.length > 1) return;

        state.isDrawing = true;
        
        const rect = canvasContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pos = getWorldPos(clientX - rect.left, clientY - rect.top);

        state.startX = pos.x; state.startY = pos.y;
        points = [{x: pos.x, y: pos.y}];

        const activeCtx = state.layers[state.activeLayerIndex].ctx;
        activeCtx.lineCap = state.brushShape === 'round' ? 'round' : 'butt';
        activeCtx.lineJoin = 'round';
        activeCtx.lineWidth = state.size;

        if(state.tool === 'eraser') {
            activeCtx.globalCompositeOperation = 'destination-out';
            activeCtx.globalAlpha = state.opacity;
        } else {
            activeCtx.globalCompositeOperation = 'source-over';
            activeCtx.strokeStyle = state.color;
            activeCtx.fillStyle = state.color;
            activeCtx.globalAlpha = state.opacity;
        }

        if(state.smoothing === 0 || state.shapeMode !== 'none') {
            activeCtx.beginPath();
            activeCtx.moveTo(pos.x, pos.y);
        }
    }

    function draw(e) {
        if(state.isPanning && !e.touches) {
            const dx = e.clientX - state.lastPanX;
            const dy = e.clientY - state.lastPanY;
            state.panX += dx; state.panY += dy;
            state.lastPanX = e.clientX; state.lastPanY = e.clientY;
            updateView(); return;
        }

        if(!state.isDrawing) return;
        if(e.touches && e.touches.length > 1) return;
        e.preventDefault();

        const rect = canvasContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pos = getWorldPos(clientX - rect.left, clientY - rect.top);

        const activeLayer = state.layers[state.activeLayerIndex];
        const ctx = activeLayer.ctx;
        if(!activeLayer.visible) return;

        // Formas (Preview no DisplayCtx)
        if(state.shapeMode !== 'none') {
            renderCanvas();
            displayCtx.save();
            displayCtx.translate(state.panX, state.panY);
            displayCtx.scale(state.scale, state.scale);
            
            displayCtx.beginPath();
            displayCtx.lineWidth = state.size;
            displayCtx.strokeStyle = state.tool === 'eraser' ? '#fff' : state.color;
            
            if(state.shapeMode === 'line') {
                displayCtx.moveTo(state.startX, state.startY);
                displayCtx.lineTo(pos.x, pos.y);
            } else if (state.shapeMode === 'rect') {
                displayCtx.strokeRect(state.startX, state.startY, pos.x - state.startX, pos.y - state.startY);
            } else if (state.shapeMode === 'circle') {
                const r = Math.sqrt(Math.pow(pos.x - state.startX, 2) + Math.pow(pos.y - state.startY, 2));
                displayCtx.arc(state.startX, state.startY, r, 0, Math.PI * 2);
            }
            displayCtx.stroke();
            displayCtx.restore();
            return;
        }

        points.push(pos);

        // Suavização (Quadratic Curve)
        if(state.smoothing > 0) {
            if (points.length > 2) {
                const p1 = points[points.length - 3];
                const p2 = points[points.length - 2];
                const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                ctx.beginPath();
                ctx.moveTo(mid.x, mid.y);
                ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
                ctx.stroke();
            }
        } else {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
        renderCanvas();
    }

    function stopDraw(e) {
        if(state.isPanning) {
            state.isPanning = false; canvasContainer.style.cursor = 'default'; return;
        }
        if(!state.isDrawing) return;
        state.isDrawing = false;
        
        const activeLayer = state.layers[state.activeLayerIndex];
        const ctx = activeLayer.ctx;

        // Finalizar Forma
        if(state.shapeMode !== 'none') {
            const rect = canvasContainer.getBoundingClientRect();
            let clientX = e.clientX; let clientY = e.clientY;
            if(e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY;
            }
            const pos = getWorldPos(clientX - rect.left, clientY - rect.top);
            
            ctx.beginPath();
            if(state.shapeMode === 'line') {
                ctx.moveTo(state.startX, state.startY); ctx.lineTo(pos.x, pos.y); ctx.stroke();
            } else if (state.shapeMode === 'rect') {
                if(state.tool !== 'eraser') ctx.strokeRect(state.startX, state.startY, pos.x - state.startX, pos.y - state.startY);
                else ctx.clearRect(state.startX, state.startY, pos.x - state.startX, pos.y - state.startY);
            } else if (state.shapeMode === 'circle') {
                 const r = Math.sqrt(Math.pow(pos.x - state.startX, 2) + Math.pow(pos.y - state.startY, 2));
                 ctx.arc(state.startX, state.startY, r, 0, Math.PI * 2); ctx.stroke();
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
            const newScale = Math.min(Math.max(0.1, state.pinchStartScale * scaleChange), 5);
            
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
        
        // Obter cor do displayCanvas (que tem a composição de todas as camadas)
        const p = displayCtx.getImageData(pos.x, pos.y, 1, 1).data; 
        const hex = "#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1).toUpperCase();
        state.color = hex;
        colorPicker.value = hex;
        document.getElementById('tool-pen').click();
    }

    function fillLayer() {
        const ctx = state.layers[state.activeLayerIndex].ctx;
        ctx.fillStyle = state.color;
        ctx.globalAlpha = state.opacity;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, width, height);
        saveState(); renderLayersUI(); renderCanvas();
    }

    // --- UNDO / REDO ---
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
                const newLayer = new Layer(layerData.id, width, height);
                newLayer.ctx.drawImage(img, 0, 0);
                newLayer.visible = layerData.visible; newLayer.opacity = layerData.opacity; newLayer.name = layerData.name;
                state.layers[idx] = newLayer;
                loadedCount++;
                if(loadedCount === historyItem.length) {
                    state.activeLayerIndex = 0; renderLayersUI(); renderCanvas();
                }
            };
            // Adiciona a camada ao array temporariamente para manter a ordem
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
                const scale = Math.min(width/img.width, height/img.height);
                const w = img.width * scale; const h = img.height * scale;
                ctx.drawImage(img, (width-w)/2, (height-h)/2, w, h);
                state.layers[0].name = "Imagem";
                renderLayersUI(); renderCanvas(); saveState();
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Limpa o input file
    };

    document.getElementById('export-btn').onclick = () => {
        const link = document.createElement('a'); link.download = 'art.png';
        link.href = displayCanvas.toDataURL(); link.click();
    };
    
    // Salvar/Carregar Projeto (.draw JSON)
    document.getElementById('save-project-btn').onclick = () => {
        const projectData = { width, height, layers: state.layers.map(l => ({ id: l.id, name: l.name, visible: l.visible, opacity: l.opacity, data: l.canvas.toDataURL() })) };
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
                    // Adiciona a camada ao array temporariamente para manter a ordem
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
    }

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
        cursor.style.display = (state.tool === 'pen' || state.tool === 'eraser') ? 'block' : 'none';
        draw(e);
    });

    // --- EVENTOS UI ---
    // Painéis
    function togglePanel(panelId) {
        const target = document.getElementById(panelId);
        const isOpen = target.classList.contains('open');
        document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
        if(!isOpen) target.classList.add('open');
    }
    document.getElementById('actions-btn').onclick = () => togglePanel('actions-panel');
    document.getElementById('layers-btn').onclick = () => togglePanel('layers-panel');
    document.querySelectorAll('.close-btn').forEach(b => b.onclick = () => document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open')));
    
    // Abre o Painel de Configurações no duplo-clique para Pincel e Borracha
    document.getElementById('tool-pen').addEventListener('dblclick', () => togglePanel('settings-panel'));
    document.getElementById('tool-eraser').addEventListener('dblclick', () => togglePanel('settings-panel'));

    // Funcionalidade do link Home
    document.getElementById('home-btn').onclick = (e) => {
        e.preventDefault(); // Impede o comportamento padrão do link
        if (confirm("Se você não salvou, seu trabalho será perdido. Deseja realmente recarregar a página e voltar ao estado inicial?")) {
            window.location.reload();
        }
    };


    // Teclado
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

    // Ferramentas
    const toolBtns = document.querySelectorAll('.dock-btn');
    toolBtns.forEach(btn => {
        btn.onclick = () => {
            toolBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
            state.tool = btn.id.replace('tool-', '');
        };
    });

    // Sliders
    sizeSlider.oninput = (e) => { state.size = parseInt(e.target.value); document.getElementById('size-val').innerText = state.size + 'px'; updateCursorPreview(); };
    opacitySlider.oninput = (e) => state.opacity = parseInt(e.target.value)/100;
    smoothingSlider.oninput = (e) => state.smoothing = parseInt(e.target.value);
    colorPicker.oninput = (e) => state.color = e.target.value;
    layerOpacitySlider.oninput = (e) => { state.layers[state.activeLayerIndex].opacity = parseInt(e.target.value)/100; renderCanvas(); };
    
    // Botões
    document.getElementById('add-layer-btn').onclick = addLayer;
    document.getElementById('delete-layer-btn').onclick = deleteActiveLayer;
    document.getElementById('merge-layer-btn').onclick = mergeDown;
    document.getElementById('clear-layer-btn').onclick = () => { if(confirm('Tem certeza que deseja Limpar a Camada?')) { state.layers[state.activeLayerIndex].ctx.clearRect(0,0,width,height); renderLayersUI(); renderCanvas(); saveState(); }};

    document.querySelectorAll('.brush-btn').forEach(btn => btn.onclick = () => { document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); state.brushShape = btn.dataset.brush; });
    document.querySelectorAll('.shape-btn').forEach(btn => btn.onclick = () => { 
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active')); 
        btn.classList.add('active'); 
        state.shapeMode = btn.dataset.shape; 
    });
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => btn.onclick = () => {
        const type = btn.dataset.filter;
        const ctx = state.layers[state.activeLayerIndex].ctx;
        const imgData = ctx.getImageData(0,0,width,height); const data = imgData.data;
        for(let i=0; i<data.length; i+=4) {
            if(type === 'invert') { data[i]=255-data[i]; data[i+1]=255-data[i+1]; data[i+2]=255-data[i+2]; }
            else if (type === 'grayscale') { const avg=(data[i]+data[i+1]+data[i+2])/3; data[i]=avg; data[i+1]=avg; data[i+2]=avg; }
        }
        ctx.putImageData(imgData, 0, 0);
        if(type==='blur') { 
            // Para 'blur' é necessário desenhar sobre a imagem com filtro.
            ctx.filter='blur(5px)'; 
            ctx.drawImage(state.layers[state.activeLayerIndex].canvas, 0, 0); 
            ctx.filter='none'; 
        }
        renderLayersUI(); renderCanvas(); saveState();
    });

    // Listeners Mouse/Touch para Desenho
    canvasContainer.addEventListener('mousedown', startDraw);
    window.addEventListener('mouseup', stopDraw);
    
    // Init
    addLayer();
    updateView();
});
