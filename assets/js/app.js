/* =============================================================
   ANTON BOZHATARNYK — Portfolio shared JS
   -------------------------------------------------------------
   Loaded in <head> WITHOUT `defer` on purpose: the theme must be
   applied before first paint to avoid a flash of the wrong theme.
   Everything else waits for DOMContentLoaded.
   ============================================================= */
(function () {
  'use strict';

  var THEMES = ['dark', 'light'];
  var DEFAULT_THEME = 'dark';
  var THEME_COLORS = { dark: '#0f0f0e', light: '#fafafa' };
  var RULER_WIDTH = 28;
  var RULER_MIN_VIEWPORT = 1041;   // rulers are hidden by CSS at <=1040px
  var MOBILE_BREAKPOINT = '(min-width: 641px)';
  // The active Lenis instance, or null when momentum scrolling is off
  // (reduced motion, or the library missing). Shared by the smooth-scroll,
  // anchor and lightbox modules below.
  var scroller = null;

  /* ---------- helpers ---------- */

  // localStorage throws in private mode and some sandboxed frames — never let it break the page.
  var storage = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* non-fatal */ }
    }
  };

  // Run a layout-reading handler at most once per animation frame.
  function rafThrottle(handler) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        handler();
      });
    };
  }

  function each(selector, root, fn) {
    var nodes = (root || document).querySelectorAll(selector);
    Array.prototype.forEach.call(nodes, fn);
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ---------- theme ---------- */

  var currentTheme = null;

  // Single source of truth for theme state: attribute, buttons, meta tag, embeds.
  function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) theme = DEFAULT_THEME;
    currentTheme = theme;

    document.documentElement.setAttribute('data-theme', theme);

    THEMES.forEach(function (name) {
      var btn = document.getElementById('btn-' + name);
      if (!btn) return;
      var isActive = name === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);

    // Keep embedded iframes in sync (same-tab contexts only).
    each('iframe', document, function (frame) {
      try {
        frame.contentWindow.postMessage({ type: 'theme', value: theme }, '*');
      } catch (e) { /* cross-origin — ignore */ }
    });
  }

  // Public API — referenced by the inline onclick handlers in the nav.
  window.setTheme = function (theme) {
    storage.set('theme', theme);
    applyTheme(theme);
  };

  // Runs before first paint. The buttons don't exist yet; applyTheme guards for that.
  applyTheme(storage.get('theme') || DEFAULT_THEME);

  // Re-apply once the buttons exist so their active/aria state is correct.
  onReady(function () { applyTheme(currentTheme); });

  /* ---------- motion gate (runs in <head>, before first paint) ---------- */
  // Marks the document as motion-capable and guarantees the hero entrance
  // completes: heroIn() doubles as the failsafe below, so the hero can never
  // stay hidden — same 5.2s ceiling as the preloader's own. Under reduced
  // motion neither class is set and the page renders completely static.
  var heroInWaiters = [];
  // Set true once the scroll-reveal module is fully wired; the failsafe below
  // uses it to tell "module works, reveals are coming" from "module died".
  var revealsReady = false;

  function heroIn() {
    if (document.documentElement.classList.contains('hero-in')) return;
    document.documentElement.classList.add('hero-in');
    var waiters = heroInWaiters;
    heroInWaiters = [];
    for (var w = 0; w < waiters.length; w++) waiters[w]();
  }

  // Run now if the entrance has already fired, once it does otherwise.
  function onHeroIn(fn) {
    if (document.documentElement.classList.contains('hero-in')) fn();
    else heroInWaiters.push(fn);
  }

  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    document.documentElement.classList.add('motion-ok');
    window.setTimeout(function () {
      heroIn();
      // Catastrophic-failure net: if the reveal module never finished wiring,
      // release its hidden state so the page can never stay invisible.
      if (!revealsReady) document.documentElement.classList.add('static-fallback');
    }, 5200);
  }

  /* ---------- mobile menu ---------- */

  onReady(function () {
    var btn = document.getElementById('nav-menu-btn');
    var panel = document.getElementById('nav-mobile');
    if (!btn || !panel) return;

    function setMenu(open) {
      panel.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function () {
      setMenu(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Close after navigating from the panel.
    each('a', panel, function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    // Escape closes the menu and returns focus to the toggle.
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (btn.getAttribute('aria-expanded') !== 'true') return;
      setMenu(false);
      btn.focus();
    });

    // Reset on the way up to the desktop layout so the state can't get stuck.
    var mq = window.matchMedia(MOBILE_BREAKPOINT);
    var onChange = function (event) { if (event.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);   // Safari < 14
  });

  /* ---------- current nav link ---------- */

  onReady(function () {
    // Normalise directory URLs and explicit index.html to one value so that
    // /blog/ and /blog/index.html both match the same nav link.
    var here = window.location.pathname.replace(/index\.html$/, '');

    each('.nav-links a, .nav-mobile-inner a', document, function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('mailto:') === 0) return;

      // Section anchor links (e.g. #expertise or ../index.html#expertise) are not page links.
      // They should only be active if the current URL hash actually matches.
      if (href.indexOf('#') !== -1) {
        var hash = href.split('#')[1];
        if (!hash || window.location.hash !== '#' + hash) return;
      }

      var pathPart = href.split('#')[0].split('?')[0];
      if (!pathPart) return;   // same-page anchor — nothing to compare

      var resolved;
      try {
        resolved = new URL(pathPart, window.location.href).pathname.replace(/index\.html$/, '');
      } catch (e) {
        return;   // malformed href — ignore
      }

      // Exact page match, or a section match so that case studies
      // (/work/priwatt) and blog posts still light up Work / Blog.
      var isCurrent = resolved === here || (resolved !== '/' && here.indexOf(resolved) === 0);
      if (!isCurrent) return;

      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });
  });

  /* ---------- smooth scroll (Lenis) ---------- */
  // Vendored Lenis (assets/js/lenis.min.js — MIT, no build step) drives the
  // momentum scrolling. Touch scrolling stays native (Lenis's default) and the
  // module is skipped under prefers-reduced-motion, where the page scrolls
  // exactly as the browser intends.

  onReady(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!window.Lenis || (reduceMotion && reduceMotion.matches)) return;

    // anchors: false — the module below owns hash links so the skip link can
    // keep its instant jump.
    scroller = new window.Lenis({ lerp: 0.1, anchors: false });

    // Lenis steps from rAF but brings no loop of its own.
    function frame(time) {
      scroller.raf(time);
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  });

  /* ---------- in-page anchors ---------- */
  // Hash links glide through the scroller (native smooth scroll as fallback).
  // The skip link is deliberately excluded: keyboard users expect it to jump.

  onReady(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    each('a[href^="#"]', document, function (link) {
      var id = link.getAttribute('href').slice(1);
      if (!id || link.classList.contains('skip-link')) return;

      link.addEventListener('click', function (event) {
        var target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();

        // Lenis honours the target's scroll-margin itself; scrollIntoView does
        // too — so no manual offset on either path.
        if (scroller) {
          scroller.scrollTo(target);
        } else {
          target.scrollIntoView({
            behavior: (reduceMotion && reduceMotion.matches) ? 'auto' : 'smooth',
            block: 'start'
          });
        }
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '#' + id);
        }
      });
    });
  });

  /* ---------- scroll progress bar ---------- */

  onReady(function () {
    var bar = document.getElementById('progress-bar');
    if (!bar) return;

    var update = function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = scrollable > 0 ? (window.scrollY / scrollable * 100) + '%' : '0%';
    };

    var schedule = rafThrottle(update);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  });

  /* ---------- page rulers ---------- */

  onReady(function () {
    var left = document.createElement('div');
    var right = document.createElement('div');
    left.className = 'ruler-wrap ruler-left';
    right.className = 'ruler-wrap ruler-right';
    document.body.appendChild(left);
    document.body.appendChild(right);

    function build(side) {
      var viewportH = window.innerHeight;
      var scrollTop = Math.round(window.scrollY);
      var lineX = side === 'left' ? RULER_WIDTH - 1 : 1;
      // Numbers sit in the middle of the space beside the line.
      var textX = side === 'left' ? Math.round((RULER_WIDTH - 1) / 2) : Math.round(RULER_WIDTH / 2) + 1;
      var startAbs = Math.ceil(scrollTop / 10) * 10;   // snap to the nearest 10px
      var ticks = '';
      var labels = '';

      for (var absY = startAbs; absY <= scrollTop + viewportH + 10; absY += 10) {
        var y = absY - scrollTop;
        if (y < 0 || y > viewportH) continue;

        var isMajor = absY % 50 === 0;
        var isMedium = !isMajor && absY % 25 === 0;
        var tickLength = isMajor ? 9 : isMedium ? 5 : 3;
        var x1 = side === 'left' ? lineX - tickLength : lineX;
        var x2 = side === 'right' ? lineX + tickLength : lineX;

        ticks += '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y +
                 '" stroke="var(--faint)" stroke-width="1" shape-rendering="crispEdges"/>';

        if (isMajor) {
          // Rotated -90deg about the anchor so numbers read bottom-to-top.
          labels += '<text x="' + textX + '" y="' + y + '" font-size="8"' +
                    ' font-family="\'Geist Mono\', monospace" fill="var(--faint)"' +
                    ' text-anchor="middle" dominant-baseline="middle"' +
                    ' transform="rotate(-90 ' + textX + ' ' + y + ')">' + absY + '</text>';
        }
      }

      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + RULER_WIDTH + '"' +
             ' height="' + viewportH + '" shape-rendering="crispEdges">' +
             '<line x1="' + lineX + '" y1="0" x2="' + lineX + '" y2="' + viewportH +
             '" stroke="var(--border)" stroke-width="1"/>' + ticks + labels + '</svg>';
    }

    function render() {
      // CSS hides the rulers on narrow viewports, so skip the work — and drop
      // any markup left over from a wider window.
      if (window.innerWidth < RULER_MIN_VIEWPORT) {
        if (left.firstChild) left.textContent = '';
        if (right.firstChild) right.textContent = '';
        return;
      }
      left.innerHTML = build('left');
      right.innerHTML = build('right');
    }

    var schedule = rafThrottle(render);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    render();
  });

  /* ---------- read time ---------- */

  onReady(function () {
    var el = document.getElementById('read-time');
    if (!el) return;

    // Prefer the article body so nav/footer chrome isn't counted.
    var source = document.querySelector('.article-body') || document.body;
    var words = (source.textContent || '').trim().split(/\s+/).filter(Boolean).length;

    el.textContent = Math.max(1, Math.ceil(words / 200)) + ' min read';
  });

  /* ---------- smooth scroll (Lenis) ---------- */
  // Momentum scrolling on the window wrapper, so the progress bar, rulers and
  // glyph field keep working on native scroll events. Constructed only when
  // motion is allowed and the library is present: `scroller` stays null
  // otherwise and every dependent module falls back to native behaviour.

  onReady(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion && reduceMotion.matches) return;
    if (typeof window.Lenis !== 'function') return;   // library missing — native scroll
    try {
      scroller = new window.Lenis({
        autoRaf: true,              // the library drives its own rAF loop
        respectReducedMotion: true  // belt: the lib honours the media query itself
      });
    } catch (e) {
      scroller = null;              // never let a scroller failure break the page
    }
  });

  /* ---------- anchor scrolling ---------- */
  // Same-page hash links ride the momentum scroller when it is present,
  // stopping 72px early to clear the fixed nav (mirrors `scroll-margin-top`,
  // which covers the native fallback path). The skip link is excluded — it
  // must keep its native jump-and-focus behaviour.

  onReady(function () {
    if (!scroller || !scroller.scrollTo) return;

    each('a[href^="#"]', document, function (link) {
      if (link.classList.contains('skip-link')) return;
      var hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;

      link.addEventListener('click', function (event) {
        var target = document.getElementById(hash.slice(1));
        if (!target) return;
        event.preventDefault();
        scroller.scrollTo(target, { offset: -72, duration: 1.2 });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', hash);
        }
        // Keep keyboard/AT semantics: the link moved the reading position,
        // so move focus along with it (without re-scrolling).
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        if (target.focus) target.focus({ preventScroll: true });
      });
    });
  });

  /* ---------- lightbox ---------- */

  onReady(function () {
    var images = [];
    each('img.case-img, .img-row img', document, function (img) {
      // Work-card thumbnails are links, and the nav avatar is decorative.
      if (img.closest('a.work-card') || img.closest('.nav-logo') || img.classList.contains('nav-avatar')) return;
      if (!img.getAttribute('src')) return;
      images.push(img);
    });
    if (!images.length) return;   // don't inject a lightbox on pages that don't need one

    var overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image preview');
    // No src attribute: an empty src would trigger a request for the page itself.
    overlay.innerHTML = '<button type="button" class="lb-close" aria-label="Close image preview">\u2715</button><img alt="">';
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector('img');
    var lbClose = overlay.querySelector('.lb-close');
    var lastFocused = null;

    function open(src, alt) {
      lbImg.setAttribute('src', src);
      lbImg.setAttribute('alt', alt || '');
      overlay.classList.add('open');
      document.body.classList.add('lb-locked');
      if (scroller) scroller.stop();   // freeze momentum while the lightbox owns the screen
      lastFocused = document.activeElement;
      lbClose.focus();
    }

    function close() {
      if (!overlay.classList.contains('open')) return;
      overlay.classList.remove('open');
      document.body.classList.remove('lb-locked');
      if (scroller) scroller.start();
      lbImg.removeAttribute('src');
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      lastFocused = null;
    }

    images.forEach(function (img) {
      img.classList.add('img-zoomable');
      // Make the image operable from the keyboard, not just by mouse.
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge image: ' + (img.getAttribute('alt') || 'screenshot'));

      img.addEventListener('click', function () { open(img.src, img.alt); });
      img.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open(img.src, img.alt);
      });
    });

    // Click the backdrop (not the image) to close.
    overlay.addEventListener('click', function (event) {
      if (event.target !== lbImg) close();
    });
    lbClose.addEventListener('click', close);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
  });

  /* ---------- scroll reveals + metric count-up ---------- */
  // One scroll-driven pass, checked at most once per frame like the rulers
  // above. Because it re-runs on every scroll it is self-healing: an element
  // waits at most one frame past its entrance, never on a one-shot observer it
  // could miss. The hidden state is pure CSS keyed on html.motion-ok (set in
  // <head>, before first paint — so nothing flashes) and clears via
  // .is-visible, or via html.static-fallback if this module never completes.

  onReady(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion && reduceMotion.matches) return;

    var REVEALS = '.section-label, .work-card, .exp-card, .quote-card, .post-card, ' +
                  '.principle, .tl-item, .aside-card, .meta-strip, .img-row, .next-case';

    var revealItems = [];
    var countItems = [];

    each(REVEALS, document, function (el) {
      if (el.closest && el.closest('.hero-wrap')) return;   // hero entrance owns it
      // Stagger by position among revealed siblings in the same row.
      var index = 0;
      var node = el;
      while ((node = node.previousElementSibling)) {
        var isPeer = node.matches ? node.matches(REVEALS) : node.webkitMatchesSelector(REVEALS);
        if (isPeer) index++;
      }
      el.style.setProperty('--reveal-delay', (Math.min(index, 5) * 60) + 'ms');
      revealItems.push(el);
    });

    each('.metric-num', document, function (el) {
      var parts = /^(\d+)(.*)$/.exec((el.textContent || '').trim());
      if (!parts) return;
      countItems.push({ el: el, to: parseInt(parts[1], 10), suffix: parts[2], started: false });
    });

    function inView(el) {
      var rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    }

    function countUp(item) {
      var DURATION = 900;
      var start = null;
      function step(now) {
        if (start === null) start = now;
        var p = Math.min(1, (now - start) / DURATION);
        item.el.textContent = Math.round(item.to * (1 - Math.pow(1 - p, 3))) + item.suffix;
        if (p < 1) window.requestAnimationFrame(step);
        else item.el.textContent = item.to + item.suffix;   // exact original value
      }
      window.requestAnimationFrame(step);
    }

    // Hero metrics count once the entrance has settled, so the count is not
    // lost inside the rise. The number itself is never hidden: if the count
    // never runs, the markup's final value is simply what shows.
    function startCount(item) {
      if (item.started) return;
      item.started = true;
      var inHero = item.el.closest && item.el.closest('.hero-wrap');
      if (!inHero || document.documentElement.classList.contains('hero-in')) {
        countUp(item);
        return;
      }
      onHeroIn(function () { window.setTimeout(function () { countUp(item); }, 800); });
    }

    function check() {
      var kept = 0;
      var i;
      for (i = 0; i < revealItems.length; i++) {
        if (inView(revealItems[i])) revealItems[i].classList.add('is-visible');
        else revealItems[kept++] = revealItems[i];
      }
      revealItems.length = kept;
      kept = 0;
      for (i = 0; i < countItems.length; i++) {
        if (inView(countItems[i].el)) startCount(countItems[i]);
        else countItems[kept++] = countItems[i];
      }
      countItems.length = kept;
    }

    var schedule = rafThrottle(check);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    check();
    revealsReady = true;   // LAST: signals the <head> failsafe not to intervene
  });

  /* ---------- hero glyph field (ALTERNATIVE — off by default) ---------- */
  // To switch back to the falling 0/1 field, put
  // <canvas class="code-bg" aria-hidden="true"></canvas> in the hero.
  // This module finds no canvas and returns immediately
  // otherwise, so it costs one querySelector on the pages that don't use it.

  /* ---------- preloader: token boot sequence ---------- */
  // Types three design tokens behind a progress bar, then wipes the overlay.
  // Shown once per session; under reduced motion (or without storage) it never
  // appears and the page renders statically. Two fail-safes keep the overlay
  // from ever trapping the page: CSS can hide .done on its own, and the hard
  // timeout below force-completes the sequence no matter what.

  onReady(function () {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    function dismiss() {
      pre.classList.add('done');
    }

    // Seen this session, or motion is reduced → skip entirely, page is static.
    var seen = null;
    try { seen = window.sessionStorage.getItem('ab:preloader'); } catch (e) { /* private mode */ }
    if (seen || (reduceMotion && reduceMotion.matches)) {
      if (!(reduceMotion && reduceMotion.matches)) dismiss();
      else pre.classList.add('done');       // no reveal animation either — just remove the overlay
      return;
    }

    // Hard fallback: whatever happens, the overlay is gone within 5s.
    var failsafe = setTimeout(function () {
      dismiss();
      try { window.sessionStorage.setItem('ab:preloader', '1'); } catch (e) {}
    }, 5000);

    var LINES = [
      { k: '--accent', v: '#fc4f00' },
      { k: '--type', v: 'Inter Display' },
      { k: '--grid', v: '12col · 28px' }
    ];

    var lineEls = pre.querySelectorAll('.preloader-line');
    var kEls = pre.querySelectorAll('.pl-k');
    var vEls = pre.querySelectorAll('.pl-v');
    var caret = pre.querySelector('.pl-caret');
    var statusEl = document.getElementById('pl-status');
    var pctEl = document.getElementById('pl-pct');
    var fillEl = pre.querySelector('.preloader-fill');
    if (!lineEls.length || !kEls.length || !vEls.length || !fillEl) { dismiss(); return; }

    var total = 0;
    LINES.forEach(function (l) { total += l.k.length + l.v.length; });
    var doneChars = 0;

    function progress() {
      var p = doneChars / total;
      fillEl.style.width = (p * 100).toFixed(1) + '%';
      if (pctEl) pctEl.textContent = Math.round(p * 100) + '%';
    }

    var li = 0;
    function typeLine() {
      if (li >= LINES.length) { finish(); return; }
      var line = LINES[li];
      var phase = 'k', ci = 0;
      if (lineEls[li]) lineEls[li].classList.add('is-typing');   // reveals the colon too
      if (caret && lineEls[li]) lineEls[li].appendChild(caret);   // caret rides the active line
      (function step() {
        ci++;
        if (phase === 'k') kEls[li].textContent = line.k.slice(0, ci);
        else vEls[li].textContent = line.v.slice(0, ci);
        doneChars++;
        progress();
        var phaseLen = phase === 'k' ? line.k.length : line.v.length;
        if (ci >= phaseLen) {
          if (phase === 'k') { phase = 'v'; ci = 0; }
          else { li++; setTimeout(typeLine, 90); return; }
        }
        setTimeout(step, 22 + Math.random() * 26);
      })();
    }

    function finish() {
      if (statusEl) statusEl.textContent = 'design system ready';
      setTimeout(function () {
        clearTimeout(failsafe);
        if (caret) caret.style.display = 'none';
        dismiss();
        try { window.sessionStorage.setItem('ab:preloader', '1'); } catch (e) {}
      }, 380);
    }

    progress();
    setTimeout(typeLine, 250);
  });

  /* ---------- motion: hero entrance, scroll reveals, metric count-up ---------- */
  // Implements the contract documented in the MOTION block of styles.css: the
  // hidden states are classes added HERE at runtime (never in the markup), so a
  // JS failure degrades to a fully static page instead of an invisible one.
  //   .hero-anim + --d          one hero segment, staggered from the entrance
  //   .hero-in (on the hero)    fires the entrance — once the preloader wipes
  //   .reveal + --reveal-delay  one scroll target, staggered per visual row
  //   .is-visible               fires the reveal (IntersectionObserver, one-shot)
  // The whole module is skipped under prefers-reduced-motion.

  onReady(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion && reduceMotion.matches) return;

    var HERO_SEL = '.hero-wrap, .page-hero, .blog-hero, .case-hero, .article-header';
    var SEGMENT_SEL = '.badge, .back-link, .read-time, .case-tag, .article-kicker,' +
      ' .section-label, h1, .hero-sub, .case-subtitle, .article-lede,' +
      ' .hero-actions, .metrics .metric, .meta-strip, .portrait-frame';
    var REVEAL_SEL = '.section-label, .work-card, .exp-card, .quote-card, .post-card,' +
      ' .aside-card, .tl-item, .principle, .meta-strip, .challenge-grid,' +
      ' .deliverable, .img-row, .article-figure, .article-cta, .next-case';
    var SEG_STEP = 90;    // ms between hero segments
    var WORD_STEP = 55;   // ms between hero headline words
    var ROW_STEP = 90;    // ms between reveal rows

    var heroRoots = [];
    var started = false;

    function startHero() {
      if (started) return;
      started = true;
      heroRoots.forEach(function (root) { root.classList.add('hero-in'); });
      scheduleCounts();
    }

    try {
      tagHero();
      tagReveals();
    } catch (e) {
      // Fail visible: strip any hidden state this module already applied.
      each('.hero-anim, .reveal', document, function (el) {
        el.classList.remove('hero-anim');
        el.classList.remove('reveal');
      });
      return;
    }

    // Hard failsafe: whatever happens below, the hero can never stay hidden.
    setTimeout(startHero, 6500);

    // The entrance runs once the preloader wipes — immediately on pages with no
    // preloader, or when it already dismissed earlier this session (its own
    // module runs first, so `.done` is already set in that case).
    var pre = document.getElementById('preloader');
    if (!pre || pre.classList.contains('done')) {
      startHero();
    } else if (window.MutationObserver) {
      var obs = new window.MutationObserver(function () {
        if (!pre.classList.contains('done')) return;
        obs.disconnect();
        startHero();
      });
      obs.observe(pre, { attributes: true, attributeFilter: ['class'] });
    }
    // Without MutationObserver the 6.5s failsafe above starts the entrance just
    // after the preloader's own 5s failsafe — still never hidden forever.

    // Hero segments in document order. An h1 assembled from word spans (the
    // home headline) splits into per-word segments; any other headline is one
    // segment so mid-sentence emphasis (priWatt case title) never animates
    // apart from its line.
    function tagHero() {
      each(HERO_SEL, document, function (hero) {
        heroRoots.push(hero);
        var t = 0;
        each(SEGMENT_SEL, hero, function (seg) {
          var words = seg.tagName === 'H1'
            ? seg.querySelectorAll('strong > span, span > span')
            : [];
          if (words.length > 1) {
            Array.prototype.forEach.call(words, function (word) {
              tag(word, t);
              t += WORD_STEP;
            });
          } else {
            tag(seg, t);
            t += SEG_STEP;
          }
        });
      });
    }

    function tag(el, delay) {
      el.classList.add('hero-anim');
      el.style.setProperty('--d', delay + 'ms');
    }

    // Scroll targets outside the heroes (hero segments do their own entrance),
    // one level deep only: a reveal inside a reveal (an .img-row in a
    // .deliverable) rides its parent's animation instead of compounding.
    function tagReveals() {
      var groups = [];   // { parent, items } — siblings share a row clock

      each(REVEAL_SEL, document, function (el) {
        if (el.closest(HERO_SEL)) return;
        if (el.classList.contains('hero-anim')) return;
        if (el.parentElement && el.parentElement.closest(REVEAL_SEL)) return;

        el.classList.add('reveal');

        var group = null;
        for (var i = 0; i < groups.length; i++) {
          if (groups[i].parent === el.parentElement) { group = groups[i]; break; }
        }
        if (!group) {
          group = { parent: el.parentElement, items: [] };
          groups.push(group);
        }
        group.items.push(el);
      });

      // Stagger per visual row: siblings sharing a top edge reveal together,
      // the next row one step later. Measured once at DOM ready — late webfont
      // reflows can shift an item a row, which only costs it some delay.
      groups.forEach(function (group) {
        group.items.sort(function (a, b) {
          return (a.offsetTop - b.offsetTop) || (a.offsetLeft - b.offsetLeft);
        });
        var row = -1;
        var rowTop = null;
        group.items.forEach(function (el) {
          if (rowTop === null || Math.abs(el.offsetTop - rowTop) > 8) {
            row += 1;
            rowTop = el.offsetTop;
          }
          el.style.setProperty('--reveal-delay', (row * ROW_STEP) + 'ms');
        });
      });

      if (!window.IntersectionObserver) {
        each('.reveal', document, function (el) { el.classList.add('is-visible'); });
        return;
      }

      var io = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);   // one-shot: re-scrolls don't replay
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

      each('.reveal', document, function (el) { io.observe(el); });
    }
  });

  /* ---------- hero entrance (home) ---------- */
  // A quiet staggered rise: the badge, the headline one word at a time (the
  // words already live in their own spans), then the supporting blocks. The
  // per-element delays are --d custom properties; the hidden/animated states
  // live behind html.motion-ok / html.hero-in in styles.css (motion-ok is set
  // in <head>, before the hero can first paint — so it never flashes). The
  // entrance is sequenced behind the preloader's wipe, never underneath it.

  onReady(function () {
    var hero = document.querySelector('.hero-wrap');
    if (!hero) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var seq = [];   // [element, delay in ms]
    var badge = hero.querySelector('.badge');
    if (badge) seq.push([badge, 0]);

    var words = 0;
    each('h1 span', hero, function (span) {
      if (span.querySelector('span')) return;   // the muted line's wrapper
      seq.push([span, 110 + words * 55]);
      words++;
    });

    var blocks = ['.hero-sub', '.hero-actions', '.metrics'];
    var delay = 110 + words * 55 + 60;
    for (var b = 0; b < blocks.length; b++) {
      var el = hero.querySelector(blocks[b]);
      if (el) { seq.push([el, delay]); delay += 90; }
    }

    for (var s = 0; s < seq.length; s++) {
      seq[s][0].style.setProperty('--d', seq[s][1] + 'ms');
    }

    // The preloader's wipe is the cue; .done is also set instantly on repeat
    // views. If neither happens, the 5.2s heroIn failsafe (registered in
    // <head>) still releases the hero.
    var pre = document.getElementById('preloader');
    if (!pre || pre.classList.contains('done')) { heroIn(); return; }
    if (window.MutationObserver) {
      new window.MutationObserver(function () {
        if (pre.classList.contains('done')) heroIn();
      }).observe(pre, { attributes: true, attributeFilter: ['class'] });
    }
  });

  // A slow monospace "telemetry" field behind the hero copy — decorative only.
  //
  // Two things worth knowing about this loop:
  //   1. The `prefers-reduced-motion` block at the end of styles.css can only
  //      cancel CSS animation. A requestAnimationFrame loop ignores it, so the
  //      media query is honoured here: under reduced motion we paint exactly one
  //      static frame and never start the loop.
  //   2. It stops drawing whenever the hero leaves the viewport or the tab is
  //      hidden, so an idle page costs nothing.

  onReady(function () {
    if (!document.querySelector('.code-bg')) return;
    if (!window.requestAnimationFrame) return;          // no rAF — leave the colour field

    var CELL_W = 13;          // one Geist Mono advance at 12px, plus air between streams
    var CELL_H = 17;
    var FONT = '12px "Geist Mono", ui-monospace, monospace';
    var MAX_FPS = 30;         // a drift this slow gains nothing from 60
    var POINTER_R = 150;      // highlight radius, px
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var layers = [];

    // Deterministic per-cell glyph, so the grid is never stored and the same time
    // bucket always yields the same frame.
    function glyphFor(col, row, bucket) {
      var n = (col * 73856093) ^ (row * 19349663) ^ (bucket * 83492791);
      return (n & 1) ? '1' : '0';
    }

    // Read the live tokens so the field follows the theme without a hard-coded palette.
    function palette() {
      var styles = window.getComputedStyle(document.documentElement);
      return {
        trail: styles.getPropertyValue('--text').trim() || '#dddddd',
        head: styles.getPropertyValue('--orange').trim() || '#fc4f00'
      };
    }

    // A column of falling glyphs: a head row, a trail length, and a slow speed.
    function newStream(rows, scatter) {
      var len = 6 + Math.floor(Math.random() * 12);
      return {
        head: scatter ? Math.random() * (rows + len) - len : -Math.random() * 6,
        len: len,
        speed: 1.6 + Math.random() * 3.4,
        // A minority of columns carry the orange "signal"; the rest stay neutral.
        signal: Math.random() < 0.24
      };
    }

    // Sizes the backing store and returns fresh geometry + streams.
    // Deliberately side-effect free apart from the canvas dimensions: it must NOT
    // touch the live layer's loop bookkeeping or the canvas.__glyphLayer pointer,
    // or the rAF loop and its IntersectionObserver end up bound to a dead object.
    function build(canvas) {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      // Cap the device pixel ratio: 3x triples the fill area for no visible gain.
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      var ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) return null;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      ctx.textBaseline = 'top';

      var rows = Math.ceil(h / CELL_H) + 1;
      var cols = Math.ceil(w / CELL_W);
      var streams = [];
      for (var c = 0; c < cols; c++) streams.push(newStream(rows, true));

      return { ctx: ctx, w: w, h: h, rows: rows, streams: streams };
    }

    function paint(layer, dt) {
      var ctx = layer.ctx;
      var pal = layer.pal;
      var px = layer.pointer;
      var bucket = Math.floor(layer.t / 0.26);          // glyphs mutate ~4x/sec

      ctx.clearRect(0, 0, layer.w, layer.h);

      for (var c = 0; c < layer.streams.length; c++) {
        var s = layer.streams[c];
        s.head += s.speed * dt;

        if (s.head - s.len > layer.rows) {              // fully past the bottom — recycle
          var fresh = newStream(layer.rows, false);
          s.head = fresh.head; s.len = fresh.len; s.speed = fresh.speed; s.signal = fresh.signal;
        }

        var x = c * CELL_W;

        for (var d = 0; d < s.len; d++) {
          var row = Math.floor(s.head - d);
          if (row < 0 || row >= layer.rows) continue;

          // Quadratic falloff gives a soft tail instead of a hard-edged block.
          var fade = 1 - d / s.len;
          var alpha = fade * fade * 0.4;
          if (alpha < 0.012) continue;

          if (px.active) {
            var dx = x - px.x, dy = (row * CELL_H) - px.y;
            var dist2 = dx * dx + dy * dy;
            if (dist2 < POINTER_R * POINTER_R) {
              alpha += (1 - dist2 / (POINTER_R * POINTER_R)) * 0.24;
            }
          }

          ctx.globalAlpha = Math.min(alpha, 0.7);
          ctx.fillStyle = (d === 0 && s.signal) ? pal.head : pal.trail;
          ctx.fillText(glyphFor(s.signal ? c : c + 7, row, bucket), x, row * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
    }

    function stop(layer) {
      if (layer.raf === null) return;
      window.cancelAnimationFrame(layer.raf);
      layer.raf = null;
    }

    function start(layer) {
      if (layer.raf !== null) return;
      var minDelta = 1 / MAX_FPS;

      function frame(now) {
        layer.raf = window.requestAnimationFrame(frame);
        var t = now / 1000;
        // Clamp dt so returning to a backgrounded tab doesn't teleport the streams.
        var dt = layer.last ? Math.min(t - layer.last, 0.1) : minDelta;
        if (dt < minDelta) return;                      // frame-rate cap
        layer.last = t;
        layer.t += dt;
        paint(layer, dt);
      }

      layer.raf = window.requestAnimationFrame(frame);
    }

    // Single gate for every reason to run or not: on-screen, tab visible, motion allowed.
    function sync(layer) {
      if (reduceMotion.matches) {
        layer.t = 3.2;                                  // one fixed, pleasant frame
        paint(layer, 0);
        stop(layer);
        return;
      }
      if (layer.visible && !document.hidden) start(layer); else stop(layer);
    }

    function syncAll() {
      layers.forEach(sync);
    }

    // --- one layer per hero on the page ---
    each('.code-bg', document, function (canvas) {
      var geo = build(canvas);
      if (!geo) return;
      var layer = {
        canvas: canvas, ctx: geo.ctx, w: geo.w, h: geo.h, rows: geo.rows,
        streams: geo.streams, t: 0, raf: null, last: 0, visible: true,
        pal: palette(), pointer: { x: 0, y: 0, active: false }
      };
      canvas.__glyphLayer = layer;   // set once, never reassigned
      layers.push(layer);
    });
    if (!layers.length) return;

    // Pointer highlight, measured against each canvas box.
    window.addEventListener('pointermove', function (event) {
      layers.forEach(function (layer) {
        var rect = layer.canvas.getBoundingClientRect();
        var inside = event.clientX >= rect.left && event.clientX <= rect.right &&
                     event.clientY >= rect.top && event.clientY <= rect.bottom;
        layer.pointer.active = inside;
        if (inside) {
          layer.pointer.x = event.clientX - rect.left;
          layer.pointer.y = event.clientY - rect.top;
        }
      });
    }, { passive: true });

    document.addEventListener('visibilitychange', syncAll);   // stop while the tab is hidden

    // React if the OS setting changes mid-session.
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function () {
        layers.forEach(function (layer) { layer.pal = palette(); layer.last = 0; });
        syncAll();
      });
    }

    // Re-read the tokens when the theme flips.
    if (window.MutationObserver) {
      new window.MutationObserver(function () {
        layers.forEach(function (layer) { layer.pal = palette(); });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // Keep the backing store in step with the box. A ResizeObserver covers the
    // cases a window 'resize' listener misses: webfonts swapping in and re-wrapping
    // the hero copy, and the portrait image settling. Rebuilding only sets the
    // canvas attributes — its on-screen size is CSS-driven, so there's no feedback loop.
    function rebuild(layer) {
      var geo = build(layer.canvas);
      if (!geo) return;
      // Copy the geometry IN PLACE. Assigning the whole object would clobber
      // raf/visible/t/pointer, orphaning the running loop and letting the
      // IntersectionObserver drive a discarded object — which spawns a second
      // loop on the same canvas.
      layer.ctx = geo.ctx;
      layer.w = geo.w;
      layer.h = geo.h;
      layer.rows = geo.rows;
      layer.streams = geo.streams;
      layer.last = 0;                 // dt must not span the resize
      sync(layer);                    // start() is a no-op while the loop is live
    }

    var onBoxChange = rafThrottle(function () { layers.forEach(rebuild); });

    if (window.ResizeObserver) {
      var ro = new window.ResizeObserver(onBoxChange);
      layers.forEach(function (layer) { ro.observe(layer.canvas); });
    } else {
      window.addEventListener('resize', onBoxChange, { passive: true });
    }

    // Stop drawing while the hero is off-screen — the single biggest battery save.
    if (window.IntersectionObserver) {
      var io = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var layer = entry.target.__glyphLayer;
          if (!layer) return;
          layer.visible = entry.isIntersecting;
          sync(layer);
        });
      }, { rootMargin: '120px' });
      layers.forEach(function (layer) { io.observe(layer.canvas); });
    }

    syncAll();
  });

})();
