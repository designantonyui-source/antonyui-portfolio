/* =============================================
   ANTONY BOZHATARNYK — Portfolio Shared JS
   ============================================= */

// ---- THEME ----
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  document.getElementById('btn-dark').classList.toggle('active', t === 'dark');
  document.getElementById('btn-light').classList.toggle('active', t === 'light');
  // Notify embedded iframes (postMessage fallback for same-tab contexts)
  document.querySelectorAll('iframe').forEach(function (f) {
    try { f.contentWindow.postMessage({ type: 'theme', value: t }, '*'); } catch (e) {}
  });
}

// Apply saved theme on load (before paint to avoid flash)
(function () {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', () => {
    const btnDark  = document.getElementById('btn-dark');
    const btnLight = document.getElementById('btn-light');
    if (btnDark)  btnDark.classList.toggle('active',  saved === 'dark');
    if (btnLight) btnLight.classList.toggle('active', saved === 'light');
  });
})();

// ---- MOBILE MENU ----
document.addEventListener('DOMContentLoaded', () => {
  const btn   = document.getElementById('nav-menu-btn');
  const panel = document.getElementById('nav-mobile');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  panel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      panel.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
});

// ---- ACTIVE NAV LINK ----
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href.replace(/^\.\.\//, ''))) {
      link.classList.add('active');
    }
  });
});

// ---- SCROLL PROGRESS BAR (case study pages) ----
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
});

// ---- RULERS ----
document.addEventListener('DOMContentLoaded', () => {
  const W = 28; // ruler width in px

  // Create ruler wrapper divs
  const leftWrap  = document.createElement('div');
  const rightWrap = document.createElement('div');
  leftWrap.className  = 'ruler-wrap ruler-left';
  rightWrap.className = 'ruler-wrap ruler-right';
  document.body.appendChild(leftWrap);
  document.body.appendChild(rightWrap);

  function buildSVG(side) {
    const vh      = window.innerHeight;
    const scrollY = window.scrollY;
    const lineX   = side === 'left' ? W - 1 : 1;
    // Text sits in the middle of the space beside the line
    const textX   = side === 'left' ? Math.round((W - 1) / 2) : Math.round(W / 2) + 1;

    let ticks = '';
    let labels = '';

    // Snap start to nearest 10px below scrollY
    const startAbs = Math.ceil(scrollY / 10) * 10;

    for (let absY = startAbs; absY <= scrollY + vh + 10; absY += 10) {
      const y = absY - scrollY;
      if (y < 0 || y > vh) continue;

      const isMajor  = absY % 50 === 0;
      const isMedium = absY % 25 === 0 && !isMajor;
      const tickLen  = isMajor ? 9 : isMedium ? 5 : 3;

      const x1 = side === 'left'  ? lineX - tickLen : lineX;
      const x2 = side === 'right' ? lineX + tickLen : lineX;

      ticks += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"
        stroke="var(--faint)" stroke-width="1" shape-rendering="crispEdges"/>`;

      if (isMajor) {
        // Rotate -90° around the text anchor point so numbers read bottom-to-top
        labels += `<text
          x="${textX}" y="${y}"
          font-size="8" font-family="'Geist Mono', monospace"
          fill="var(--faint)" text-anchor="middle" dominant-baseline="middle"
          transform="rotate(-90 ${textX} ${y})">${absY}</text>`;
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg"
      width="${W}" height="${vh}" shape-rendering="crispEdges">
      <line x1="${lineX}" y1="0" x2="${lineX}" y2="${vh}"
        stroke="var(--border)" stroke-width="1"/>
      ${ticks}${labels}
    </svg>`;
  }

  function render() {
    leftWrap.innerHTML  = buildSVG('left');
    rightWrap.innerHTML = buildSVG('right');
  }

  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', render, { passive: true });
  render();
});

// ---- READ TIME ----
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('read-time');
  if (!el) return;
  const words = document.body.innerText.split(/\s+/).length;
  const mins  = Math.ceil(words / 200);
  el.textContent = `${mins} min read`;
});

// ---- LIGHTBOX ----
document.addEventListener('DOMContentLoaded', () => {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = '<button class="lb-close" aria-label="Close">✕</button><img src="" alt="">';
  document.body.appendChild(overlay);

  const lbImg   = overlay.querySelector('img');
  const lbClose = overlay.querySelector('.lb-close');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  // Add zoom to case study images — skip anything inside a link (work cards) or nav
  document.querySelectorAll('img.case-img, .img-row img, .hero-images img').forEach(img => {
    if (img.closest('a.work-card') || img.closest('.nav-logo') || img.classList.contains('nav-avatar')) return;
    img.classList.add('img-zoomable');
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  // Close on overlay click (not on image itself)
  overlay.addEventListener('click', (e) => {
    if (e.target !== lbImg) closeLightbox();
  });
  lbClose.addEventListener('click', closeLightbox);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
});
