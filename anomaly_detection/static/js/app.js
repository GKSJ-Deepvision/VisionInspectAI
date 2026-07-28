// VisionInspectAI Dashboard Client Logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        categorySelect: document.getElementById('category-select'),
        yoloToggle: document.getElementById('yolo-toggle'),
        fileInput: document.getElementById('file-input'),
        browseBtn: document.getElementById('browse-btn'),
        dropZone: document.getElementById('drop-zone'),
        previewCard: document.getElementById('preview-card'),
        previewImg: document.getElementById('preview-img'),
        removeBtn: document.getElementById('remove-btn'),
        inspectBtn: document.getElementById('inspect-btn'),
        
        // Tabs & Views
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabPanels: document.querySelectorAll('.tab-panel'),
        
        // Single Results
        welcomePanel: document.getElementById('single-welcome'),
        resultsPanel: document.getElementById('single-results'),
        statusBadge: document.getElementById('metric-status'),
        defectType: document.getElementById('metric-defect'),
        confidence: document.getElementById('metric-confidence'),
        severity: document.getElementById('metric-severity'),
        anomalyScore: document.getElementById('metric-anomaly'),
        imgOriginal: document.getElementById('img-original'),
        imgYolo: document.getElementById('img-yolo'),
        imgHeatmap: document.getElementById('img-heatmap'),
        loadingScreen: document.getElementById('loading-screen'),
        
        // Lightbox
        lightboxModal: document.getElementById('lightbox-modal'),
        lightboxImg: document.getElementById('lightbox-img'),
        
        // Status Meta
        devicePill: document.getElementById('device-pill'),
        catPill: document.getElementById('cat-pill')
    };

    let selectedFile = null;

    // Fetch Initial System Status
    async function fetchSystemStatus() {
        try {
            const res = await fetch('/status');
            const data = await res.json();
            if (elements.devicePill) elements.devicePill.textContent = `Device: ${data.device}`;
            if (elements.catPill) elements.catPill.textContent = `Category: ${data.category}`;
            if (elements.categorySelect) elements.categorySelect.value = data.category;
        } catch (err) {
            console.error("Failed to fetch system status:", err);
        }
    }
    fetchSystemStatus();

    // Category Change Listener
    elements.categorySelect.addEventListener('change', async (e) => {
        const cat = e.target.value;
        try {
            await fetch('/set_category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: cat })
            });
            if (elements.catPill) elements.catPill.textContent = `Category: ${cat}`;
        } catch (err) {
            console.error("Failed to set category:", err);
        }
    });

    // Explicit File Picker Trigger via Browse Button
    elements.browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.fileInput.click();
    });

    // Drag and drop handlers
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
    });

    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });

    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // File Input Change Listener
    elements.fileInput.addEventListener('change', (e) => {
        if (elements.fileInput.files && elements.fileInput.files.length > 0) {
            handleFileSelect(elements.fileInput.files[0]);
        }
    });

    function isImageFile(file) {
        if (!file) return false;
        if (file.type && file.type.startsWith('image/')) return true;
        const ext = (file.name || '').split('.').pop().toLowerCase();
        return ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'tif', 'tiff', 'gif'].includes(ext);
    }

    function handleFileSelect(file) {
        if (!isImageFile(file)) {
            alert('Please select a valid image file (PNG, JPG, JPEG, BMP, WEBP).');
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.previewImg.src = e.target.result;
            elements.dropZone.style.display = 'none';
            elements.previewCard.style.display = 'block';
            elements.inspectBtn.removeAttribute('disabled');
        };
        reader.readAsDataURL(file);
    }

    // Remove File Handler
    elements.removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectedFile = null;
        elements.fileInput.value = '';
        elements.previewImg.src = '';
        elements.previewCard.style.display = 'none';
        elements.dropZone.style.display = 'flex';
        elements.inspectBtn.setAttribute('disabled', 'true');
    });

    // Tab Navigation
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            elements.tabPanels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(`panel-${targetId}`).classList.add('active');
            
            if (targetId === 'analytics') loadAnalytics();
            if (targetId === 'history') loadHistory();
        });
    });

    // Inspect Product Single Prediction
    elements.inspectBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        elements.loadingScreen.style.display = 'flex';
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', elements.categorySelect.value);
        formData.append('enable_yolo', elements.yoloToggle.checked ? 'true' : 'false');
        
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (!response.ok) {
                alert(`⚠️ Product Category Mismatch / Validation Alert:\n\n${data.detail || 'The uploaded image does not match the selected manufacturing category.'}`);
                return;
            }
            
            // Render Metric Cards
            if (data.defect_result === 'REJECT') {
                elements.statusBadge.textContent = 'REJECT';
                elements.statusBadge.className = 'badge-reject';
            } else {
                elements.statusBadge.textContent = 'PASS';
                elements.statusBadge.className = 'badge-pass';
            }
            
            elements.defectType.textContent = data.defect_class || 'Good';
            elements.confidence.textContent = `${((data.confidence_score || 0.99) * 100).toFixed(1)}%`;
            elements.severity.textContent = `${(data.severity_score || 0).toFixed(1)} (${data.severity_level || 'None'})`;
            elements.anomalyScore.textContent = `${(data.anomaly_score || 0).toFixed(4)} / ${(data.threshold || 0.125).toFixed(4)}`;
            
            // Update Anomaly Gauge Meter
            const score = data.anomaly_score || 0;
            const threshold = data.threshold || 0.125;
            const pct = Math.min(100, Math.max(5, (score / (threshold * 1.4)) * 100));
            const gaugeBar = document.getElementById('gauge-bar');
            const gaugeLabel = document.getElementById('gauge-label');

            if (gaugeBar && gaugeLabel) {
                gaugeBar.style.width = `${pct}%`;
                if (data.defect_result === 'REJECT') {
                    gaugeBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
                    gaugeLabel.textContent = `${score.toFixed(4)} / ${threshold.toFixed(4)} (THRESHOLD EXCEEDED — REJECT)`;
                    gaugeLabel.style.color = 'var(--danger)';
                } else {
                    gaugeBar.style.background = 'linear-gradient(90deg, #10b981, #00d2ff)';
                    gaugeLabel.textContent = `${score.toFixed(4)} / ${threshold.toFixed(4)} (SAFE QUALITY VERIFIED — PASS)`;
                    gaugeLabel.style.color = 'var(--success)';
                }
            }
            
            // Render 4 Viewport Images
            elements.imgOriginal.src = data.original_image || elements.previewImg.src;
            elements.imgYolo.src = data.cropped_image || elements.previewImg.src;
            elements.imgHeatmap.src = data.overlay_image || data.heatmap_image;
            
            const defectBoxImg = document.getElementById('img-defect-box');
            if (defectBoxImg) {
                defectBoxImg.src = data.defect_overlay_image || data.cropped_image || elements.previewImg.src;
            }
            
            // Toggle view
            elements.welcomePanel.style.display = 'none';
            elements.resultsPanel.style.display = 'flex';
            
        } catch (err) {
            console.error("Inspection error:", err);
            alert("Failed to connect to inspection server.");
        } finally {
            elements.loadingScreen.style.display = 'none';
        }
    });

    // Lightbox Zoom
    document.querySelectorAll('.image-viewport').forEach(vp => {
        vp.addEventListener('click', () => {
            const img = vp.querySelector('img');
            if (img && img.src) {
                elements.lightboxImg.src = img.src;
                elements.lightboxModal.style.display = 'flex';
            }
        });
    });

    elements.lightboxModal.addEventListener('click', () => {
        elements.lightboxModal.style.display = 'none';
    });

    // Analytics Placeholder Function
    async function loadAnalytics() {
        try {
            const res = await fetch('/analytics/risk-assessment');
            const data = await res.json();
            console.log("Analytics data:", data);
        } catch (e) {
            console.error("Failed to load analytics:", e);
        }
    }

    // History Placeholder Function
    async function loadHistory() {
        try {
            const res = await fetch('/history');
            const data = await res.json();
            const tbody = document.getElementById('history-tbody');
            if (tbody) {
                tbody.innerHTML = data.map(item => `
                    <tr>
                        <td>${new Date(item.timestamp * 1000).toLocaleString()}</td>
                        <td><strong>${item.category}</strong></td>
                        <td><span class="${item.defect_result === 'REJECT' ? 'badge-reject' : 'badge-pass'}">${item.defect_result}</span></td>
                        <td>${item.defect_class}</td>
                        <td>${(item.confidence_score * 100).toFixed(1)}%</td>
                        <td>${item.severity_score.toFixed(1)}</td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error("Failed to load history:", e);
        }
    }
});
