/* Админка лендинга LED-экранов.
   Демо-режим: правки видны в предпросмотре и скачиваются файлом, на сайт не попадают.
   Режим публикации: вход по токену GitHub, правки и загруженные файлы уходят одним коммитом в репозиторий,
   GitHub Pages обновляет сайт примерно за минуту. */
(function () {
  'use strict';
  var d = document;
  var S = window.ADMIN_SCHEMA, GH = window.GH;
  var CONTENT_PATH = 'content/landing.json';
  var UPLOAD_DIR = 'assets/uploads/';
  var TOKEN_KEY = 'led-admin-token';
  var MAX_FILE = 50 * 1024 * 1024;
  var CFG = detectRepo();

  var state = null;          // редактируемый контент
  var saved = '';            // опубликованная версия (JSON без отступов) для сравнения
  var sha = null;            // sha файла контента на GitHub, чтобы поймать чужие правки
  var gh = null, login = null;
  var pending = {};          // загруженные, но ещё не опубликованные файлы: path -> {bytes, url, size}
  var published = {};        // опубликованные в этой сессии файлы: пока Pages не обновился, показываем их из памяти
  var openItems = new WeakSet();
  var page = null, frame = null, frameReady = false, timer = null, device = 'desktop';

  function detectRepo() {
    var host = location.hostname, m = host.match(/^([^.]+)\.github\.io$/i);
    var branch = new URLSearchParams(location.search).get('branch') || 'main';  // служебно: публикация в другую ветку для проверки
    if (m) return { owner: m[1], repo: location.pathname.split('/')[1], branch: branch };
    return { owner: 'takedown-desing', repo: 'led-screens-landing-prototype', branch: branch };
  }

  /* ---------- утилиты ---------- */
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function h(tag, props) {
    var e = d.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'value') e.value = v;
      else if (k === 'checked') e.checked = !!v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; }
    e.appendChild(typeof c === 'string' ? d.createTextNode(c) : c);
  }
  function getP(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
  function setP(o, p, v) {
    var ks = p.split('.'), last = ks.pop();
    var t = ks.reduce(function (a, k) { if (a[k] == null) a[k] = {}; return a[k]; }, o);
    t[last] = v;
  }
  function join(base, k) { return base ? base + '.' + k : k; }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function esc(s) { var x = d.createElement('div'); x.textContent = s == null ? '' : s; return x.innerHTML; }
  function size(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' МБ' : Math.max(1, Math.round(n / 1024)) + ' КБ'; }
  function when(iso) { var t = new Date(iso); return t.toLocaleDateString('ru-RU') + ' ' + t.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  function toast(msg, kind, ms) {
    var box = $('#toasts');
    var el = h('div', { class: 'toast ' + (kind || '') }, msg);
    box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 300); }, ms || 4500);
  }
  function errText(e) {
    if (!e) return 'Неизвестная ошибка';
    if (e.code === 'network') return 'Нет связи с GitHub. Проверьте интернет и попробуйте ещё раз.';
    if (e.code === 'conflict') return 'Пока вы редактировали, на сайт уже опубликовали другие правки. Скачайте свои правки файлом, нажмите «Сбросить» и внесите их поверх новой версии.';
    if (e.status === 401) return 'Токен недействителен или истёк. Создайте новый и подключитесь снова.';
    if (e.status === 403) return 'У токена нет права на запись. При создании токена нужно выдать Contents: Read and write.';
    if (e.status === 404) return 'Репозиторий не найден или у токена нет к нему доступа. Проверьте, что при создании токена выбран репозиторий ' + CFG.repo + '.';
    if (e.status === 413 || e.status === 422) return 'GitHub не принял файл: ' + e.message;
    return e.message || String(e);
  }

  /* ---------- медиа ---------- */
  function mediaUrl(p) {
    if (!p) return '';
    if (pending[p]) return pending[p].url;
    if (published[p]) return published[p];
    if (/^(https?:|blob:|data:)/.test(p)) return p;
    return '../' + p;
  }
  function slug(name) {
    var ext = (name.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
    var base = name.slice(0, name.length - ext.length).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'file';
    return base + ext;
  }
  function addUpload(file) {
    return file.arrayBuffer().then(function (buf) {
      var path = UPLOAD_DIR + Date.now().toString(36) + '-' + slug(file.name);
      pending[path] = { bytes: new Uint8Array(buf), url: URL.createObjectURL(file), size: file.size };
      fillMediaList();
      return path;
    });
  }
  function makePoster(url, name) {
    return new Promise(function (resolve, reject) {
      var v = d.createElement('video'), done = false;
      v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
      v.addEventListener('loadeddata', function () { v.currentTime = Math.min(1.5, (v.duration || 2) / 2); });
      v.addEventListener('seeked', function () {
        if (done) return; done = true;
        var w = Math.min(1280, v.videoWidth || 1280), c = d.createElement('canvas');
        c.width = w; c.height = Math.round((v.videoHeight || 720) * w / (v.videoWidth || 1280));
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(function (b) {
          if (!b) return reject(new Error('poster'));
          addUpload(new File([b], name.replace(/\.[^.]+$/, '') + '-poster.jpg', { type: 'image/jpeg' })).then(resolve, reject);
        }, 'image/jpeg', 0.82);
      });
      v.addEventListener('error', function () { reject(new Error('video')); });
      setTimeout(function () { if (!done) reject(new Error('timeout')); }, 15000);
    });
  }
  function fillMediaList() {
    var set = {};
    JSON.stringify(state || {}).replace(/"(assets\/[^"]+\.(?:jpe?g|png|webp|gif|svg|mp4|webm))"/gi, function (m, p) { set[p] = 1; });
    Object.keys(pending).forEach(function (p) { set[p] = 1; });
    $('#media-list').innerHTML = Object.keys(set).sort().map(function (p) { return '<option value="' + esc(p) + '">'; }).join('');
  }

  /* ---------- состояние ---------- */
  function dirty() { return state && JSON.stringify(state) !== saved; }
  function changed() {
    syncTop();
    clearTimeout(timer);
    timer = setTimeout(sendPreview, 180);
  }
  function syncTop() {
    var isDirty = dirty();
    $('#btn-publish').disabled = !isDirty;
    $('#btn-reset').disabled = !isDirty;
    var st = $('#dirty');
    st.textContent = isDirty ? 'Есть неопубликованные изменения' : (gh ? 'Всё опубликовано' : 'Изменений нет');
    st.className = 'dirty' + (isDirty ? ' on' : '');
  }

  /* ---------- предпросмотр ---------- */
  function sendPreview() {
    if (!frameReady || !state) return;
    var media = {};
    Object.keys(published).forEach(function (k) { media[k] = published[k]; });
    Object.keys(pending).forEach(function (k) { media[k] = pending[k].url; });
    frame.contentWindow.postMessage({ type: 'content', content: state, media: media }, location.origin);
  }
  function scrollPreview(id) {
    if (frameReady && id) frame.contentWindow.postMessage({ type: 'scrollTo', id: id }, location.origin);
  }
  function fitFrame() {
    var box = $('#pv-box'), w = box.clientWidth, hgt = box.clientHeight;
    if (device === 'mobile') {
      var k = Math.min(1, (w - 24) / 390);
      frame.style.width = '390px'; frame.style.height = (hgt / k) + 'px';
      frame.style.transform = 'scale(' + k + ')'; frame.style.left = Math.max(0, (w - 390 * k) / 2) + 'px';
      frame.classList.add('mobile');
    } else {
      var s = w / 1280;
      frame.style.width = '1280px'; frame.style.height = (hgt / s) + 'px';
      frame.style.transform = 'scale(' + s + ')'; frame.style.left = '0px';
      frame.classList.remove('mobile');
    }
  }
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.type === 'ready') { frameReady = true; sendPreview(); if (page) scrollPreview(page.scroll); }
  });

  /* ---------- поля ---------- */
  function wrap(f, control, extra) {
    return h('div', { class: 'fld' + (f.wide ? ' wide' : '') },
      f.label ? h('label', { class: 'fl', text: f.label }) : null, control, extra || null,
      f.hint ? h('small', { class: 'fh', text: f.hint }) : null);
  }
  function counter(f, input) {
    if (!f.counter) return null;
    var c = h('small', { class: 'cnt' });
    function upd() { var n = input.value.length; c.textContent = n + ' / ' + f.counter; c.classList.toggle('over', n > f.counter); }
    input.addEventListener('input', upd); upd();
    return c;
  }
  function field(f, base) {
    if (f.type === 'group') {
      return h('fieldset', { class: 'grp' }, h('legend', { text: f.label }), f.hint ? h('p', { class: 'fh', text: f.hint }) : null,
        f.fields.map(function (x) { return field(x, base); }));
    }
    var path = join(base, f.k), val = getP(state, path);
    switch (f.type) {
      case 'text': {
        var i = h('input', { type: 'text', value: val == null ? '' : val, placeholder: f.placeholder, maxlength: f.max,
          oninput: function () { setP(state, path, this.value); changed(); } });
        return wrap(f, i, counter(f, i));
      }
      case 'textarea': {
        var ta = h('textarea', { rows: f.rows || 3, value: val == null ? '' : val, placeholder: f.placeholder,
          oninput: function () { setP(state, path, this.value); changed(); } });
        return wrap(f, ta, counter(f, ta));
      }
      case 'number':
        return wrap(f, h('input', { type: 'number', value: val == null ? '' : val, min: f.min, max: f.max, step: f.step || 'any',
          oninput: function () { var n = parseFloat(this.value); setP(state, path, isNaN(n) ? 0 : n); changed(); } }));
      case 'checkbox':
        return h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: !!val,
          onchange: function () { setP(state, path, this.checked); changed(); } }), h('span', { text: f.label }));
      case 'select': {
        var opts = typeof f.options === 'function' ? f.options(state) : f.options;
        var sel = h('select', { onchange: function () { setP(state, path, this.value); changed(); } },
          opts.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
        sel.value = val == null ? '' : val;
        return wrap(f, sel);
      }
      case 'icon': {
        var ico = h('span', { class: 'ico-pv' });
        function paint(n) { ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + (LandingRender.ICONS[n] || '') + '</svg>'; }
        var s2 = h('select', { onchange: function () { setP(state, path, this.value); paint(this.value); changed(); } },
          f.options().map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
        s2.value = val || 'doc'; paint(s2.value);
        return wrap(f, h('div', { class: 'ico-row' }, ico, s2));
      }
      case 'multicheck': {
        var mopts = f.options(state), cur = Array.isArray(val) ? val : [];
        if (!mopts.length) return wrap(f, h("div", { class: "fh", text: "Сначала добавьте фильтры выше" }));
        return wrap(f, h("div", { class: "mchk" }, mopts.map(function (o) {
          return h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: cur.indexOf(o[0]) > -1, onchange: function () {
            var now = (getP(state, path) || []).filter(function (x) { return x !== o[0]; });
            if (this.checked) now.push(o[0]);
            setP(state, path, now); changed();
          } }), h('span', { text: o[1] }));
        })));
      }
      case 'media': return media(f, path, base);
      case 'list': return list(f, path);
    }
    return h('div');
  }

  function media(f, path, base) {
    var thumb = h('div', { class: 'thumb' });
    var info = h('small', { class: 'fh' });
    function draw() {
      var v = getP(state, path);
      thumb.innerHTML = '';
      if (!v) { thumb.appendChild(h('span', { text: 'нет файла' })); info.textContent = ''; return; }
      var u = mediaUrl(v);
      thumb.appendChild(f.kind === 'video' ? h('video', { src: u, muted: true, preload: 'metadata', playsinline: true }) : h('img', { src: u, alt: '' }));
      info.textContent = pending[v] ? 'Новый файл, ' + size(pending[v].size) + ', уйдёт на сайт при публикации' : '';
    }
    var inp = h('input', { type: 'text', value: getP(state, path) || '', list: 'media-list', placeholder: f.kind === 'video' ? 'assets/video/…mp4' : 'assets/img/…jpg',
      onchange: function () { setP(state, path, this.value.trim()); draw(); changed(); } });
    var file = h('input', { type: 'file', accept: f.kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp', hidden: true,
      onchange: function () {
        var fl = this.files[0]; this.value = '';
        if (!fl) return;
        if (fl.size > MAX_FILE) { toast('Файл больше 50 МБ. Сожмите его и загрузите снова.', 'err'); return; }
        if (f.kind === 'video' && fl.size > 15 * 1024 * 1024) toast('Видео тяжелее 15 МБ будет долго грузиться у посетителей. Лучше сжать до 5–10 МБ.', 'warn', 7000);
        addUpload(fl).then(function (p) {
          inp.value = p; setP(state, path, p); draw(); changed();
          if (f.kind === 'video' && f.poster) {
            return makePoster(pending[p].url, fl.name).then(function (pp) {
              setP(state, join(base, f.poster), pp); changed(); renderPage(true);
              toast('Превью для видео создано из кадра ролика');
            }, function () { toast('Не получилось сделать превью из видео, загрузите картинку вручную', 'warn'); });
          }
        });
      } });
    var up = h('button', { type: 'button', class: 'btn sm', text: f.kind === 'video' ? 'Загрузить видео' : 'Загрузить фото', onclick: function () { file.click(); } });
    var clr = h('button', { type: 'button', class: 'btn sm ghost', text: 'Убрать', onclick: function () { inp.value = ''; setP(state, path, ''); draw(); changed(); } });
    draw();
    return wrap(f, h('div', { class: 'media-row' }, thumb, h('div', { class: 'media-ctl' }, inp, h('div', { class: 'row' }, up, clr, file), info)));
  }

  function list(f, path) {
    var box = h('div', { class: 'lst' + (f.inline ? ' inline' : '') });
    function arr() { var a = getP(state, path); if (!Array.isArray(a)) { a = []; setP(state, path, a); } return a; }
    function after() { changed(); if (f.refresh) renderPage(true); else draw(); }
    function ctl(a, i, label) {
      function b(txt, title, ok, fn) {
        return h('button', { type: 'button', class: 'ib', title: title, disabled: !ok, text: txt, onclick: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } });
      }
      return h('span', { class: 'ctl' },
        b('↑', 'Выше', i > 0, function () { var x = a.splice(i, 1)[0]; a.splice(i - 1, 0, x); after(); }),
        b('↓', 'Ниже', i < a.length - 1, function () { var x = a.splice(i, 1)[0]; a.splice(i + 1, 0, x); after(); }),
        f.inline ? null : b('⧉', 'Сделать копию', !f.max || a.length < f.max, function () {
          var c = clone(a[i]); if (c.id) c.id = S.uid(); a.splice(i + 1, 0, c); openItems.add(c); after();
        }),
        b('✕', 'Удалить', true, function () {
          if (!f.inline && !confirm('Удалить «' + (label || 'элемент') + '»?')) return;
          a.splice(i, 1); after();
        }));
    }
    function draw() {
      box.innerHTML = '';
      var a = arr();
      box.appendChild(h('div', { class: 'lst-h' }, h('span', { class: 'fl', text: f.label }), h('span', { class: 'cnt', text: String(a.length) })));
      if (f.hint) box.appendChild(h('small', { class: 'fh', text: f.hint }));
      a.forEach(function (item, i) {
        var ip = path + '.' + i;
        if (f.inline) {
          box.appendChild(h('div', { class: 'irow' }, f.item.map(function (sf) { return field(sf, ip); }), ctl(a, i)));
          return;
        }
        var det = h('details', { class: 'itm' + (item.visible === false ? ' off' : '') });
        if (openItems.has(item)) det.open = true;
        det.addEventListener('toggle', function () { if (det.open) openItems.add(item); else openItems.delete(item); });
        var ttl = h('span', { class: 't' });
        function upd() {
          var name = S.plain(f.title ? f.title(item) : '').trim() || 'Без названия';
          ttl.textContent = (i + 1) + '. ' + name;
          det.classList.toggle('off', item.visible === false);
        }
        upd();
        det.appendChild(h('summary', {}, ttl, item.visible === false ? h('span', { class: 'badge', text: 'скрыт' }) : null, ctl(a, i, S.plain(f.title ? f.title(item) : ''))));
        det.appendChild(h('div', { class: 'body' }, f.item.map(function (sf) { return field(sf, ip); })));
        det.addEventListener('input', upd);
        det.addEventListener('change', upd);
        box.appendChild(det);
      });
      if (!f.max || a.length < f.max) {
        box.appendChild(h('button', { type: 'button', class: 'btn add', text: '+ ' + (f.addLabel || 'Добавить'), onclick: function () {
          var n = f.make(); a.push(n); openItems.add(n); after();
        } }));
      }
    }
    if (f.refresh) box.addEventListener('change', function (e) { if (e.target.tagName === 'INPUT') renderPage(true); });
    draw();
    return box;
  }

  function blocksEditor() {
    var box = h('div', { class: 'blocks' });
    function draw() {
      box.innerHTML = '';
      var a = state.blocks;
      a.forEach(function (b, i) {
        function mv(dir) { var x = a.splice(i, 1)[0]; a.splice(i + dir, 0, x); changed(); draw(); renderNav(); }
        box.appendChild(h('div', { class: 'brow' + (b.visible ? '' : ' off') },
          h('span', { class: 'n', text: String(i + 1) }),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: b.visible, onchange: function () { b.visible = this.checked; changed(); draw(); renderNav(); } }),
            h('b', { text: S.blockNames[b.id] || b.id })),
          h('input', { type: 'text', value: b.menu || '', placeholder: 'Пункт меню: пусто, если не нужен', oninput: function () { b.menu = this.value; changed(); } }),
          h('span', { class: 'ctl' },
            h('button', { type: 'button', class: 'ib', title: 'Выше', text: '↑', disabled: i === 0, onclick: function () { mv(-1); } }),
            h('button', { type: 'button', class: 'ib', title: 'Ниже', text: '↓', disabled: i === a.length - 1, onclick: function () { mv(1); } }),
            h('button', { type: 'button', class: 'btn sm ghost', text: 'Править', onclick: function () { openPage(b.id); } }))));
      });
    }
    draw();
    return box;
  }

  /* ---------- навигация и страницы ---------- */
  function renderNav() {
    var nav = $('#nav'); nav.innerHTML = '';
    var groups = {};
    S.pages.forEach(function (p) { (groups[p.group] = groups[p.group] || []).push(p); });
    Object.keys(groups).forEach(function (g) {
      nav.appendChild(h('div', { class: 'ng', text: g }));
      groups[g].forEach(function (p) {
        var blk = state.blocks.filter(function (b) { return b.id === p.id; })[0];
        nav.appendChild(h('a', { href: '#' + p.id, class: 'ni' + (page && page.id === p.id ? ' on' : '') + (blk && !blk.visible ? ' off' : ''),
          onclick: function (e) { e.preventDefault(); openPage(p.id); } },
          h('span', { text: p.title }), blk && !blk.visible ? h('span', { class: 'badge', text: 'скрыт' }) : null));
      });
    });
  }
  function openPage(id) {
    page = S.pages.filter(function (p) { return p.id === id; })[0] || S.pages[0];
    history.replaceState(null, '', '#' + page.id);
    renderNav();
    renderPage(false);
    scrollPreview(page.scroll);
  }
  function renderPage(keepScroll) {
    var ed = $('#editor'), y = ed.scrollTop;
    ed.innerHTML = '';
    fillMediaList();
    var blk = state.blocks.filter(function (b) { return b.id === page.id; })[0];
    ed.appendChild(h('div', { class: 'ph' },
      h('h1', { text: page.title }),
      blk ? h('label', { class: 'chk pill' }, h('input', { type: 'checkbox', checked: blk.visible, onchange: function () { blk.visible = this.checked; changed(); renderNav(); } }), h('span', { text: 'Блок показан на сайте' })) : null));
    if (page.intro) ed.appendChild(h('p', { class: 'intro', text: page.intro }));
    ed.appendChild(h('p', { class: 'tip', html: 'Текст в <code>[[двойных скобках]]</code> подсвечивается на сайте оранжевым как условный. Подставили реальные данные, уберите скобки.' }));
    if (page.special === 'blocks') ed.appendChild(blocksEditor());
    else ed.appendChild(h('div', { class: 'form' }, page.fields.map(function (f) { return field(f, ''); })));
    if (keepScroll) ed.scrollTop = y; else ed.scrollTop = 0;
  }

  /* ---------- режимы и вход ---------- */
  function syncMode() {
    var m = $('#mode');
    if (gh) {
      m.className = 'mode live';
      m.innerHTML = '';
      m.appendChild(h('span', { text: 'Публикация: ' + login }));
      m.appendChild(h('button', { type: 'button', class: 'lnk', text: 'Выйти', onclick: logout }));
      $('#btn-history').hidden = false;
    } else {
      m.className = 'mode demo';
      m.innerHTML = '';
      m.appendChild(h('span', { text: 'Демо: правки видны только вам' }));
      m.appendChild(h('button', { type: 'button', class: 'lnk', text: 'Подключить публикацию', onclick: function () { showModal('#m-login'); } }));
      $('#btn-history').hidden = true;
    }
    syncTop();
  }
  async function connect(token) {
    var g = new GH({ token: token, owner: CFG.owner, repo: CFG.repo, branch: CFG.branch });
    var u = await g.user();
    await g.repoInfo();
    var f = await g.readFile(CONTENT_PATH);
    var remote = JSON.parse(f.text);
    gh = g; login = u.login; sha = f.sha;
    if (state && dirty()) {
      saved = JSON.stringify(remote);
      toast('Публикация подключена. Ваши правки на месте, их можно опубликовать.', 'ok');
    } else {
      state = remote; saved = JSON.stringify(state);
    }
    return true;
  }
  function logout() {
    if (!confirm('Выйти? Токен будет удалён из этого браузера.')) return;
    store(TOKEN_KEY, null); gh = null; login = null; sha = null;
    syncMode();
  }

  function showModal(id) { $(id).classList.add('open'); var i = $(id + ' input'); if (i) setTimeout(function () { i.focus(); }, 30); }
  function hideModal(id) { $(id).classList.remove('open'); }

  function bindLogin() {
    $('#login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var tok = $('#login-token').value.trim(), btn = $('#login-form button[type="submit"]'), err = $('#login-err');
      if (!tok) return;
      btn.disabled = true; btn.textContent = 'Проверяю…'; err.textContent = '';
      connect(tok).then(function () {
        if ($('#login-remember').checked) store(TOKEN_KEY, tok);
        hideModal('#m-login'); $('#login-token').value = '';
        syncMode(); renderNav(); renderPage(true); sendPreview();
      }).catch(function (x) { err.textContent = errText(x); })
        .then(function () { btn.disabled = false; btn.textContent = 'Подключить'; });
    });
  }

  /* ---------- публикация ---------- */
  function referenced(json) {
    return Object.keys(pending).filter(function (p) { return json.indexOf('"' + p + '"') > -1; });
  }
  function openPublish() {
    if (!dirty()) return;
    if (!gh) { showModal('#m-login'); return; }
    var json = JSON.stringify(state, null, 2) + '\n';
    var files = referenced(json);
    var total = files.reduce(function (s, p) { return s + pending[p].size; }, 0);
    $('#pub-files').textContent = files.length ? 'Вместе с текстом уйдут новые файлы: ' + files.length + ' шт., ' + size(total) + '.' : 'Новых файлов нет, уйдёт только текст.';
    $('#pub-msg').value = 'Правки контента через админку';
    $('#pub-err').textContent = '';
    showModal('#m-publish');
  }
  function bindPublish() {
    $('#pub-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('#pub-form button[type="submit"]'), err = $('#pub-err');
      var json = JSON.stringify(state, null, 2) + '\n';
      var paths = referenced(json);
      var files = paths.map(function (p) { return { path: p, b64: GH.bytesToB64(pending[p].bytes) }; });
      files.push({ path: CONTENT_PATH, b64: GH.textToB64(json) });
      btn.disabled = true; btn.textContent = 'Публикую…'; err.textContent = '';
      gh.commitFiles(files, $('#pub-msg').value.trim() || 'Правки контента через админку', { path: CONTENT_PATH, sha: sha })
        .then(function (r) {
          sha = r.shas[CONTENT_PATH];
          saved = JSON.stringify(state);
          paths.forEach(function (p) { published[p] = pending[p].url; delete pending[p]; });
          Object.keys(pending).forEach(function (p) { URL.revokeObjectURL(pending[p].url); delete pending[p]; });
          hideModal('#m-publish'); syncTop(); renderPage(true);
          toast('Опубликовано. Сайт обновится примерно через минуту.', 'ok', 6000);
          watchLive(json);
        })
        .catch(function (x) { err.textContent = errText(x); })
        .then(function () { btn.disabled = false; btn.textContent = 'Опубликовать'; });
    });
  }
  function watchLive(json) {
    var st = $('#live');
    if (!/github\.io$/i.test(location.hostname)) { st.textContent = ''; return; }
    var want = JSON.stringify(JSON.parse(json)), tries = 0;
    st.className = 'live wait'; st.textContent = 'Сайт обновляется…';
    (function poll() {
      tries++;
      fetch('../' + CONTENT_PATH + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) {
        if (JSON.stringify(c) === want) { st.className = 'live ok'; st.textContent = 'Сайт обновлён'; setTimeout(function () { st.textContent = ''; }, 15000); }
        else if (tries < 24) setTimeout(poll, 10000);
        else { st.className = 'live'; st.textContent = 'Сайт ещё обновляется, проверьте позже'; }
      }).catch(function () { if (tries < 24) setTimeout(poll, 10000); });
    })();
  }

  /* ---------- история ---------- */
  function openHistory() {
    if (!gh) return;
    var box = $('#hist-list');
    box.innerHTML = '<p class="fh">Загружаю…</p>';
    showModal('#m-history');
    gh.history(CONTENT_PATH, 20).then(function (items) {
      box.innerHTML = '';
      items.forEach(function (c, i) {
        box.appendChild(h('div', { class: 'hrow' },
          h('div', {}, h('b', { text: c.message.split('\n')[0] }), h('small', { class: 'fh', text: when(c.date) + ' · ' + c.author + (i === 0 ? ' · сейчас на сайте' : '') })),
          h('span', { class: 'row' },
            h('a', { class: 'btn sm ghost', href: c.url, target: '_blank', rel: 'noopener', text: 'На GitHub' }),
            i === 0 ? null : h('button', { type: 'button', class: 'btn sm', text: 'Открыть', onclick: function () {
              if (dirty() && !confirm('Текущие неопубликованные правки заменятся этой версией. Продолжить?')) return;
              gh.readFile(CONTENT_PATH, c.sha).then(function (f) {
                state = JSON.parse(f.text); openItems = new WeakSet();
                hideModal('#m-history'); renderNav(); renderPage(false); changed();
                toast('Открыта версия от ' + when(c.date) + '. Чтобы вернуть её на сайт, нажмите «Опубликовать».', 'ok', 8000);
              }).catch(function (x) { toast(errText(x), 'err'); });
            } }))));
      });
    }).catch(function (x) { box.innerHTML = ''; box.appendChild(h('p', { class: 'err', text: errText(x) })); });
  }

  /* ---------- прочее ---------- */
  function download() {
    var blob = new Blob([JSON.stringify(state, null, 2) + '\n'], { type: 'application/json' });
    var a = h('a', { href: URL.createObjectURL(blob), download: 'landing.json' });
    d.body.appendChild(a); a.click(); a.remove();
    if (Object.keys(pending).length) toast('В файл попал только текст. Загруженные фото и видео сохраняются только при публикации.', 'warn', 7000);
  }
  function reset() {
    if (!dirty() || !confirm('Отменить все неопубликованные правки?')) return;
    state = JSON.parse(saved);
    Object.keys(pending).forEach(function (p) { URL.revokeObjectURL(pending[p].url); });
    pending = {}; openItems = new WeakSet();
    renderNav(); renderPage(true); changed();
  }

  function bindTop() {
    $('#btn-publish').addEventListener('click', openPublish);
    $('#btn-reset').addEventListener('click', reset);
    $('#btn-download').addEventListener('click', download);
    $('#btn-history').addEventListener('click', openHistory);
    $$('[data-device]').forEach(function (b) {
      b.addEventListener('click', function () {
        device = b.getAttribute('data-device');
        $$('[data-device]').forEach(function (x) { x.classList.toggle('on', x === b); });
        fitFrame();
      });
    });
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { hideModal('#' + b.closest('.modal').id); }); });
    $$('.modal').forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) hideModal('#' + m.id); }); });
    d.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); openPublish(); }
      if (e.key === 'Escape') $$('.modal.open').forEach(function (m) { m.classList.remove('open'); });
    });
    window.addEventListener('beforeunload', function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
    window.addEventListener('resize', fitFrame);
    $('#pv-toggle').addEventListener('click', function () { d.body.classList.toggle('pv-open'); fitFrame(); });
    $('#repo-link').href = 'https://github.com/' + CFG.owner + '/' + CFG.repo;
  }

  async function boot() {
    frame = $('#pv');
    bindTop(); bindLogin(); bindPublish();
    fitFrame();
    frame.src = '../landing.html?preview=1';
    var tok = store(TOKEN_KEY);
    if (tok) {
      try { await connect(tok); }
      catch (e) { toast('Не удалось подключить публикацию: ' + errText(e), 'err', 8000); if (e.status === 401) store(TOKEN_KEY, null); gh = null; }
    }
    if (!state) {
      try {
        var r = await fetch('../' + CONTENT_PATH + '?t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        state = await r.json(); saved = JSON.stringify(state);
      } catch (e) {
        $('#editor').innerHTML = '<p class="err">Не удалось загрузить контент: ' + esc(e.message) + '</p>';
        return;
      }
    }
    syncMode();
    openPage((location.hash || '').slice(1) || 'settings');
    sendPreview();
  }

  boot();
})();
