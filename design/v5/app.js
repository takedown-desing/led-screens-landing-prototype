/* Вариант 5 · Истории объектов: интерактив без зависимостей.
   Модалка, меню, калькулятор, FAQ, автовидео из варианта 4 (карусели нет: объекты идут главами).
   Новое: «витрина включается» на первом экране и переключение цвета шапки по тону секции под ней.
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
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ---------- Блокировка прокрутки под оверлеями ---------- */
  var lastFocus = null;
  function lock(on) { html.classList.toggle('is-locked', !!on); }
  function anyOpen() { return qsa('.is-open[data-modal], .is-open[data-sheet]').length > 0; }

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

  /* ---------- Первый экран: витрина включается ---------- */
  /* Поверх играющего видео лежит «выключенный» слой: тот же кадр, обесцвеченный и тёмный.
     При прокрутке он открывается сверху вниз рядами по 1/ROWS высоты, на границе светится разогревающийся ряд.
     После включения (p > .72) появляются заголовок и кнопки. Без движения (reduced) экран включён сразу. */
  var ROWS = 36;
  function openScene(track) {
    var stage = qs('.open__stage', track), off = qs('.open__off', track), glow = qs('.open__glow', track);
    var video = qs('.open__video', track), capOff = qs('[data-cap-off]', track), capOn = qs('[data-cap-on]', track);
    var copy = qs('.open__copy', track), lamp = qs('.open__lamp', track);
    var raf = 0, last = -1;
    if (video) { video.muted = true; play(video); }
    if (reduce) { track.classList.add('is-on'); track.style.setProperty('--p', '1'); return; }
    function progress() {
      var span = Math.max(1, track.offsetHeight - stage.offsetHeight);
      return clamp(-track.getBoundingClientRect().top / span, 0, 1);
    }
    function paint() {
      raf = 0;
      var p = progress();
      if (p === last) return; last = p;
      var lit = clamp((p - 0.08) / 0.62, 0, 1);              /* доля зажжённых рядов */
      var rows = Math.round(lit * ROWS) / ROWS;              /* рядами, а не плавно */
      off.style.setProperty('--lit', (rows * 100).toFixed(3) + '%');
      glow.style.top = (rows * 100).toFixed(3) + '%';
      glow.style.opacity = lit > 0 && lit < 1 ? '1' : '0';
      var on = p > 0.72;
      track.classList.toggle('is-on', on);
      track.classList.toggle('is-warming', lit > 0 && !on);
      if (capOff) capOff.style.opacity = String(1 - clamp(lit * 3, 0, 1));
      if (capOn) capOn.style.opacity = String(clamp((lit - 0.35) * 2.2, 0, 1));
      if (copy) copy.style.setProperty('--show', String(clamp((p - 0.72) / 0.16, 0, 1)));
      if (lamp) lamp.classList.toggle('is-lit', lit > 0);
      track.setAttribute('data-progress', p.toFixed(3));
    }
    function request() { if (!raf) raf = requestAnimationFrame(paint); }
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { play(video); request(); } else if (video) video.pause();
    }, { threshold: 0 }).observe(track);
    paint();
  }

  /* ---------- Шапка: цвет по тону секции под ней ---------- */
  function toneWatch() {
    var hdr = qs('.hdr'); if (!hdr) return;
    var h = hdr.offsetHeight || 64;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) html.setAttribute('data-under', en.target.getAttribute('data-tone') || 'light'); });
    }, { rootMargin: '0px 0px -' + Math.max(0, innerHeight - h) + 'px 0px', threshold: 0 });
    qsa('[data-tone]').forEach(function (s) { io.observe(s); });
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
    if ((el = t.closest('[data-ask]'))) { e.preventDefault(); closeMenu(); openModal(el); return; }
    if (t.closest('[data-close-modal]')) { closeModal(); return; }
    if ((el = t.closest('[data-step]'))) {
      var p = el.getAttribute('data-step').split(':'), inp = qs('[name="' + p[0] + '"]', el.closest('form'));
      var v = Math.max(0.5, Math.round((num(inp.value) + Number(p[1])) * 10) / 10);
      inp.value = v; updCalc(); return;
    }
    if ((el = t.closest('.faq__q'))) { toggleFaq(el); return; }
    if ((el = t.closest('[data-sound]'))) {
      /* звук главы: включает звук у видео главы и показывает элементы управления */
      var v = qs('video', el.closest('.ch')); if (!v) return;
      v.muted = !v.muted; el.setAttribute('aria-pressed', String(!v.muted));
      el.textContent = v.muted ? 'Включить звук' : 'Выключить звук';
      if (!v.muted) play(v);
      return;
    }
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeMenu(); var vp = qs('[data-vpill].is-open'); if (vp) vp.classList.remove('is-open'); }
    if (e.key === 'Tab') {
      var box = qs('.is-open[data-modal] .modal__box') || qs('.is-open[data-sheet] .sheet__panel');
      if (!box) return;
      var f = qsa('a[href], button:not([disabled]), input, select, textarea', box).filter(function (x) { return x.offsetParent !== null; });
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
      btn.innerHTML = '✓ ' + (f.getAttribute('data-done') || 'Заявка принята');
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

  /* ---------- Скролл: мобильная панель, активный пункт меню ---------- */
  function onScroll() {
    var y = window.scrollY;
    html.classList.toggle('is-scrolled', y > 12);
    var hero = qs('.open');
    html.classList.toggle('show-mbar', !!hero && y > hero.offsetHeight * 0.8);
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
    qsa('#main [id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Появление ---------- */
  function reveals() {
    var els = qsa('.rv');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    html.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Видео глав и остальные: в кадре играет, вне кадра пауза ---------- */
  function autoVideos() {
    var vids = qsa('video[data-autoplay]');
    if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) play(en.target); else en.target.pause(); });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
    /* Вертикальные ролики показываем целиком на размытой подложке */
    qsa('.ch').forEach(function (ch) {
      var v = qs('video', ch);
      if (v) v.addEventListener('loadedmetadata', function () { if (v.videoHeight > v.videoWidth * 1.05) ch.classList.add('is-portrait'); });
    });
  }

  window.V5App = {
    init: function () {
      var track = qs('[data-open]');
      if (track) openScene(track);
      updCalc();
      observeNav();
      reveals();
      autoVideos();
      toneWatch();
      onScroll();
    }
  };
})();
