/* Вариант 4 · Сцена: интерактив без зависимостей. Модалка, меню, карусель объектов, лайтбокс, калькулятор,
   FAQ и автовидео перенесены из варианта 3. Новое: цифры-барабаны, выбор типа экрана, сцена первого экрана.
   Клики делегированы на document; init() вызывается из render.js после сборки страницы. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function fmt(n) { return Math.round(n).toLocaleString('ru-RU'); }
  function num(v) { return parseFloat(String(v == null ? '' : v).replace(',', '.')) || 0; }
  function play(v) { if (!v) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  /* ---------- Блокировка прокрутки под оверлеями ---------- */
  var lastFocus = null;
  function lock(on) { html.classList.toggle('is-locked', !!on); }
  function anyOpen() { return qsa('.is-open[data-modal], .is-open[data-sheet], .is-open[data-lb]').length > 0; }

  /* ---------- Мобильное меню ---------- */
  function sheet() { return qs('[data-sheet]'); }
  function openMenu() { var s = sheet(); if (!s) return; lastFocus = d.activeElement; s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false'); lock(true); var x = qs('.sheet__x', s); if (x) setTimeout(function () { x.focus(); }, 60); }
  function closeMenu() { var s = sheet(); if (!s || !s.classList.contains('is-open')) return; s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true'); if (!anyOpen()) lock(false); }

  /* ---------- Модальная форма заявки ---------- */
  function modal() { return qs('[data-modal]'); }
  function openModal(b) {
    var m = modal(); if (!m) return;
    var f = qs('form', m);
    var title = b && b.getAttribute('data-ask-title'), sub = b && b.getAttribute('data-ask-sub');
    var product = b && b.getAttribute('data-ask-product'), type = b && b.getAttribute('data-ask-type');
    qs('[data-m-title]', m).textContent = title || f.getAttribute('data-default-title');
    qs('[data-m-sub]', m).textContent = sub || f.getAttribute('data-default-sub');
    var pl = qs('[data-m-prod]', m);
    pl.hidden = !product; if (product) qs('b', pl).textContent = product;
    var sel = qs('select[name="type"]', m);
    if (sel && type && qs('option[value="' + type + '"]', sel)) sel.value = type;
    var w = b && b.getAttribute('data-ask-w'), h = b && b.getAttribute('data-ask-h');
    if (w) qs('[name="w"]', m).value = w;
    if (h) qs('[name="h"]', m).value = h;
    var btn = qs('button[type="submit"]', f);
    if (btn && btn.disabled) { btn.disabled = false; btn.classList.remove('is-done'); btn.innerHTML = btn.getAttribute('data-orig') || btn.innerHTML; }
    lastFocus = d.activeElement;
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lock(true);
    var first = qs('[name="phone"]', m);
    if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }, 120);
  }
  function closeModal() {
    var m = modal(); if (!m || !m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    if (!anyOpen()) lock(false);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- Лайтбокс видео объекта ---------- */
  function lb() { return qs('[data-lb]'); }
  function openLb(tile) {
    var l = lb(); if (!l || !tile) return;
    var v = qs('[data-lb-video]', l);
    v.poster = tile.getAttribute('data-poster') || '';
    v.src = tile.getAttribute('data-video') || '';
    v.muted = false;
    qs('[data-lb-type]', l).textContent = tile.getAttribute('data-kind') || '';
    qs('[data-lb-title]', l).textContent = tile.getAttribute('data-title') || '';
    qs('[data-lb-desc]', l).textContent = tile.getAttribute('data-desc') || '';
    var a = qs('[data-lb-ask]', l); if (a) a.setAttribute('data-ask-product', tile.getAttribute('data-title') || '');
    lastFocus = d.activeElement;
    l.classList.add('is-open'); l.setAttribute('aria-hidden', 'false'); lock(true);
    l.classList.toggle('is-portrait', tile.classList.contains('is-portrait'));
    play(v);
    if (car) car.hold(true);
  }
  function closeLb() {
    var l = lb(); if (!l || !l.classList.contains('is-open')) return;
    var v = qs('[data-lb-video]', l); v.pause(); v.removeAttribute('src'); v.load();
    l.classList.remove('is-open'); l.setAttribute('aria-hidden', 'true');
    if (!anyOpen()) lock(false);
    if (car) car.hold(false);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- Карусель объектов: одна большая плитка и две маленькие ---------- */
  var car = null;
  function Carousel(root) {
    var section = root.closest('section') || root;
    var track = qs('[data-car-track]', root);
    var dotsBox = qs('[data-car-dots]', section);
    var prev = qs('[data-car-prev]', section), next = qs('[data-car-next]', section);
    var tiles = qsa('.tile', track);
    var filter = 'all', stops = [], idx = 0, elapsed = 0, last = 0, raf = 0;
    var hover = false, held = false, inView = false, DUR = 6000;
    var ratios = new Map();
    var mq = matchMedia('(max-width: 767px)');

    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { ratios.set(e.target, e.intersectionRatio); });
      syncVideos();
    }, { root: track, threshold: [0, 0.35, 0.6, 0.9] });

    var sio = new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      syncVideos(); loop();
    }, { threshold: 0.15 });
    sio.observe(root);

    function syncVideos() {
      tiles.forEach(function (t) {
        var v = qs('video', t); if (!v) return;
        var on = inView && t.isConnected && (ratios.get(t) || 0) >= 0.55 && !held;
        if (on) { if (v.paused) play(v); } else if (!v.paused) v.pause();
      });
    }

    function build() {
      tiles.forEach(function (t) { if (t.parentNode) t.parentNode.removeChild(t); tio.unobserve(t); });
      track.innerHTML = '';
      var list = tiles.filter(function (t) { return filter === 'all' || (' ' + t.getAttribute('data-type') + ' ').indexOf(' ' + filter + ' ') > -1; });
      var i = 0, cols = 0;
      while (i < list.length) {
        var big = d.createElement('div'); big.className = 'car__col car__col--big';
        big.appendChild(list[i++]); track.appendChild(big); cols++;
        if (i < list.length) {
          var sm = d.createElement('div'); sm.className = 'car__col car__col--small';
          sm.appendChild(list[i++]); if (i < list.length) sm.appendChild(list[i++]);
          track.appendChild(sm); cols++;
        }
      }
      root.setAttribute('data-cols', String(cols));
      list.forEach(function (t) { tio.observe(t); });
      track.scrollLeft = 0; idx = 0; elapsed = 0;
      measure();
    }

    function measure() {
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var items;
      if (mq.matches) items = qsa('.tile', track);
      else { items = qsa('.car__col', track); items = items.slice(0, Math.max(1, items.length - 1)); }
      stops = items.map(function (el) { return Math.max(0, el.offsetLeft - pad); });
      var max = track.scrollWidth - track.clientWidth;
      stops = stops.filter(function (s, k) { return k === 0 || s <= max + 2; });
      if (stops.length > 1 && max - stops[stops.length - 1] > 8 && mq.matches) stops.push(max);
      dots();
      section.classList.toggle('car--static', stops.length < 2);
    }

    function dots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = stops.length < 2 ? '' : stops.map(function (_, k) {
        return '<button type="button" class="car__dot' + (k === idx ? ' is-active' : '') + '" data-car-go="' + k + '" aria-label="Слайд ' + (k + 1) + '"><i></i></button>';
      }).join('');
      paint();
    }
    function paint() {
      qsa('.car__dot', dotsBox).forEach(function (b, k) {
        b.classList.toggle('is-active', k === idx);
        b.classList.toggle('is-done', k < idx);
        var bar = b.firstChild;
        if (bar) bar.style.transform = 'scaleX(' + (k < idx ? 1 : k === idx ? Math.min(1, elapsed / DUR) : 0) + ')';
      });
    }
    function go(k, smooth) {
      if (!stops.length) return;
      idx = (k + stops.length) % stops.length; elapsed = 0;
      lockScroll = Date.now();
      track.scrollTo({ left: stops[idx], behavior: smooth === false || reduce ? 'auto' : 'smooth' });
      paint();
    }
    var lockScroll = 0, st = 0;
    track.addEventListener('scroll', function () {
      clearTimeout(st);
      st = setTimeout(function () {
        if (Date.now() - lockScroll < 700) return;
        var x = track.scrollLeft, best = 0;
        stops.forEach(function (s, k) { if (Math.abs(s - x) < Math.abs(stops[best] - x)) best = k; });
        if (best !== idx) { idx = best; elapsed = 0; paint(); }
      }, 120);
    }, { passive: true });

    function running() { return inView && !hover && !held && !reduce && stops.length > 1 && !d.hidden; }
    function loop() {
      if (raf || !running()) return;
      last = performance.now();
      raf = requestAnimationFrame(function tick(now) {
        if (!running()) { raf = 0; paint(); return; }
        elapsed += now - last; last = now;
        if (elapsed >= DUR) go(idx + 1); else paint();
        raf = requestAnimationFrame(tick);
      });
    }

    root.addEventListener('mouseenter', function () { hover = true; section.classList.add('car--paused'); });
    root.addEventListener('mouseleave', function () { hover = false; section.classList.remove('car--paused'); loop(); });
    root.addEventListener('focusin', function () { hover = true; });
    root.addEventListener('focusout', function () { hover = false; loop(); });
    root.addEventListener('touchstart', function () { hover = true; }, { passive: true });
    root.addEventListener('touchend', function () { setTimeout(function () { hover = false; loop(); }, 2500); }, { passive: true });
    d.addEventListener('visibilitychange', loop);
    if (prev) prev.addEventListener('click', function () { go(idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx + 1); });
    if (dotsBox) dotsBox.addEventListener('click', function (e) { var b = e.target.closest('[data-car-go]'); if (b) go(+b.getAttribute('data-car-go')); });
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); go(Math.min(idx, stops.length - 1), false); }, 150); });
    if (mq.addEventListener) mq.addEventListener('change', function () { measure(); go(0, false); });

    /* Вертикальные ролики (9:16) показываем целиком на размытой подложке */
    tiles.forEach(function (t) {
      var bd = qs('.tile__bd', t);
      function check() { if (bd && bd.naturalWidth && bd.naturalHeight > bd.naturalWidth * 1.05) t.classList.add('is-portrait'); }
      if (bd) { if (bd.complete) check(); else bd.addEventListener('load', check); }
      var v = qs('video', t);
      if (v) v.addEventListener('loadedmetadata', function () { if (v.videoHeight > v.videoWidth * 1.05) t.classList.add('is-portrait'); });
    });

    build();
    return {
      setFilter: function (f) {
        var pills = qsa('[data-car-filters] .pill', section);
        if (!pills.some(function (p) { return p.getAttribute('data-filter') === f; })) f = 'all';
        filter = f;
        pills.forEach(function (p) { var on = p.getAttribute('data-filter') === f; p.classList.toggle('is-active', on); p.setAttribute('aria-selected', on ? 'true' : 'false'); });
        build(); loop();
      },
      hold: function (on) { held = on; syncVideos(); if (!on) loop(); },
      go: go
    };
  }

  /* ---------- Типы экранов: строка слева, видео и характеристики справа ---------- */
  var pickTimer = 0;
  function pick(row) {
    var box = row.closest('[data-pick]'); if (!box) return;
    var id = row.getAttribute('data-pick-id');
    qsa('[data-pick-id]', box).forEach(function (r) {
      var on = r.getAttribute('data-pick-id') === id;
      r.classList.toggle('is-active', on);
      r.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    qsa('[data-pick-panel]', box).forEach(function (p) {
      var on = p.getAttribute('data-pick-panel') === id;
      p.classList.toggle('is-active', on);
      var v = qs('video', p);
      if (v) { if (on && p.offsetParent !== null) play(v); else v.pause(); }
    });
  }

  /* ---------- Цифры-барабаны (как в макете дизайнера) ---------- */
  function wheels() {
    var items = qsa('[data-wheel]');
    if (!items.length) return;
    items.forEach(function (el, group) {
      var src = el.getAttribute('data-wheel');
      var m = src.match(/^(\D*?)(\d[\d\s ]*\d|\d)(.*)$/);
      if (!m) return;
      var vis = d.createElement('span'); vis.className = 'wh'; vis.setAttribute('aria-hidden', 'true');
      function affix(txt, side) { if (!txt || !txt.trim()) return; var s = d.createElement('span'); s.className = 'wh__affix wh__affix--' + side; s.textContent = txt.trim(); vis.appendChild(s); }
      affix(m[1], 'pre');
      var k = 0;
      m[2].split('').forEach(function (ch) {
        if (/\s/.test(ch)) { var sp = d.createElement('span'); sp.className = 'wh__sp'; vis.appendChild(sp); return; }
        var wheel = d.createElement('span'), strip = d.createElement('span');
        wheel.className = 'wh__w'; strip.className = 'wh__s';
        strip.style.setProperty('--to', String(20 + Number(ch)));
        strip.style.setProperty('--delay', (group * 0.07 + k * 0.045) + 's');
        for (var i = 0; i < 30; i++) { var n = d.createElement('span'); n.textContent = String(i % 10); strip.appendChild(n); }
        wheel.appendChild(strip); vis.appendChild(wheel); k++;
      });
      affix(m[3], 'post');
      var sr = d.createElement('span'); sr.className = 'sr'; sr.textContent = src;
      el.textContent = ''; el.appendChild(vis); el.appendChild(sr);
    });
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (e) { e.classList.add('is-seen'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-seen'); io.unobserve(en.target); } });
    }, { threshold: 0.45 });
    items.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Калькулятор ---------- */
  function updCalc() {
    var f = qs('[data-calc]'); if (!f) return;
    var sec = f.closest('section') || d;
    var W = num(qs('[name="w"]', f).value), H = num(qs('[name="h"]', f).value);
    var opt = qs('[name="calctype"]:checked', f);
    var rate = opt ? Number(opt.getAttribute('data-rate')) : 0;
    var share = Number(f.getAttribute('data-mount-share')) || 0;
    var withMount = qs('[name="mount"]', f).checked;
    var area = Math.round(W * H * 100) / 100, base = area * rate, mc = withMount ? Math.round(base * share / 100) : 0;
    function out(k, v, isHtml) { var el = qs('[data-out="' + k + '"]', sec); if (el) el[isHtml ? 'innerHTML' : 'textContent'] = v; }
    var name = opt ? opt.getAttribute('data-name') : '';
    out('area', area ? area.toLocaleString('ru-RU') + ' м²' : '—');
    out('type', name || '—');
    out('px', (opt && opt.getAttribute('data-px')) || '—');
    out('rate', rate ? fmt(rate) + ' ₽' : '—');
    out('mount', withMount ? '+' + share + '%, ~' + fmt(mc) + ' ₽' : 'не включены');
    if (area && rate) {
      var total = Math.round((base + mc) / 1000) * 1000;
      out('price', '<small>от</small><span class="calc__num">' + fmt(total) + '</span><small class="cur">₽</small>', true);
    } else out('price', '<span class="calc__empty">Укажите размеры</span>', true);
    var btn = qs('[data-calc-ask]', sec);
    if (btn) {
      btn.setAttribute('data-ask-product', (name || 'Экран') + ', ' + (W || '?') + ' × ' + (H || '?') + ' м, ' + (area || '?') + ' м²');
      if (opt) btn.setAttribute('data-ask-type', opt.value);
      btn.setAttribute('data-ask-w', W ? String(W) : '');
      btn.setAttribute('data-ask-h', H ? String(H) : '');
    }
  }

  /* ---------- FAQ ---------- */
  function toggleFaq(b) {
    var it = b.closest('.faq__item'); if (!it) return;
    var open = !it.classList.contains('is-open');
    it.classList.toggle('is-open', open);
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* ---------- Клики ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target, el;
    if (!t.closest) return;
    if (t.closest('[data-vpill-toggle]')) { var vp = t.closest('[data-vpill]'); vp.classList.toggle('is-open'); return; }
    if (t.closest('[data-open-menu]')) { openMenu(); return; }
    if (t.closest('[data-close-menu]')) { closeMenu(); return; }
    if (t.closest('.sheet__links a')) { closeMenu(); }
    if ((el = t.closest('[data-ask]'))) { e.preventDefault(); closeMenu(); if (el.hasAttribute('data-lb-ask')) closeLb(); openModal(el); return; }
    if (t.closest('[data-close-modal]')) { closeModal(); return; }
    if (t.closest('[data-close-lb]')) { closeLb(); return; }
    if ((el = t.closest('[data-pick-id]'))) { pick(el); return; }
    if ((el = t.closest('[data-step]'))) {
      var p = el.getAttribute('data-step').split(':'), inp = qs('[name="' + p[0] + '"]', el.closest('form'));
      var v = Math.max(0.5, Math.round((num(inp.value) + Number(p[1])) * 10) / 10);
      inp.value = v; updCalc(); return;
    }
    if ((el = t.closest('[data-car-filters] .pill'))) { if (car) car.setFilter(el.getAttribute('data-filter')); return; }
    if ((el = t.closest('[data-case-filter]'))) { if (car) car.setFilter(el.getAttribute('data-case-filter')); }
    if ((el = t.closest('.faq__q'))) { toggleFaq(el); return; }
    if ((el = t.closest('.tile'))) { openLb(el); return; }
  });
  /* На компьютере тип экрана переключается и наведением, с небольшой задержкой */
  d.addEventListener('mouseover', function (e) {
    var row = e.target.closest && e.target.closest('[data-pick-id]');
    if (!row || !matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;
    clearTimeout(pickTimer);
    pickTimer = setTimeout(function () { pick(row); }, 140);
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); closeModal(); closeMenu(); var vp = qs('[data-vpill].is-open'); if (vp) vp.classList.remove('is-open'); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('tile')) { e.preventDefault(); openLb(e.target); }
    if (e.key === 'Tab') {
      var box = qs('.is-open[data-modal] .modal__box') || qs('.is-open[data-lb] .lb__box') || qs('.is-open[data-sheet] .sheet__panel');
      if (!box) return;
      var f = qsa('a[href], button:not([disabled]), input, select, textarea, video[controls]', box).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* Формы прототипа не отправляются: показываем подтверждение */
  d.addEventListener('submit', function (e) {
    var f = e.target; e.preventDefault();
    if (f.hasAttribute('data-calc')) return;
    var ph = qs('[type="tel"]', f);
    if (ph && ph.value.replace(/\D/g, '').length < 11) { ph.focus(); ph.closest('.fld').classList.add('is-err'); return; }
    var cb = qs('.consent input', f);
    if (cb && !cb.checked) { cb.closest('.consent').classList.add('is-err'); return; }
    var btn = qs('button[type="submit"]', f);
    if (btn) {
      if (!btn.getAttribute('data-orig')) btn.setAttribute('data-orig', btn.innerHTML);
      btn.innerHTML = '<span class="btn__done">✓ ' + (f.getAttribute('data-done') || 'Заявка принята') + '</span>';
      btn.disabled = true; btn.classList.add('is-done');
    }
  });
  d.addEventListener('input', function (e) {
    var i = e.target;
    if (i.type === 'tel') {
      var v = i.value.replace(/[^\d+]/g, '');
      if (v && v[0] !== '+') v = '+' + v;
      i.value = v.slice(0, 13);
      var fl = i.closest('.fld'); if (fl) fl.classList.remove('is-err');
    }
    if (i.closest && i.closest('[data-calc]')) updCalc();
  });
  d.addEventListener('change', function (e) {
    if (e.target.closest && e.target.closest('[data-calc]')) updCalc();
    if (e.target.type === 'file') {
      var lab = e.target.closest('.upload'), sp = lab && qs('span', lab);
      if (sp && e.target.files && e.target.files[0]) sp.textContent = e.target.files[0].name;
    }
    if (e.target.type === 'checkbox' && e.target.closest('.consent')) e.target.closest('.consent').classList.remove('is-err');
  });

  /* ---------- Скролл: шапка, мобильная панель, активный пункт меню ---------- */
  function onScroll() {
    var y = window.scrollY;
    html.classList.toggle('is-scrolled', y > 12);
    var hero = qs('.scene');
    html.classList.toggle('show-mbar', !!hero && y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function observeNav() {
    var links = qsa('.hdr__nav a[href^="#"]');
    if (!links.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    qsa('#main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Появление секций ---------- */
  function reveals() {
    var els = qsa('.rv');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    html.classList.add('rv-on');
    var groups = new Map();
    els.forEach(function (e) {
      var p = e.parentNode, n = groups.get(p) || 0;
      groups.set(p, n + 1);
      e.style.setProperty('--rv-d', Math.min(n, 6) * 70 + 'ms');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Автовоспроизведение видео вне карусели: в кадре играет, вне кадра пауза ---------- */
  function autoVideos() {
    var vids = qsa('video[data-autoplay]');
    if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && v.offsetParent !== null) play(v); else v.pause();
      });
    }, { threshold: 0.2 });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
  }

  window.V4App = {
    init: function () {
      var scene = qs('[data-scene]');
      if (scene && window.V4Scene) window.V4Scene.init(scene);
      var root = qs('[data-car]');
      car = root && 'IntersectionObserver' in window ? Carousel(root) : null;
      wheels();
      updCalc();
      observeNav();
      reveals();
      autoVideos();
      onScroll();
    }
  };
})();
