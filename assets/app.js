/* Прототип лендинга LED-экранов: интерактив без зависимостей. */
(function () {
  var d = document;
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* Пометки блоков: показать / скрыть, состояние в localStorage */
  var toggle = qs('[data-toggle-tags]');
  try { if (localStorage.getItem('led-hide-tags') === '1') d.body.classList.add('hide-tags'); } catch (e) {}
  function syncToggle() {
    if (!toggle) return;
    toggle.textContent = d.body.classList.contains('hide-tags') ? 'Показать пометки' : 'Скрыть пометки';
  }
  syncToggle();
  if (toggle) toggle.addEventListener('click', function () {
    d.body.classList.toggle('hide-tags');
    try { localStorage.setItem('led-hide-tags', d.body.classList.contains('hide-tags') ? '1' : '0'); } catch (e) {}
    syncToggle();
  });

  /* Подсветка управляемых полей (что редактируется в админке) */
  var cmsToggle = qs('[data-toggle-cms]');
  try { if (localStorage.getItem('led-show-cms') === '1') d.body.classList.add('show-cms'); } catch (e) {}
  function syncCms() {
    if (!cmsToggle) return;
    var on = d.body.classList.contains('show-cms');
    cmsToggle.classList.toggle('on', on);
    cmsToggle.textContent = on ? 'Скрыть управляемые поля' : 'Управляемые поля';
  }
  syncCms();
  if (cmsToggle) cmsToggle.addEventListener('click', function () {
    d.body.classList.toggle('show-cms');
    try { localStorage.setItem('led-show-cms', d.body.classList.contains('show-cms') ? '1' : '0'); } catch (e) {}
    syncCms();
  });

  /* Мобильное меню */
  var drawer = qs('.drawer');
  qsa('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { drawer && drawer.classList.add('open'); }); });
  qsa('[data-close-menu]').forEach(function (b) { b.addEventListener('click', function () { drawer && drawer.classList.remove('open'); }); });
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) drawer.classList.remove('open'); });
    qsa('a[href^="#"]', drawer).forEach(function (a) { a.addEventListener('click', function () { drawer.classList.remove('open'); }); });
  }

  /* Модальное окно заявки: заголовок, подпись и тип экрана подставляются из кнопки */
  var modal = qs('.modal');
  function openModal(title, sub, product) {
    if (!modal) return;
    if (title) qs('.modal h3').textContent = title;
    if (sub) qs('.modal .sub').textContent = sub;
    var pl = qs('.modal .prod-line');
    if (pl) pl.style.display = product ? 'flex' : 'none';
    if (pl && product) qs('.modal .prod-line b').textContent = product;
    var sel = qs('.modal select[name="type"]');
    if (sel && product) {
      qsa('option', sel).forEach(function (o) { if (product.indexOf(o.textContent.split(' ')[0]) === 0 || o.textContent === product) sel.value = o.value; });
    }
    modal.classList.add('open');
    var first = qs('input', modal); if (first) setTimeout(function () { first.focus(); }, 50);
  }
  qsa('[data-ask]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(b.getAttribute('data-ask-title'), b.getAttribute('data-ask-sub'), b.getAttribute('data-ask-product'));
    });
  });
  qsa('[data-close-modal]').forEach(function (b) { b.addEventListener('click', function () { modal && modal.classList.remove('open'); }); });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { modal && modal.classList.remove('open'); drawer && drawer.classList.remove('open'); } });

  /* Все формы прототипа: не отправляем, показываем подтверждение */
  qsa('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = qs('button[type="submit"]', f);
      var msg = f.getAttribute('data-done') || 'Заявка принята, Иван перезвонит в рабочее время';
      if (btn) { btn.textContent = msg; btn.disabled = true; }
    });
  });

  /* Фильтр кейсов по типу */
  qsa('[data-tabs]').forEach(function (wrap) {
    var tabs = qsa('.tab', wrap);
    var target = qs(wrap.getAttribute('data-tabs'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        var f = t.getAttribute('data-filter');
        qsa('[data-type]', target).forEach(function (c) {
          c.hidden = !(f === 'all' || c.getAttribute('data-type').split(' ').indexOf(f) > -1);
        });
      });
    });
  });

  /* Видео кейсов: клик по превью запускает ролик, остальные ставятся на паузу */
  qsa('.case .media').forEach(function (m) {
    var v = qs('video', m);
    if (!v) return;
    m.addEventListener('click', function () {
      if (v.paused) {
        qsa('.case .media video').forEach(function (o) { if (o !== v) { o.pause(); o.parentNode.classList.remove('playing'); } });
        v.play(); m.classList.add('playing');
      } else { v.pause(); m.classList.remove('playing'); }
    });
    v.addEventListener('ended', function () { m.classList.remove('playing'); });
    v.addEventListener('loadedmetadata', function () {
      var dur = qs('.dur', m);
      if (dur && isFinite(v.duration)) dur.textContent = Math.round(v.duration) + ' с';
    });
  });

  /* Калькулятор: площадь и ориентировочная стоимость «от». Ставки условные, помечены заливкой. */
  var calc = qs('[data-calc]');
  if (calc) {
    var rates = { transparent: 120000, outdoor: 85000, indoor: 140000, flex: 160000 };
    var names = { transparent: 'Прозрачный', outdoor: 'Уличный / медиафасад', indoor: 'Интерьерный', flex: 'Гибкий / криволинейный' };
    var w = qs('[name="w"]', calc), h = qs('[name="h"]', calc), t = qs('[name="type"]', calc), mnt = qs('[name="mount"]', calc);
    var outArea = qs('[data-out="area"]'), outPrice = qs('[data-out="price"]'), outType = qs('[data-out="type"]'), outMount = qs('[data-out="mount"]'), outPx = qs('[data-out="px"]');
    function fmt(n) { return n.toLocaleString('ru-RU'); }
    function upd() {
      var W = parseFloat(w.value) || 0, H = parseFloat(h.value) || 0, area = Math.round(W * H * 100) / 100;
      var base = area * (rates[t.value] || 0);
      var mountCost = mnt.checked ? Math.round(base * 0.15) : 0;
      if (outArea) outArea.textContent = area ? fmt(area) + ' м²' : '—';
      if (outType) outType.textContent = names[t.value] || '—';
      if (outMount) outMount.textContent = mnt.checked ? 'включён, ~15% от экрана' : 'не включён';
      if (outPx) outPx.textContent = { transparent: 'P3.9–P7.8', outdoor: 'P4–P10', indoor: 'P1.8–P3', flex: 'P2.5–P4' }[t.value] || '—';
      if (outPrice) outPrice.textContent = area ? 'от ' + fmt(Math.round((base + mountCost) / 1000) * 1000) + ' ₽' : 'укажите размеры';
      var btn = qs('[data-ask]', calc.parentNode.parentNode);
      if (btn) btn.setAttribute('data-ask-product', (names[t.value] || 'Экран') + ', ' + (W || '?') + '×' + (H || '?') + ' м, ' + (area || '?') + ' м²');
    }
    [w, h, t, mnt].forEach(function (el) { el && el.addEventListener('input', upd); el && el.addEventListener('change', upd); });
    upd();
  }

  /* Маска телефона: только цифры, +7 в начале */
  qsa('input[type="tel"]').forEach(function (i) {
    i.addEventListener('input', function () {
      var v = i.value.replace(/[^\d+]/g, '');
      if (v && v[0] !== '+') v = '+' + v;
      i.value = v.slice(0, 13);
    });
  });

  /* Подсветка активного пункта меню при прокрутке */
  var secs = qsa('section[id], div.trust[id]');
  var links = qsa('.hdr-nav a[href^="#"]');
  if (secs.length && links.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.style.color = l.getAttribute('href') === '#' + e.target.id ? '#22D3EE' : ''; });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }
})();
