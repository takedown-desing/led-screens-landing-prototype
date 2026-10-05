/* Вариант 2 «Контраст»: интерактив без зависимостей.
   Обработчики кликов делегированы на document; init(c) вызывается из render.js после каждой отрисовки. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var HAS_IO = 'IntersectionObserver' in window;
  if (HAS_IO) html.classList.add('rv-on');

  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function fmt(n) { return Math.round(n).toLocaleString('ru-RU'); }
  function num(el) { return el ? parseFloat(String(el.value).replace(',', '.')) || 0 : 0; }
  function play(v) { if (!v) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  var lastFocus = null, observers = [], carousel = null;
  var TICK = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 5 5L19.5 7"/></svg>';

  /* ---------- оверлеи: меню, модалка, лайтбокс ---------- */
  function anyOpen() { return !!qs('.modal.open, .lb.open, .drawer.open'); }
  function lock() { html.classList.toggle('locked', anyOpen()); }

  function openDrawer() { var dr = qs('[data-drawer]'); if (!dr) return; dr.classList.add('open'); dr.setAttribute('aria-hidden', 'false'); lock(); }
  function closeDrawer() { var dr = qs('[data-drawer]'); if (dr) { dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); } lock(); }

  function openModal(b) {
    var m = qs('[data-modal]'); if (!m) return;
    closeDrawer(); closeLightbox(true);
    var h3 = qs('h3', m), sub = qs('.modal-sub', m);
    h3.textContent = b.getAttribute('data-ask-title') || h3.getAttribute('data-def');
    sub.textContent = b.getAttribute('data-ask-sub') || sub.getAttribute('data-def');
    sub.hidden = !sub.textContent;
    var prod = b.getAttribute('data-ask-product'), pl = qs('.modal-prod', m);
    pl.hidden = !prod; if (prod) qs('b', pl).textContent = prod;
    var type = b.getAttribute('data-ask-type'), sel = qs('select[name="type"]', m);
    if (sel && type && qs('option[value="' + type + '"]', sel)) sel.value = type;
    var w = b.getAttribute('data-ask-w'), h = b.getAttribute('data-ask-h');
    if (w) qs('[name="w"]', m).value = w;
    if (h) qs('[name="h"]', m).value = h;
    qs('form', m).hidden = false; qs('.modal-done', m).hidden = true;
    lastFocus = b;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); lock();
    setTimeout(function () { var i = qs('input[name="phone"]', m); if (i) try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); } }, 80);
  }
  function closeModal() {
    var m = qs('[data-modal].open'); if (!m) return;
    m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); lock();
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  function openLightbox(tile) {
    var lb = qs('[data-lb]'); if (!lb || !tile) return;
    var v = qs('video', tile), lv = qs('video', lb);
    var src = v && (v.getAttribute('data-src') || v.currentSrc);
    if (!src) return;
    qs('[data-lb-type]', lb).textContent = (qs('.cz-type', tile) || {}).textContent || '';
    qs('[data-lb-title]', lb).textContent = (qs('h3', tile) || {}).textContent || '';
    qs('[data-lb-desc]', lb).textContent = (qs('.cz-desc', tile) || {}).textContent || '';
    var ask = qs('[data-lb-ask]', lb); if (ask) ask.setAttribute('data-ask-product', (qs('h3', tile) || {}).textContent || '');
    lv.setAttribute('poster', v.getAttribute('poster') || '');
    lv.src = src; lv.muted = false;
    lastFocus = tile;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lock();
    play(lv);
    if (carousel) carousel.sync();
    setTimeout(function () { var x = qs('.lb-x', lb); if (x) x.focus({ preventScroll: true }); }, 60);
  }
  function closeLightbox(silent) {
    var lb = qs('[data-lb].open'); if (!lb) return;
    var lv = qs('video', lb); lv.pause(); lv.removeAttribute('src'); lv.load();
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lock();
    if (carousel) carousel.sync();
    if (!silent && lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function closeAll() { closeModal(); closeLightbox(); closeDrawer(); }

  /* ---------- делегированные события ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target, el;
    if (!t.closest) return;
    if (t.closest('[data-menu-open]')) { openDrawer(); return; }
    if (t.closest('[data-menu-close]') || t.classList.contains('drawer')) { closeDrawer(); return; }
    if (t.closest('.drawer a[href^="#"]')) { closeDrawer(); }
    if ((el = t.closest('[data-ask]'))) { e.preventDefault(); openModal(el); return; }
    if (t.closest('[data-close]') || t.classList.contains('modal') || t.classList.contains('lb')) { closeModal(); closeLightbox(); return; }
    if ((el = t.closest('[data-cz-filter]'))) { if (carousel) carousel.filter(el.getAttribute('data-cz-filter')); return; }
    if ((el = t.closest('[data-case-filter]'))) { if (carousel) carousel.filter(el.getAttribute('data-case-filter')); }
    if (t.closest('[data-cz-prev]')) { if (carousel) carousel.step(-1); return; }
    if (t.closest('[data-cz-next]')) { if (carousel) carousel.step(1); return; }
    if ((el = t.closest('[data-cz-seg]'))) { if (carousel) carousel.go(Number(el.getAttribute('data-cz-seg'))); return; }
    if ((el = t.closest('.cz-track .cz-tile'))) { openLightbox(el); return; }
    if ((el = t.closest('[data-rv-prev], [data-rv-next]'))) { slideReviews(el.hasAttribute('data-rv-next') ? 1 : -1); return; }
    if ((el = t.closest('[data-step]'))) { stepInput(el); return; }
    if ((el = t.closest('[data-pick-type]'))) { pickType(el.getAttribute('data-pick-type')); return; }
    if (t.closest('[data-vpill-toggle]')) { var vp = qs('[data-vpill]'); if (vp) vp.classList.toggle('open'); return; }
  });

  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('cz-tile')) { e.preventDefault(); openLightbox(e.target); }
  });

  /* Формы не отправляются: показываем settings.formDone */
  d.addEventListener('submit', function (e) {
    var f = e.target; e.preventDefault();
    if (f.hasAttribute('data-calc')) return;
    if (f.checkValidity && !f.checkValidity()) { if (f.reportValidity) f.reportValidity(); return; }
    var msg = f.getAttribute('data-done') || 'Заявка принята';
    if (f.classList.contains('modal-form')) {
      f.hidden = true; qs('.modal-done', f.parentNode).hidden = false; return;
    }
    var done = d.createElement('div');
    done.className = 'form-done';
    done.innerHTML = '<span class="done-ico">' + TICK + '</span><b></b>';
    qs('b', done).textContent = msg;
    f.innerHTML = ''; f.appendChild(done);
  });

  d.addEventListener('input', function (e) {
    var i = e.target;
    if (i.type === 'tel') {
      var v = i.value.replace(/[^\d+]/g, '');
      if (v && v[0] !== '+') v = '+' + v;
      i.value = v.slice(0, 13);
    }
    if (i.closest && i.closest('[data-calc]')) updCalc();
  });
  d.addEventListener('change', function (e) {
    var i = e.target;
    if (i.closest && i.closest('[data-calc]')) updCalc();
    if (i.type === 'file') {
      var lab = i.closest('.upload'), sp = lab && qs('[data-file-label]', lab);
      if (sp && i.files && i.files[0]) sp.textContent = i.files[0].name;
    }
  });

  /* ---------- калькулятор ---------- */
  var shown = 0, tween = 0;
  function animatePrice(el, to, prefix) {
    cancelAnimationFrame(tween);
    var from = shown, t0 = 0, dur = RM.matches ? 0 : 450;
    function frame(ts) {
      if (!t0) t0 = ts;
      var k = dur ? Math.min(1, (ts - t0) / dur) : 1;
      var e = 1 - Math.pow(1 - k, 3);
      var v = from + (to - from) * e;
      el.textContent = prefix + fmt(Math.round(v / 1000) * 1000) + ' ₽';
      if (k < 1) tween = requestAnimationFrame(frame); else shown = to;
    }
    tween = requestAnimationFrame(frame);
  }
  function updCalc() {
    var f = qs('[data-calc]'); if (!f) return;
    var sec = f.closest('section') || d;
    var W = num(f.elements.w), H = num(f.elements.h);
    var r = qs('input[name="calctype"]:checked', f);
    var rate = r ? Number(r.getAttribute('data-rate')) : 0;
    var share = Number(f.getAttribute('data-mount-share')) || 0;
    var withMount = f.elements.mount && f.elements.mount.checked;
    var area = Math.round(W * H * 100) / 100, base = area * rate, mc = withMount ? Math.round(base * share / 100) : 0;
    function out(k, v) { var el = qs('[data-out="' + k + '"]', sec); if (el) el.textContent = v; }
    var name = r ? r.getAttribute('data-name') : '';
    out('area', area ? area.toLocaleString('ru-RU') + ' м²' : '—');
    out('type', name || '—');
    out('px', (r && r.getAttribute('data-px')) || '—');
    out('mount', withMount ? 'включены, ~' + share + '% от экрана' : 'не включены');
    var pe = qs('[data-out="price"]', sec);
    if (pe) {
      if (area && rate) animatePrice(pe, base + mc, 'от ');
      else { pe.textContent = rate ? 'укажите размеры' : '—'; shown = 0; }
    }
    qsa('[data-pick-type]', sec).forEach(function (b) { b.classList.toggle('on', r && b.getAttribute('data-pick-type') === r.value); });
    var btn = qs('[data-calc-ask]', sec);
    if (btn) {
      btn.setAttribute('data-ask-product', (name || 'Экран') + ', ' + (W || '?') + '×' + (H || '?') + ' м, ' + (area || '?') + ' м²');
      if (r) btn.setAttribute('data-ask-type', r.value);
      btn.setAttribute('data-ask-w', W || ''); btn.setAttribute('data-ask-h', H || '');
    }
  }
  function stepInput(b) {
    var p = b.getAttribute('data-step').split(':'), f = b.closest('form'), i = f && f.elements[p[0]];
    if (!i) return;
    var v = Math.max(0.5, Math.round((num(i) + Number(p[1])) * 10) / 10);
    i.value = v; updCalc();
  }
  function pickType(id) {
    var f = qs('[data-calc]'); if (!f) return;
    var r = qs('input[name="calctype"][value="' + id + '"]', f); if (!r) return;
    r.checked = true; updCalc();
    var rect = f.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight * 0.6) f.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- карусель объектов ---------- */
  function Carousel(root) {
    var sec = root.closest('section');
    var track = qs('[data-cz-track]', sec), store = qs('[data-cz-store]', sec);
    var prog = qs('[data-cz-prog]', sec), count = qs('[data-cz-count]', sec);
    var bar = qs('.cz-bar', sec);
    var tiles = qsa('.cz-tile', store);
    var mqDesk = window.matchMedia('(min-width: 1024px)');
    var DUR = 6000;
    var cur = 'all', positions = [0], idx = 0, elapsed = 0, last = 0;
    var hover = false, focus = false, inView = false, raf = 0, scrollT = 0, vio = null;

    function build() {
      tiles.forEach(function (t) { var v = qs('video', t); if (v && !v.paused) v.pause(); t._vis = false; });
      var list = tiles.filter(function (t) { return cur === 'all' || (' ' + t.getAttribute('data-f') + ' ').indexOf(' ' + cur + ' ') > -1; });
      var cols = [];
      if (mqDesk.matches) {
        if (list.length === 1) cols.push(['full', [list[0]]]);
        else {
          var i = 0, big = true;
          while (i < list.length) {
            if (big) { cols.push(['big', [list[i]]]); i++; }
            else { var g = list.slice(i, i + 2); cols.push([g.length === 2 ? 'small' : 'small single', g]); i += g.length; }
            big = !big;
          }
        }
      } else list.forEach(function (t) { cols.push(['one', [t]]); });
      track.innerHTML = '';
      cols.forEach(function (cd) {
        var col = d.createElement('div');
        col.className = 'cz-col ' + cd[0];
        cd[1].forEach(function (t) { t.classList.toggle('is-big', /big|full/.test(cd[0])); col.appendChild(t); });
        track.appendChild(col);
      });
      track.scrollLeft = 0; idx = 0; elapsed = 0;
      if (vio) { vio.disconnect(); list.forEach(function (t) { vio.observe(t); }); }
      requestAnimationFrame(function () { measure(); drawProg(); sync(); });
    }
    function measure() {
      var max = track.scrollWidth - track.clientWidth;
      positions = [];
      qsa('.cz-col', track).forEach(function (col) {
        var p = Math.max(0, Math.min(col.offsetLeft, max));
        if (positions.every(function (x) { return Math.abs(x - p) > 2; })) positions.push(p);
      });
      if (max <= 2 || !positions.length) positions = [0];
      if (idx >= positions.length) idx = positions.length - 1;
      sec.classList.toggle('cz-static', positions.length < 2);
    }
    function drawProg() {
      if (!prog) return;
      prog.innerHTML = positions.map(function (p, i) {
        return '<button type="button" class="cz-seg' + (i < idx ? ' done' : '') + '" data-cz-seg="' + i + '" aria-label="Слайд ' + (i + 1) + '"><i></i></button>';
      }).join('');
      if (count) count.textContent = (idx + 1 < 10 ? '0' : '') + (idx + 1) + ' / ' + (positions.length < 10 ? '0' : '') + positions.length;
    }
    function go(i) {
      var n = positions.length; if (!n) return;
      idx = ((i % n) + n) % n; elapsed = 0;
      track.scrollTo({ left: positions[idx], behavior: RM.matches ? 'auto' : 'smooth' });
      drawProg();
    }
    function nearest() {
      var x = track.scrollLeft, best = 0;
      positions.forEach(function (p, i) { if (Math.abs(p - x) < Math.abs(positions[best] - x)) best = i; });
      return best;
    }
    function running() {
      return !RM.matches && inView && !hover && !focus && !d.hidden && !anyOpen() && positions.length > 1;
    }
    function tick(ts) {
      var dt = last ? Math.min(ts - last, 100) : 0; last = ts;
      if (running()) { elapsed += dt; if (elapsed >= DUR) go(idx + 1); }
      var seg = prog && prog.children[idx];
      if (seg && seg.firstChild) seg.firstChild.style.backgroundSize = (RM.matches ? 100 : Math.min(100, elapsed / DUR * 100)) + '% 100%';
      raf = requestAnimationFrame(tick);
    }
    function sync() {
      var lbOpen = !!qs('.lb.open');
      tiles.forEach(function (t) {
        var v = qs('video', t); if (!v) return;
        var should = inView && t._vis && t.isConnected && !lbOpen;
        if (should) {
          if (!v.getAttribute('src') && v.getAttribute('data-src')) { v.preload = 'auto'; v.src = v.getAttribute('data-src'); }
          if (v.paused) play(v);
        } else if (!v.paused) v.pause();
      });
    }

    if (HAS_IO) {
      vio = new IntersectionObserver(function (es) {
        es.forEach(function (en) { en.target._vis = en.isIntersecting && en.intersectionRatio >= 0.5; });
        sync();
      }, { root: track, threshold: [0, 0.5, 1] });
      var sio = new IntersectionObserver(function (es) { inView = es[0].isIntersecting; sync(); }, { threshold: 0.12 });
      sio.observe(root); observers.push(vio, sio);
    } else { inView = true; tiles.forEach(function (t) { t._vis = true; }); }

    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; });
    sec.addEventListener('focusin', function (e) { if (e.target.closest('.cz, .cz-bar')) focus = true; });
    sec.addEventListener('focusout', function () { focus = false; });
    track.addEventListener('scroll', function () {
      clearTimeout(scrollT);
      scrollT = setTimeout(function () { var n = nearest(); if (n !== idx) { idx = n; elapsed = 0; drawProg(); } }, 120);
    }, { passive: true });
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { measure(); drawProg(); track.scrollLeft = positions[idx] || 0; }, 150);
    });
    if (mqDesk.addEventListener) mqDesk.addEventListener('change', build); else if (mqDesk.addListener) mqDesk.addListener(build);
    d.addEventListener('visibilitychange', sync);
    d.addEventListener('loadedmetadata', function (e) {
      var v = e.target; if (v.tagName !== 'VIDEO') return;
      var tile = v.closest && v.closest('.cz-tile');
      if (tile && v.videoHeight > v.videoWidth) tile.classList.add('portrait');
    }, true);

    build();
    raf = requestAnimationFrame(tick);

    return {
      sync: sync,
      go: go,
      step: function (dir) { go(idx + dir); },
      filter: function (id) {
        var pill = qs('[data-cz-filter="' + id + '"]', sec) ? id : 'all';
        cur = pill;
        qsa('[data-cz-filter]', sec).forEach(function (p) { var on = p.getAttribute('data-cz-filter') === cur; p.classList.toggle('on', on); p.setAttribute('aria-selected', on); });
        build();
      }
    };
  }

  /* ---------- отзывы ---------- */
  function slideReviews(dir) {
    var tr = qs('[data-rv-track]'); if (!tr) return;
    var card = tr.firstElementChild; if (!card) return;
    var stepW = card.getBoundingClientRect().width + 20;
    var max = tr.scrollWidth - tr.clientWidth;
    var target = tr.scrollLeft + dir * stepW;
    if (target > max + 4) target = 0; else if (target < -4) target = max;
    tr.scrollTo({ left: target, behavior: RM.matches ? 'auto' : 'smooth' });
  }
  function revArrows() {
    var tr = qs('[data-rv-track]'); if (!tr) return;
    var sec = tr.closest('section');
    sec.classList.toggle('rv-static', tr.scrollWidth - tr.clientWidth < 4);
  }

  /* ---------- появление при прокрутке, меню, шапка ---------- */
  function reveal() {
    var els = qsa('.rv');
    if (!HAS_IO || RM.matches) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) {
      var sibs = e.parentNode ? Array.prototype.indexOf.call(e.parentNode.children, e) : 0;
      if (e.parentNode && e.parentNode.children.length > 2) e.style.transitionDelay = Math.min(sibs % 4, 3) * 80 + 'ms';
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
    observers.push(io);
  }
  function navSpy() {
    var links = qsa('.hdr-nav a[href^="#"]');
    if (!links.length || !HAS_IO) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    qsa('main section[id]').forEach(function (s) { io.observe(s); });
    observers.push(io);
  }
  function heroVideo() {
    var v = qs('.hero-video');
    if (!v || v.tagName !== 'VIDEO') return;
    v.muted = true; play(v);
    if (!HAS_IO) return;
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(v); else v.pause(); }, { threshold: 0.05 });
    io.observe(v); observers.push(io);
  }
  function onScroll() {
    var y = window.scrollY;
    html.classList.toggle('scrolled', y > 10);
    var bar = qs('[data-mbar]');
    if (bar) {
      var hero = qs('.hero'), cta = qs('#cta'), lim = hero ? hero.offsetHeight * 0.7 : 500;
      var hide = false;
      if (cta) { var r = cta.getBoundingClientRect(); hide = r.top < window.innerHeight && r.bottom > 0; }
      bar.classList.toggle('show', y > lim && !hide);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function init() {
    observers.forEach(function (o) { o.disconnect(); }); observers = [];
    reveal(); navSpy(); heroVideo(); onScroll();
    var cz = qs('[data-cz]');
    carousel = cz ? Carousel(cz) : null;
    updCalc();
    revArrows();
    window.addEventListener('resize', revArrows);
  }

  window.V2App = { init: init };
})();
