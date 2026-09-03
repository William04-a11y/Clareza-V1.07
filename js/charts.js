/* ==========================================================================
   CLAREZA v1.07 — js/charts.js
   Gráficos leves desenhados em <canvas> com JavaScript puro (sem
   bibliotecas externas), usados no Dashboard e em Relatórios.
   ========================================================================== */

(function (window) {
  'use strict';

  /* Prepara o canvas para desenho nítido em telas de alta densidade ------ */
  function setupCanvas(canvas, heightPx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const widthCss = rect.width || canvas.clientWidth || 320;
    const heightCss = heightPx || rect.height || canvas.clientHeight || 220;

    canvas.width = widthCss * dpr;
    canvas.height = heightCss * dpr;
    canvas.style.height = `${heightCss}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: widthCss, height: heightCss };
  }

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim() : fallback;
  }

  function hexToRgba(hex, alpha) {
    const clean = String(hex).replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function roundRectTop(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, h, w / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  /* ------------------------------------------------------------------
     Gráfico de barras verticais
     opts: { labels, values, color, height }
     ------------------------------------------------------------------ */
  function renderBarChart(canvas, { labels = [], values = [], color, height = 220 } = {}) {
    const { ctx, width, height: h } = setupCanvas(canvas, height);
    ctx.clearRect(0, 0, width, h);
    if (!values.length) return;

    const barColor = color || cssVar('--color-primary-700', '#1F5C63');
    const gridColor = cssVar('--color-border', '#DDE5E1');
    const textColor = cssVar('--color-text-faint', '#8B9B95');

    const paddingX = 10;
    const paddingTop = 12;
    const paddingBottom = 26;
    const chartW = width - paddingX * 2;
    const chartH = h - paddingTop - paddingBottom;
    const maxVal = Math.max(...values, 1);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = paddingTop + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();
    }

    const slot = chartW / values.length;
    const barWidth = slot * 0.5;

    values.forEach((val, i) => {
      const barH = Math.max((val / maxVal) * chartH, 2);
      const x = paddingX + i * slot + (slot - barWidth) / 2;
      const y = paddingTop + chartH - barH;

      ctx.fillStyle = barColor;
      roundRectTop(ctx, x, y, barWidth, barH, 5);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] ?? '', x + barWidth / 2, h - 8);
    });
  }

  /* ------------------------------------------------------------------
     Gráfico de linha (com preenchimento em degradê)
     opts: { labels, values, color, height, fill }
     ------------------------------------------------------------------ */
  function renderLineChart(canvas, { labels = [], values = [], color, height = 220, fill = true } = {}) {
    const { ctx, width, height: h } = setupCanvas(canvas, height);
    ctx.clearRect(0, 0, width, h);
    if (values.length < 2) return;

    const lineColor = color || cssVar('--color-primary-700', '#1F5C63');
    const gridColor = cssVar('--color-border', '#DDE5E1');
    const textColor = cssVar('--color-text-faint', '#8B9B95');

    const paddingX = 10;
    const paddingTop = 16;
    const paddingBottom = 26;
    const chartW = width - paddingX * 2;
    const chartH = h - paddingTop - paddingBottom;

    const maxVal = Math.max(...values) * 1.15 || 1;
    const stepX = chartW / (values.length - 1);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = paddingTop + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();
    }

    const points = values.map((val, i) => ({
      x: paddingX + stepX * i,
      y: paddingTop + chartH - (val / maxVal) * chartH,
    }));

    if (fill) {
      const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartH);
      gradient.addColorStop(0, hexToRgba(lineColor, 0.22));
      gradient.addColorStop(1, hexToRgba(lineColor, 0));
      ctx.beginPath();
      ctx.moveTo(points[0].x, paddingTop + chartH);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
    });

    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      if (points[i]) ctx.fillText(label, points[i].x, h - 8);
    });
  }

  /* ------------------------------------------------------------------
     Gráfico de rosca (donut)
     opts: { segments: [{label, value, color}], height, thickness }
     ------------------------------------------------------------------ */
  function renderDonutChart(canvas, { segments = [], height = 180, thickness = 20 } = {}) {
    const { ctx, width, height: h } = setupCanvas(canvas, height);
    ctx.clearRect(0, 0, width, h);
    if (!segments.length) return;

    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
    const cx = width / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - thickness / 2 - 4;

    let startAngle = -Math.PI / 2;
    segments.forEach((seg) => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = thickness;
      ctx.stroke();
      startAngle += sliceAngle;
    });

    ctx.fillStyle = cssVar('--color-primary-900', '#0F3438');
    ctx.font = '600 20px Fraunces, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy - 6);

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = cssVar('--color-text-faint', '#8B9B95');
    ctx.fillText('total', cx, cy + 13);
  }

  /**
   * Redesenha todos os gráficos registrados quando a janela é
   * redimensionada (debounced), mantendo o layout responsivo.
   */
  function onResizeRedraw(drawFns, delay = 200) {
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => drawFns.forEach((fn) => fn()), delay);
    });
  }

  window.ClarezaCharts = {
    renderBarChart,
    renderLineChart,
    renderDonutChart,
    onResizeRedraw,
  };
})(window);
