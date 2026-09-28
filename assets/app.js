/* Прототип лендинга LED-экранов: интерактив без зависимостей.
   Все обработчики делегированы на document, поэтому работают после любой перерисовки из render.js. */
(function () {
  var d = document;
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* Панель прототипа: пометки блоков и подсветка управляемых полей */
  var tagsBtn = qs('[data-toggle-tags]'), cmsBtn = qs('[data-toggle-cms]');
  if (store('led-hide-tags') === '1') d.body.classList.add('hide-tags');
  if (store('led-show-cms') === '1') d.body.classList.add('show-cms');
  function syncBar() {
    if (tagsBtn) tagsBtn.textContent = d.body.classList.contains('hide-tags') ? 'Показать пометки' : 'Скрыть пометки';
    if (cmsBtn) {
      var on = d.body.classList.contains('show-cms');
      cmsBtn.classList.toggle('on', on);
      cmsBtn.textContent = on ? 'Скрыть управляемые поля' : 'Управляемые поля';
    }
  }
  syncBar();
  if (tagsBtn) tagsBtn.addEventListener('click', function () {
    d.body.classList.toggle('hide-tags'); store('led-hide-tags', d.body.classList.contains('hide-tags') ? '1' : '0'); syncBar();
  });
  if (cmsBtn) cmsBtn.addEventListener('click', function () {
    d.body.classList.toggle('show-cms'); store('led-show-cms', d.body.classList.contains('show-cms') ? '1' : '0'); syncBar();
  });

  function drawer() { return qs('.drawer'); }
  function modal() { return qs('.modal'); }
  function closeAll() { var dr = drawer(), m = modal(); if (dr) dr.classList.remove('open'); if (m) m.classList.remove('open'); }

  function openModal(b) {
    var m = modal(); if (!m) return;
    var title = b.getAttribute('data-ask-title'), sub = b.getAttribute('data-ask-sub');
    var product = b.getAttribute('data-ask-product'), type = b.getAttribute('data-ask-type');
    if (title) qs('h3', m).textContent = title;
    if (sub) qs('.sub', m).textContent = sub;
    var pl = qs('.prod-line', m);
    if (pl) { pl.style.display = product ? 'flex' : 'none'; if (product) qs('b', pl).textContent = product; }
    var sel = qs('select[name="type"]', m);
    if (sel && type && qs('option[value="' + type + '"]', sel)) sel.value = type;
    var f = qs('form', m), btn = f && qs('button[type="submit"]', f);
    if (btn && btn.disabled) { btn.disabled = false; btn.textContent = 'Отправить'; }
    m.classList.add('open');
    var first = qs('input[type="text"]', m); if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function applyFilter(id) {
    var wrap = qs('[data-tabs]'); if (!wrap) return;
    var target = qs(wrap.getAttribute('data-tabs'));
    var tab = qs('.tab[data-filter="' + id + '"]', wrap) || qs('.tab[data-filter="all"]', wrap);
    if (!tab) return;
    var f = tab.getAttribute('data-filter');
    qsa('.tab', wrap).forEach(function (x) { x.classList.toggle('active', x === tab); });
    qsa('[data-type]', target).forEach(function (c) {
      c.hidden = !(f === 'all' || c.getAttribute('data-type').split(' ').indexOf(f) > -1);
    });
  }

  d.addEventListener('click', function (e) {
    var t = e.target, el;
    if (!t.closest) return;
    if (t.closest('[data-open-menu]')) { var dr = drawer(); if (dr) dr.classList.add('open'); return; }
    if (t.closest('[data-close-menu]') || t.classList.contains('drawer')) { closeAll(); return; }
    if (t.closest('.drawer a[href^="#"]')) { closeAll(); }
    if ((el = t.closest('[data-ask]'))) { e.preventDefault(); closeAll(); openModal(el); return; }
    if (t.closest('[data-close-modal]') || t.classList.contains('modal')) { closeAll(); return; }
    if ((el = t.closest('[data-tabs] .tab'))) { applyFilter(el.getAttribute('data-filter')); return; }
    if ((el = t.closest('[data-case-filter]'))) { applyFilter(el.getAttribute('data-case-filter')); }
    if ((el = t.closest('.case .media'))) {
      var v = qs('video', el); if (!v) return;
      if (v.paused) {
        qsa('.case .media video').forEach(function (o) { if (o !== v) { o.pause(); o.parentNode.classList.remove('playing'); } });
        v.play(); el.classList.add('playing');
      } else { v.pause(); el.classList.remove('playing'); }
    }
  });

  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  /* Формы прототипа: не отправляем, показываем подтверждение */
  d.addEventListener('submit', function (e) {
    var f = e.target; e.preventDefault();
    if (f.hasAttribute('data-calc')) return;
    var btn = qs('button[type="submit"]', f);
    var msg = f.getAttribute('data-done') || 'Заявка принята';
    if (btn) { btn.textContent = msg; btn.disabled = true; }
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
  d.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('[data-calc]')) updCalc(); });

  /* Длительность видео кейсов */
  d.addEventListener('loadedmetadata', function (e) {
    var v = e.target;
    if (v.tagName !== 'VIDEO') return;
    var dur = v.parentNode && qs('.dur', v.parentNode);
    if (dur && isFinite(v.duration)) dur.textContent = Math.round(v.duration) + ' с';
  }, true);
  d.addEventListener('ended', function (e) {
    var m = e.target.closest && e.target.closest('.case .media'); if (m) m.classList.remove('playing');
  }, true);

  /* Калькулятор: ставки и шаг приходят из атрибутов option, их задают в типах экранов */
  function fmt(n) { return n.toLocaleString('ru-RU'); }
  function num(el) { return el ? parseFloat(String(el.value).replace(',', '.')) || 0 : 0; }
  function updCalc() {
    var f = qs('[data-calc]'); if (!f) return;
    var sec = f.closest('section') || d;
    var W = num(qs('[name="w"]', f)), H = num(qs('[name="h"]', f));
    var sel = qs('[name="calctype"]', f), opt = sel && sel.options[sel.selectedIndex];
    var rate = opt ? Number(opt.getAttribute('data-rate')) : 0;
    var share = Number(f.getAttribute('data-mount-share')) || 0;
    var mount = qs('[name="mount"]', f), withMount = mount && mount.checked;
    var area = Math.round(W * H * 100) / 100, base = area * rate, mc = withMount ? Math.round(base * share / 100) : 0;
    function out(k, v) { var el = qs('[data-out="' + k + '"]', sec); if (el) el.textContent = v; }
    var name = opt ? opt.getAttribute('data-name') : '';
    out('area', area ? fmt(area) + ' м²' : '—');
    out('type', name || '—');
    out('px', (opt && opt.getAttribute('data-px')) || '—');
    out('mount', withMount ? 'включён, ~' + share + '% от экрана' : 'не включён');
    out('price', area && rate ? 'от ' + fmt(Math.round((base + mc) / 1000) * 1000) + ' ₽' : (rate ? 'укажите размеры' : 'нет типов со ставкой'));
    var btn = qs('[data-calc-ask]', sec);
    if (btn) {
      btn.setAttribute('data-ask-product', (name || 'Экран') + ', ' + (W || '?') + '×' + (H || '?') + ' м, ' + (area || '?') + ' м²');
      if (opt) btn.setAttribute('data-ask-type', opt.value);
    }
  }

  /* Подсветка пункта меню при прокрутке */
  var io = null;
  function observeNav() {
    if (io) io.disconnect();
    var links = qsa('.hdr-nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.style.color = l.getAttribute('href') === '#' + en.target.id ? '#22D3EE' : ''; });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    qsa('#app section[id], #app .trust[id], #app .cta-band[id]').forEach(function (s) { io.observe(s); });
  }

  /* Класс scrolled: прячет ярлык прототипа у липкой шапки при прокрутке */
  function onScroll() { d.body.classList.toggle('scrolled', window.scrollY > 120); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  window.LandingApp = { afterRender: function () { updCalc(); observeNav(); } };
})();
