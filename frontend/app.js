/* VisionInspect AI — Frontend Logic & Dashboard Rendering */

(function () {
    'use strict';

    // ── DOM References ────────────────────────────────────────────────────────
    const categorySelect  = document.getElementById('category-select');
    const yoloToggle      = document.getElementById('yolo-toggle');
    const yoloLabel       = document.getElementById('yolo-label');
    const uploadZone      = document.getElementById('upload-zone');
    const fileInput       = document.getElementById('file-input');
    const previewWrap     = document.getElementById('preview-wrap');
    const previewImg      = document.getElementById('preview-img');
    const analyzeBtn      = document.getElementById('analyze-btn');

    const emptyState      = document.getElementById('empty-state');
    const loadingOverlay  = document.getElementById('loading-overlay');
    const resultsPanel    = document.getElementById('results-panel');
    const serverStatusTxt = document.getElementById('server-status-text');
    const modelStatusTxt  = document.getElementById('model-status-text');

    const errorToast      = document.getElementById('error-toast');
    const errorMsg        = document.getElementById('error-msg');
    const toastClose      = document.getElementById('toast-close');

    // Verdict Header
    const verdictBadge    = document.getElementById('verdict-badge');
    const verdictCategory = document.getElementById('verdict-category');
    const verdictDefect   = document.getElementById('verdict-defect');
    const verdictConf     = document.getElementById('verdict-conf');
    const verdictTime     = document.getElementById('verdict-time');

    // 5 Visual Images
    const imgOriginal     = document.getElementById('img-original');
    const imgCropped      = document.getElementById('img-cropped');
    const imgReconstructed= document.getElementById('img-reconstructed');
    const imgHeatmap      = document.getElementById('img-heatmap');
    const imgOverlay      = document.getElementById('img-overlay');

    // Score & Gauge Bar
    const anomalyScoreVal = document.getElementById('anomaly-score-val');
    const thresholdVal    = document.getElementById('threshold-val');
    const barFill         = document.getElementById('bar-fill');
    const barMarker       = document.getElementById('bar-marker');
    const barMarkerLabel  = document.getElementById('bar-marker-label');
    const barScaleMid     = document.getElementById('bar-scale-mid');
    const barScaleMax     = document.getElementById('bar-scale-max');

    // 8 Dashboard Metrics
    const metricCatVal    = document.getElementById('metric-category-val');
    const metricPredVal   = document.getElementById('metric-prediction-val');
    const defectTypeVal   = document.getElementById('defect-type-val');
    const metricErrorVal  = document.getElementById('metric-error-val');
    const metricThreshVal = document.getElementById('metric-threshold-val');
    const metricConfVal   = document.getElementById('metric-conf-val');
    const severityLevelVal= document.getElementById('severity-level-val');
    const metricTimeVal   = document.getElementById('metric-time-val');

    const actionBanner    = document.getElementById('action-banner');
    const actionText      = document.getElementById('action-text');
    const breakdownBars   = document.getElementById('breakdown-bars');

    // ── State ─────────────────────────────────────────────────────────────────
    let selectedFile = null;

    // ── Server Status Check ───────────────────────────────────────────────────
    async function checkServerStatus() {
        try {
            const cat = categorySelect.value === 'auto' ? 'bottle' : categorySelect.value;
            const r = await fetch(`/status?category=${cat}`);
            if (r.ok) {
                const data = await r.json();
                serverStatusTxt.textContent = 'System Online';
                serverStatusTxt.style.color = '#22c55e';
                document.querySelector('.pulse-dot').style.background = '#22c55e';
                document.querySelector('.pulse-dot').style.boxShadow = '0 0 8px #22c55e';

                if (data.model_loaded) {
                    modelStatusTxt.textContent = `Model: Loaded (${cat})`;
                    modelStatusTxt.style.color = '#22c55e';
                } else {
                    modelStatusTxt.textContent = `Model: Baseline (${cat})`;
                    modelStatusTxt.style.color = '#f59e0b';
                }
            } else { throw new Error(); }
        } catch {
            serverStatusTxt.textContent = 'Offline — check server';
            serverStatusTxt.style.color = '#ef4444';
            document.querySelector('.pulse-dot').style.background = '#ef4444';
            document.querySelector('.pulse-dot').style.boxShadow = '0 0 8px #ef4444';
            modelStatusTxt.textContent = 'Model: Unavailable';
        }
    }
    checkServerStatus();
    setInterval(checkServerStatus, 20000);

    categorySelect.addEventListener('change', checkServerStatus);

    // ── YOLO Toggle Label ─────────────────────────────────────────────────────
    yoloToggle.addEventListener('change', () => {
        yoloLabel.textContent = yoloToggle.checked ? 'Enabled' : 'Disabled';
    });

    // ── Toast Close ───────────────────────────────────────────────────────────
    toastClose.addEventListener('click', () => {
        errorToast.classList.add('hidden');
    });

    function showError(msg) {
        errorMsg.textContent = msg;
        errorToast.classList.remove('hidden');
    }

    // ── File Selection ────────────────────────────────────────────────────────
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            showError('Please upload a valid image file (PNG, JPG, BMP, TIFF).');
            return;
        }
        selectedFile = file;
        errorToast.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            previewWrap.classList.remove('hidden');
            uploadZone.querySelector('.upload-text').textContent = file.name;
        };
        reader.readAsDataURL(file);
        analyzeBtn.disabled = false;
        resultsPanel.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }

    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    // ── Analyze Button Click ──────────────────────────────────────────────────
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const category   = categorySelect.value;
        const enableYolo = yoloToggle.checked;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', category);
        formData.append('enable_yolo', enableYolo);

        emptyState.classList.add('hidden');
        resultsPanel.classList.add('hidden');
        errorToast.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');
        analyzeBtn.disabled = true;

        // Animated step sequence
        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');
        const step3 = document.getElementById('step-3');

        step1.className = 'step-item active';
        step2.className = 'step-item';
        step3.className = 'step-item';

        const t1Timer = setTimeout(() => { step2.className = 'step-item active'; }, 300);
        const t2Timer = setTimeout(() => { step3.className = 'step-item active'; }, 700);

        const startTime = performance.now();

        try {
            const url = `/predict?category=${encodeURIComponent(category)}&enable_yolo=${enableYolo}`;
            const resp = await fetch(url, { method: 'POST', body: formData });
            const data = await resp.json();
            const elapsed = Math.round(performance.now() - startTime);

            if (!resp.ok) {
                showError(`Inspection Error: ${data.detail || 'Unknown server error'}`);
                emptyState.classList.remove('hidden');
                return;
            }

            renderResults(data, category, elapsed);
        } catch (err) {
            console.error('API Error:', err);
            showError('Cannot connect to backend server. Please verify http://127.0.0.1:8000 is running.');
            emptyState.classList.remove('hidden');
        } finally {
            clearTimeout(t1Timer);
            clearTimeout(t2Timer);
            loadingOverlay.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    });

    // ── Render Results Dashboard ──────────────────────────────────────────────
    function renderResults(data, category, clientElapsedMs) {
        resultsPanel.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // ── 5 Visual Images ──
        imgOriginal.src      = data.images?.original      || data.original_image      || '';
        imgCropped.src       = data.images?.cropped       || data.cropped_image       || '';
        imgReconstructed.src = data.images?.reconstructed || data.reconstructed_image || imgCropped.src;
        imgHeatmap.src       = data.images?.heatmap       || data.heatmap_image       || '';
        imgOverlay.src       = data.images?.overlay       || data.images?.defect_overlay || data.overlay_image || '';

        // ── Verdict Header ──
        const result = data.defect_result || 'UNKNOWN';
        const defect = data.defect_class  || '—';
        const confVal = data.confidence_score != null
            ? (data.confidence_score > 1 ? data.confidence_score.toFixed(1) : (data.confidence_score * 100).toFixed(1))
            : '—';
        const procTime = data.processing_time_ms ? `${data.processing_time_ms.toFixed(1)} ms` : `${clientElapsedMs} ms`;

        verdictBadge.className = 'verdict-badge';
        if (result === 'PASS') {
            verdictBadge.classList.add('pass');
            verdictBadge.textContent = '✓ PASS';
        } else if (result === 'INVALID_IMAGE') {
            verdictBadge.classList.add('invalid');
            verdictBadge.textContent = '⚠ INVALID IMAGE';
        } else {
            verdictBadge.classList.add('reject');
            verdictBadge.textContent = '✗ REJECT';
        }

        const activeCat = (data.category || category).replace(/_/g, ' ').toUpperCase();
        verdictCategory.textContent = activeCat;
        verdictDefect.textContent   = result === 'PASS' ? 'No Defect' : defect.replace(/_/g, ' ');
        verdictConf.textContent     = `${confVal}%`;
        verdictTime.textContent     = procTime;

        // ── Reconstruction Score & Threshold Gauge ──
        const score  = data.anomaly_score ?? 0;
        const thresh = data.threshold ?? 0.05;

        anomalyScoreVal.textContent = score.toFixed(5);
        thresholdVal.textContent    = thresh.toFixed(5);

        if (result === 'PASS') {
            anomalyScoreVal.style.color = '#22c55e';
        } else if (result === 'INVALID_IMAGE') {
            anomalyScoreVal.style.color = '#f59e0b';
        } else {
            anomalyScoreVal.style.color = '#ef4444';
        }

        const barMax    = Math.max(thresh * 2, score * 1.15, 0.1);
        const fillPct   = Math.min(100, (score / barMax) * 100);
        const markerPct = Math.min(100, (thresh / barMax) * 100);

        barFill.style.width = `${fillPct}%`;
        barFill.style.background = result === 'PASS'
            ? 'linear-gradient(90deg, #22c55e88, #22c55e)'
            : result === 'REJECT'
            ? 'linear-gradient(90deg, #ef444488, #ef4444)'
            : 'linear-gradient(90deg, #f59e0b88, #f59e0b)';

        barMarker.style.left      = `${markerPct}%`;
        barMarkerLabel.style.left = `${markerPct}%`;

        barScaleMid.textContent = (barMax / 2).toFixed(4);
        barScaleMax.textContent = barMax.toFixed(4);

        // ── 8 Metrics Grid Cards ──
        metricCatVal.textContent   = activeCat;
        metricPredVal.textContent  = result === 'PASS' ? 'GOOD' : (result === 'REJECT' ? 'DEFECTIVE' : 'INVALID');
        metricPredVal.style.color  = result === 'PASS' ? '#22c55e' : (result === 'REJECT' ? '#ef4444' : '#f59e0b');

        defectTypeVal.textContent   = result === 'PASS' ? 'None' : defect.replace(/_/g, ' ');
        metricErrorVal.textContent  = score.toFixed(5);
        metricThreshVal.textContent = thresh.toFixed(5);
        metricConfVal.textContent   = `${confVal}%`;

        severityLevelVal.textContent = data.severity_level || 'NONE';
        metricTimeVal.textContent    = procTime;

        // Color severity level
        const sev = (data.severity_level || '').toLowerCase();
        if (sev.includes('critical') || sev.includes('high')) {
            severityLevelVal.style.color = '#ef4444';
        } else if (sev.includes('medium') || sev.includes('moderate')) {
            severityLevelVal.style.color = '#f59e0b';
        } else {
            severityLevelVal.style.color = '#22c55e';
        }

        // ── Operator Action Banner ──
        actionBanner.className = 'action-banner glass';
        actionText.textContent = data.recommended_action || '—';
        if (result === 'PASS')        { actionBanner.classList.add('pass'); }
        else if (result === 'REJECT') { actionBanner.classList.add('reject'); }
        else                          { actionBanner.classList.add('warn'); }

        // ── Severity Breakdown Bars ──
        const breakdown = data.severity_breakdown || {};
        breakdownBars.innerHTML = '';

        const SKIP_KEYS = new Set(['total_severity', 'defect_type', 'severity_level', 'recommended_action']);
        for (const [key, val] of Object.entries(breakdown)) {
            if (SKIP_KEYS.has(key) || typeof val !== 'number') continue;

            const pct = Math.min(100, Math.max(0, val * 100));
            let fillColor = '#22c55e';
            if (pct > 70) fillColor = '#ef4444';
            else if (pct > 35) fillColor = '#f59e0b';

            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            const row = document.createElement('div');
            row.className = 'breakdown-row';
            row.innerHTML = `
                <div class="breakdown-row-header">
                    <span>${label}</span>
                    <strong>${pct.toFixed(1)}%</strong>
                </div>
                <div class="breakdown-track">
                    <div class="breakdown-fill" style="width:${pct}%; background:${fillColor}"></div>
                </div>
            `;
            breakdownBars.appendChild(row);
        }
    }

})();
