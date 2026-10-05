/* Вариант 2 «Контраст»: страница собирается из ../../content/landing.json (тот же файл, что правит админка).
   Порядок и видимость блоков берутся из blocks, меню из blocks[].menu.
   [[текст]] выводится как «текст» без подсветки. Перевод строки превращается в <br>, пустая строка делит абзацы.
   ACCENT: подстрока заголовка, которая выделяется оранжевым КАПСОМ. Если клиент поменял заголовок
   и подстроки в нём больше нет, заголовок выводится без выделения. */
(function () {
  'use strict';

  var ROOT = '../../';

  var ACCENT = {
    hero: 'под ключ',
    trust: 'своими бригадами',
    screens: 'светодиодных экранов',
    cases: 'объекты',
    included: 'поставку и монтаж',
    process: 'работаем',
    calc: 'сколько стоит',
    specs: 'шаг пикселя',
    about: 'хэнпэн',
    reviews: 'заказчиков',
    cta: 'фото',
    faq: 'вопросы',
    contacts: 'контакты'
  };

  /* Фон секции по id блока: светлые преобладают, чёрные там, где светятся экраны */
  var THEME = {
    trust: 'light', screens: 'grey', cases: 'dark', included: 'light', process: 'grey', calc: 'dark',
    specs: 'light', about: 'grey', reviews: 'dark', cta: 'orange', faq: 'light', contacts: 'dark'
  };

  var ICONS = {
    config: '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="17" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
    truck: '<path d="M3 7h13v10H3zM16 10h4l1 3v4h-5z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    building: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-7 7a2.1 2.1 0 0 1-3-3l7-7a6 6 0 0 1 7.9-7.9z"/>',
    monitor: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
    check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/>',
    shield: '<path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    clip: '<path d="M21.4 11.1 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.1a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowD: '<path d="M12 4v16M6 14l6 6 6-6"/>',
    arrowUR: '<path d="M7 17 17 7M8 7h9v9"/>',
    tick: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>'
  };
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z"/></svg>';
  var MSG = {
    telegram: ['Telegram', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.2 1.4 11.7c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>'],
    max: ['Max', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5l8 9 8-9v14"/></svg>'],
    whatsapp: ['WhatsApp', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>']
  };

  /* ---------- helpers ---------- */
  var uid = 0;
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  function nl(h) { return h.replace(/\n/g, '<br>'); }
  function t(s) { return nl(esc(plain(s))); }
  function attr(s) { return esc(plain(s)); }
  function paras(s) {
    return String(s || '').split(/\n\s*\n/).map(function (p) { p = p.trim(); return p ? '<p>' + t(p) + '</p>' : ''; }).join('');
  }
  function src(p) {
    p = String(p || '');
    if (!p) return '';
    if (/^(https?:|data:|blob:|\/\/|\/)/i.test(p)) return esc(p);
    return esc(ROOT + p.replace(/^\.\//, ''));
  }
  /* Медиа: видео с автозапуском (app.js autoVideos), без видео — картинка */
  function mv(video, poster, alt) {
    if (video) return '<video muted loop playsinline preload="metadata" data-autoplay' + (poster ? ' poster="' + src(poster) + '"' : '') + ' src="' + src(video) + '"' + (alt ? ' aria-label="' + attr(alt) + '"' : '') + '></video>';
    return poster ? '<img src="' + src(poster) + '" alt="' + attr(alt || '') + '" loading="lazy">' : '';
  }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }
  function ico(name, cls) {
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.doc) + '</svg>';
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function vis(x) { return x && x.visible !== false; }
  function isOn(c, id) { return arr(c.blocks).some(function (b) { return b.id === id && b.visible; }); }
  function norm(s) { return s.toLowerCase().replace(/ё/g, 'е'); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(n) { return Number(n || 0).toLocaleString('ru-RU'); }
  function beforeColon(s) { var p = plain(s); var i = p.indexOf(':'); return i > 0 ? p.slice(0, i) : p; }
  function afterColon(s) { var p = plain(s); var i = p.indexOf(':'); return i > 0 ? p.slice(i + 1).trim() : ''; }

  /* Заголовок с выделением: ищем подстроку ACCENT[id] без учёта регистра и ё/е */
  function acc(id, s, breakBefore) {
    var p = plain(s), a = ACCENT[id];
    if (!a) return nl(esc(p));
    var i = norm(p).indexOf(norm(a));
    if (i < 0) return nl(esc(p));
    var before = p.slice(0, i), mid = p.slice(i, i + a.length), after = p.slice(i + a.length);
    var br = breakBefore && !after.trim() && before.trim() ? '<br>' : '';
    return nl(esc(before)) + br + '<em class="acc">' + esc(mid) + '</em>' + nl(esc(after));
  }

  function ask(cls, label, o) {
    o = o || {};
    return '<button type="button" class="' + cls + '" data-ask' +
      (o.title ? ' data-ask-title="' + attr(o.title) + '"' : '') +
      (o.sub ? ' data-ask-sub="' + attr(o.sub) + '"' : '') +
      (o.product ? ' data-ask-product="' + attr(o.product) + '"' : '') +
      (o.type ? ' data-ask-type="' + esc(o.type) + '"' : '') + (o.extra || '') + '>' +
      '<span>' + t(label) + '</span>' + (o.icon ? ico(o.icon) : '') + '</button>';
  }

  function head(id, x, right, cls) {
    return '<div class="head' + (cls ? ' ' + cls : '') + ' rv"><div class="head-txt">' +
      (x.eyebrow ? '<span class="eyebrow">' + t(x.eyebrow) + '</span>' : '') +
      '<h2>' + acc(id, x.title) + '</h2>' +
      (x.sub ? '<p class="sub">' + t(x.sub) + '</p>' : '') + '</div>' +
      (right ? '<div class="head-right">' + right + '</div>' : '') + '</div>';
  }

  function sec(id, inner, cls) {
    return '<section class="sec ' + (THEME[id] || 'light') + (cls ? ' ' + cls : '') + '" id="' + esc(id) + '">' + inner + '</section>';
  }

  function msgs(c, cls) {
    var s = c.settings || {};
    return ['telegram', 'max', 'whatsapp'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a class="msg' + (cls ? ' ' + cls : '') + '" href="' + attr(s[k]) + '" target="_blank" rel="noopener" aria-label="' + MSG[k][0] + '" title="' + MSG[k][0] + '">' + MSG[k][1] + '</a>';
    }).join('');
  }
  function msgWords(c) {
    var s = c.settings || {};
    var list = ['telegram', 'max', 'whatsapp'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a href="' + attr(s[k]) + '" target="_blank" rel="noopener">' + MSG[k][0] + '</a>';
    });
    if (!list.length) return '';
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(', ') + ' или ' + list[list.length - 1];
  }
  function menuLinks(c) {
    return arr(c.blocks).filter(function (b) { return b.visible && b.menu; }).map(function (b) {
      return '<a href="#' + esc(b.id) + '">' + esc(plain(b.menu)) + '</a>';
    }).join('');
  }
  function typeOptions(c) {
    return arr(c.screens && c.screens.items).filter(vis).map(function (s) {
      return '<option value="' + esc(s.id) + '">' + esc(plain(s.shortName || s.name)) + '</option>';
    }).join('') + '<option value="other">' + esc(plain((c.settings || {}).formOther || 'Не знаю, нужна консультация')) + '</option>';
  }
  function consent(c, dark) {
    return '<label class="consent' + (dark ? ' dk' : '') + '"><input type="checkbox" checked required> <span>Соглашаюсь с <a href="' + attr((c.settings || {}).policyUrl || '#') + '">политикой обработки персональных данных</a></span></label>';
  }

  /* Текст по окружности: бейджи «смотреть объекты» и печать «Москва и Московская область» */
  function ring(text, r, cls) {
    var id = 'ring' + (++uid);
    var d = 'M100,100 m-' + r + ',0 a' + r + ',' + r + ' 0 1,1 ' + (2 * r) + ',0 a' + r + ',' + r + ' 0 1,1 -' + (2 * r) + ',0';
    return '<svg class="ring ' + (cls || '') + '" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="' + id + '" d="' + d + '"/></defs>' +
      '<text><textPath href="#' + id + '" textLength="' + Math.floor(2 * Math.PI * r - 2) + '" lengthAdjust="spacing">' + esc(text) + '</textPath></text></svg>';
  }

  var R = {};

  /* ---------- header / drawer ---------- */
  R.header = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<header class="hdr" id="hdr"><div class="wrap hdr-in">' +
      '<a class="logo" href="#top" aria-label="' + attr(s.brandName) + '"><span class="logo-mark">' + esc(plain(s.brandMark)) + '</span>' +
      '<span class="logo-txt"><b>' + esc(plain(s.brandName)) + '</b>' + (s.brandTagline ? '<small>' + t(s.brandTagline) + '</small>' : '') + '</span></a>' +
      '<nav class="hdr-nav" aria-label="Разделы">' + menuLinks(c) + '</nav>' +
      '<div class="hdr-right">' +
      (s.phone ? '<a class="hdr-phone" href="' + tel(s.phone) + '"><span>' + esc(s.phone) + '</span>' + (s.phoneNote ? '<small>' + t(s.phoneNote) + '</small>' : '') + '</a>' +
        '<a class="msg hdr-call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + ico('phone') + '</a>' : '') +
      '<div class="hdr-msgs">' + msgs(c) + '</div>' +
      ask('btn btn-fill btn-sm hdr-cta', s.headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub }) +
      '<button class="burger" type="button" data-menu-open aria-label="Открыть меню"><i></i><i></i><i></i></button>' +
      '</div></div></header>';
  };

  R.drawer = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="drawer" data-drawer aria-hidden="true"><div class="drawer-panel">' +
      '<button class="drawer-x" type="button" data-menu-close aria-label="Закрыть меню">' + ico('close') + '</button>' +
      '<nav class="drawer-nav">' + menuLinks(c) + '</nav>' +
      (s.phone ? '<a class="drawer-phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.phoneNote ? '<div class="drawer-note">' + t(s.phoneNote) + '</div>' : '') +
      '<div class="drawer-msgs">' + msgs(c) + '</div>' +
      ask('btn btn-fill btn-block', s.headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub }) +
      '</div></div>';
  };

  /* ---------- hero + marquee ---------- */
  function marquee(c) {
    var h = c.hero || {};
    var seen = {};
    function uniq(list) {
      return list.map(function (x) { return plain(x).trim(); }).filter(function (x) {
        var k = norm(x); if (!x || seen[k]) return false; seen[k] = 1; return true;
      });
    }
    var r1 = uniq(arr(h.facts).map(function (f) { return f.title; }).concat(plain(h.badge).split(',')));
    var r2 = uniq(arr(c.included && c.included.items).map(function (i) { return i.title; }));
    if (!r1.length && !r2.length) return '';
    if (!r2.length) r2 = r1.slice().reverse();
    if (!r1.length) r1 = r2.slice().reverse();
    function row(list, shift, rev) {
      var seq = list.slice();
      while (seq.length < 8) seq = seq.concat(list);
      var html = seq.map(function (p, i) {
        return '<span class="mq-item ' + ((i + shift) % 2 ? 'o' : 'w') + '">' + esc(p) + '</span><i class="mq-sep" aria-hidden="true"></i>';
      }).join('');
      return '<div class="mq-row' + (rev ? ' mq-back' : '') + '"><div class="mq-track"><div class="mq-seq">' + html + '</div><div class="mq-seq" aria-hidden="true">' + html + '</div></div></div>';
    }
    return '<div class="marquee" aria-label="Коротко о нас">' + row(r1, 0, false) + row(r2, 1, true) + '</div>';
  }

  R.hero = function (c) {
    var h = c.hero || {}, s = c.settings || {};
    var heroCase = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && i.video && i.video === h.video; })[0];
    var media = h.video
      ? '<video class="hero-video" autoplay muted loop playsinline preload="auto"' + (h.poster ? ' poster="' + src(h.poster) + '"' : '') + ' src="' + src(h.video) + '"></video>'
      : (h.poster ? '<img class="hero-video" src="' + src(h.poster) + '" alt="">' : '');
    var b2 = isOn(c, 'calc') && h.button1 ? '<a class="btn btn-ghost-w" href="#calc"><span>' + t(h.button1) + '</span></a>' : '';
    var region = plain(h.badge).split(',')[0].trim();
    var badgeTxt = plain(h.button2 || 'Смотреть объекты').toUpperCase();
    return '<section class="hero" id="top"><div class="hero-glow" aria-hidden="true"></div><div class="wrap hero-grid">' +
      '<div class="hero-txt rv">' +
      (s.brandTagline ? '<span class="kicker"><i></i>' + t(s.brandTagline) + '</span>' : '') +
      '<h1>' + acc('hero', h.h1, true) + '</h1>' +
      (h.lead ? '<p class="lead">' + t(h.lead) + '</p>' : '') +
      '<div class="hero-cta">' + ask('btn btn-fill btn-lg', h.formButton || s.headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub, icon: 'arrowR' }) + b2 + '</div>' +
      (h.note ? '<div class="hero-note"><div class="hero-msgs">' + msgs(c) + '</div><span>' + t(h.note) + '</span></div>' : '') +
      '</div>' +
      '<div class="hero-media rv">' +
      '<div class="screen">' + media +
      (heroCase ? '<span class="live"><i></i>' + t(heroCase.title) + '</span>' : '') + '</div>' +
      (isOn(c, 'cases') ? '<a class="spin" href="#cases" aria-label="' + attr(h.button2 || 'Смотреть объекты') + '">' + ring(badgeTxt + ' • ' + badgeTxt + ' • ', 76, 'spin-ring') + '<span class="spin-core">' + ico('arrowD') + '</span></a>' : '') +
      (region ? '<div class="seal" aria-hidden="true">' + ring(region.toUpperCase() + ' • ', 74, 'seal-ring') + '<span class="seal-core">' + ico('pin') + '</span></div>' : '') +
      '</div></div>' + marquee(c) + '</section>';
  };

  /* ---------- trust ---------- */
  R.trust = function (c) {
    var x = c.trust || {}, h = c.hero || {};
    var items = arr(x.items);
    var posters = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && i.poster; });
    var photo = posters[1] || posters[0];
    var tiles = items.map(function (i, n) {
      var tile = '<div class="stat"><b>' + t(i.value) + '</b><span>' + t(i.label) + '</span></div>';
      if (n === 1 && photo) tile += '<div class="stat-photo">' + mv(photo.video, photo.poster, photo.title) + '<span class="stat-chip">' + t(photo.type || photo.title) + '</span></div>';
      return tile;
    }).join('');
    var facts = arr(h.facts).map(function (f) {
      return '<li><span class="tick">' + ico('tick') + '</span><div><b>' + t(f.title) + '</b>' + (f.text ? '<span>' + t(f.text) + '</span>' : '') + '</div></li>';
    }).join('');
    if (!tiles && !facts) return '';
    return sec('trust', '<div class="wrap trust-grid">' +
      (tiles ? '<div class="stats rv">' + tiles + '</div>' : '') +
      '<div class="trust-txt rv">' + (h.badge ? '<h2>' + acc('trust', h.badge) + '</h2>' : '') +
      (facts ? '<ul class="checks">' + facts + '</ul>' : '') +
      ask('btn btn-line', (c.settings || {}).headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub }) +
      '</div></div>');
  };

  /* ---------- screens ---------- */
  R.screens = function (c) {
    var x = c.screens || {}, casesOn = isOn(c, 'cases');
    var used = {};
    arr(c.cases && c.cases.items).filter(vis).forEach(function (i) { arr(i.filters).forEach(function (f) { used[f] = 1; }); });
    var cards = arr(x.items).filter(vis).map(function (s) {
      var specs = arr(s.specs).map(function (p) { return '<li><span>' + t(p.k) + '</span><b>' + t(p.v) + '</b></li>'; }).join('');
      var ex = casesOn && s.caseFilter && used[s.caseFilter]
        ? '<a class="btn btn-line btn-sm" href="#cases" data-case-filter="' + esc(s.caseFilter) + '"><span>Примеры</span></a>' : '';
      return '<article class="prod rv"><div class="prod-img">' +
        mv(s.video, s.image, s.name) +
        (s.px ? '<span class="prod-chip">' + t(s.px) + '</span>' : '') + '</div>' +
        '<div class="prod-body"><h3>' + t(s.name) + '</h3><p class="prod-desc">' + t(s.desc) + '</p>' +
        (specs ? '<ul class="prod-specs">' + specs + '</ul>' : '') +
        '<div class="prod-act">' + ask('btn btn-fill btn-sm', 'Рассчитать', { title: 'Расчёт: ' + plain(s.name), sub: 'Укажите размеры и место установки, пришлём конфигурацию и смету', product: s.name, type: s.id }) + ex + '</div>' +
        '</div></article>';
    }).join('');
    if (!cards) return '';
    var help = x.helpButton ? ask('btn btn-line', x.helpButton, { title: 'Помочь с выбором экрана', sub: 'Расскажите, где будет экран и что на нём показывать: подберём тип и шаг пикселя' }) : '';
    return sec('screens', '<div class="wrap">' + head('screens', x, help) + '<div class="prod-grid">' + cards + '</div></div>');
  };

  /* ---------- cases: карусель ---------- */
  R.cases = function (c) {
    var x = c.cases || {}, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var used = {};
    items.forEach(function (i) { arr(i.filters).forEach(function (f) { used[f] = 1; }); });
    var filters = arr(x.filters).filter(function (f) { return used[f.id]; });
    var tabs = filters.length ? '<div class="pills rv" role="tablist"><button type="button" class="pill on" data-cz-filter="all">' + t(x.allLabel || 'Все объекты') + '</button>' +
      filters.map(function (f) { return '<button type="button" class="pill" data-cz-filter="' + esc(f.id) + '">' + t(f.label) + '</button>'; }).join('') + '</div>' : '';
    var tiles = items.map(function (i, n) {
      var facts = arr(i.facts).map(function (f) { return '<div><dt>' + t(f.k) + ':</dt><dd>' + t(f.v) + '</dd></div>'; }).join('');
      var media = i.video
        ? '<video muted loop playsinline preload="none"' + (i.poster ? ' poster="' + src(i.poster) + '"' : '') + ' data-src="' + src(i.video) + '"></video>'
        : (i.poster ? '<img src="' + src(i.poster) + '" alt="" loading="lazy">' : '');
      return '<article class="cz-tile" data-f="' + esc(arr(i.filters).join(' ')) + '" data-i="' + n + '" tabindex="0" role="button" aria-label="Смотреть видео: ' + attr(i.title) + '">' +
        media + '<span class="cz-shade" aria-hidden="true"></span>' +
        (i.video ? '<span class="cz-play" aria-hidden="true">' + PLAY + '</span>' : '') +
        '<div class="cz-info">' + (i.type ? '<span class="cz-type">' + t(i.type) + '</span>' : '') +
        '<h3>' + t(i.title) + '</h3>' + (i.desc ? '<p class="cz-desc">' + t(i.desc) + '</p>' : '') +
        (facts ? '<dl class="cz-facts">' + facts + '</dl>' : '') + '</div></article>';
    }).join('');
    var h = c.hero || {};
    var want = '<div class="want rv"><p>Хотите <em class="acc">такой же</em> экран? Покажем, как он будет смотреться на вашем фасаде</p>' +
      ask('btn btn-line btn-xl', 'Покажите', { title: 'Покажем экран на вашем фасаде', sub: 'Пришлите фото места установки: подберём тип экрана и покажем, как он будет выглядеть', product: '' }) + '</div>';
    return sec('cases', '<div class="wrap">' + head('cases', x) + tabs +
      '<div class="cz rv" data-cz><div class="cz-track" data-cz-track tabindex="-1"></div></div>' +
      '<div class="cz-bar"><div class="cz-prog" data-cz-prog></div><span class="cz-count" data-cz-count></span>' +
      '<div class="arrows"><button type="button" class="arr" data-cz-prev aria-label="Предыдущие объекты">' + ico('arrowL') + '</button>' +
      '<button type="button" class="arr" data-cz-next aria-label="Следующие объекты">' + ico('arrowR') + '</button></div></div>' +
      '<div class="cz-store" data-cz-store hidden>' + tiles + '</div>' + want + '</div>');
  };

  /* ---------- included: бенто ---------- */
  R.included = function (c) {
    var x = c.included || {}, items = arr(x.items);
    if (!items.length) return '';
    var gi = -1;
    items.forEach(function (i, n) { if (gi < 0 && (i.icon === 'shield' || /гарант/i.test(plain(i.title)))) gi = n; });
    var g = gi >= 0 ? items[gi] : null;
    var rest = items.filter(function (i, n) { return n !== gi; });
    var main = rest.slice(0, 4), small = rest.slice(4);
    var big = main.map(function (i, n) {
      return '<div class="inc-card rv"><span class="inc-n">' + pad2(n + 1) + '</span><h3>' + t(i.title) + '</h3><hr><p>' + t(i.text) + '</p><span class="inc-ico">' + ico(i.icon) + '</span></div>';
    }).join('');
    var gHtml = '';
    if (g) {
      var m = /\[\[([^\]]+)\]\]/.exec(String(g.text || '')) || /(\d+\s*(?:год|года|лет|мес)[а-я]*)/i.exec(plain(g.text));
      var num = m ? m[1].trim() : '';
      var parts = /^(\S+)\s*(.*)$/.exec(num) || ['', '', ''];
      gHtml = '<div class="inc-guar rv"><span class="inc-ico w">' + ico(g.icon || 'shield') + '</span>' +
        (num ? '<div class="guar-num"><b>' + esc(parts[1]) + '</b><span>' + esc(parts[2]) + '</span></div>' : '') +
        '<h3>' + t(g.title) + '</h3><p>' + t(g.text) + '</p></div>';
    }
    var img = arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && (s.video || s.image); })[0];
    var photo = img ? '<div class="inc-photo rv">' + mv(img.video, img.image, img.name) +
      (x.sub ? '<div class="inc-photo-cap">' + (x.eyebrow ? '<span>' + t(x.eyebrow) + '</span>' : '') + '<p>' + t(x.sub) + '</p></div>' : '') + '</div>' : '';
    var list = small.length ? '<div class="inc-list rv">' + small.map(function (i) {
      return '<div class="inc-li"><span class="inc-ico s">' + ico(i.icon) + '</span><div><h4>' + t(i.title) + '</h4><p>' + t(i.text) + '</p></div></div>';
    }).join('') + '</div>' : '';
    var hx = { eyebrow: x.eyebrow, title: x.title, sub: photo ? '' : x.sub };
    return sec('included', '<div class="wrap">' + head('included', hx) +
      '<div class="inc-grid' + (photo ? '' : ' no-photo') + (list ? '' : ' no-list') + '">' + big + gHtml + photo + list + '</div></div>');
  };

  /* ---------- process ---------- */
  R.process = function (c) {
    var x = c.process || {}, h = c.hero || {}, s = c.settings || {};
    var items = arr(x.items).map(function (i, n) {
      return '<li class="step rv"><span class="step-n">' + pad2(n + 1) + '</span><div class="step-body"><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></div>' +
        (i.term ? '<span class="term">' + ico('clock') + t(i.term) + '</span>' : '') + '</li>';
    }).join('');
    if (!items) return '';
    return sec('process', '<div class="wrap proc-grid"><div class="proc-side"><div class="proc-sticky">' +
      head('process', x) + '<div class="proc-cta rv">' + ask('btn btn-fill', s.headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub }) + '</div>' +
      '</div></div><ol class="steps">' + items + '</ol></div>');
  };

  /* ---------- calc ---------- */
  R.calc = function (c) {
    var x = c.calc || {};
    var types = arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && Number(s.rate) > 0; });
    var def = types.some(function (s) { return s.id === x.defaultType; }) ? x.defaultType : (types[0] && types[0].id);
    var radios = types.map(function (s) {
      var nm = s.shortName || s.name;
      return '<label class="tchip"><input type="radio" name="calctype" value="' + esc(s.id) + '" data-rate="' + Number(s.rate) + '" data-px="' + attr(s.px) + '" data-name="' + attr(nm) + '"' + (s.id === def ? ' checked' : '') + '>' +
        '<span><b>' + esc(beforeColon(nm)) + '</b>' + (afterColon(nm) ? '<small>' + esc(afterColon(nm)) + '</small>' : '') + '</span></label>';
    }).join('');
    var rates = types.map(function (s) {
      return '<button type="button" class="rate rv" data-pick-type="' + esc(s.id) + '">' +
        (s.video || s.image ? '<span class="rate-img">' + mv(s.video, s.image, '') + '</span>' : '') +
        '<span class="rate-body"><span class="rate-name">' + t(s.name) + '</span>' +
        '<span class="rate-price">Стоимость от <em>' + fmt(s.rate) + '</em> ₽ за м²</span>' +
        (s.px ? '<span class="rate-px">Шаг ' + t(s.px) + '</span>' : '') + '</span></button>';
    }).join('');
    var w = Number(x.defaultWidth) || 6, hgt = Number(x.defaultHeight) || 3;
    function num(name, label, val) {
      return '<label class="fld"><span>' + label + '</span><div class="stepper"><button type="button" data-step="' + name + ':-0.5" aria-label="Уменьшить">' + ico('minus') + '</button>' +
        '<input type="number" name="' + name + '" min="0.5" step="0.1" inputmode="decimal" value="' + val + '"><button type="button" data-step="' + name + ':0.5" aria-label="Увеличить">' + ico('plus') + '</button></div></label>';
    }
    var form = types.length
      ? '<form class="calc-form rv" data-calc data-mount-share="' + Number(x.mountShare || 0) + '" novalidate>' +
        (x.formTitle ? '<h3>' + t(x.formTitle) + '</h3>' : '') + (x.formSub ? '<p class="calc-sub">' + t(x.formSub) + '</p>' : '') +
        '<div class="fld-l">Тип экрана</div><div class="tchips">' + radios + '</div>' +
        '<div class="row2">' + num('w', 'Ширина, м', w) + num('h', 'Высота, м', hgt) + '</div>' +
        '<label class="switch"><input type="checkbox" name="mount" checked><i></i><span>' + t(x.mountLabel || 'Включить монтаж') + '</span></label>' +
        '</form>'
      : '<div class="calc-form rv"><p class="calc-sub">Ставки за м² не заданы: укажите их в типах экранов.</p></div>';
    var out = '<div class="calc-out rv"><span class="calc-lbl">Ориентировочная стоимость</span>' +
      '<div class="calc-price" data-out="price">—</div>' +
      '<div class="calc-rows"><div><span>Тип экрана</span><b data-out="type">—</b></div><div><span>Площадь</span><b data-out="area">—</b></div>' +
      '<div><span>Рекомендуемый шаг пикселя</span><b data-out="px">—</b></div><div><span>Монтаж и конструкция</span><b data-out="mount">—</b></div></div>' +
      (x.excludes ? '<p class="calc-note">' + t(x.excludes) + '</p>' : '') +
      ask('btn btn-fill btn-lg btn-block', x.button || 'Получить точную смету', { title: x.button || 'Получить точную смету', sub: 'Пришлём спецификацию и смету с монтажом в течение рабочего дня', product: 'Экран по калькулятору', extra: ' data-calc-ask' }) +
      '</div>';
    return sec('calc', '<div class="wrap">' + head('calc', x) + '<div class="calc-grid">' + form + out + '</div>' +
      (rates ? '<div class="rates-h rv">Ставка за м² по типам экранов</div><div class="rates">' + rates + '</div>' : '') + '</div>');
  };

  /* ---------- specs ---------- */
  R.specs = function (c) {
    var x = c.specs || {};
    var cols = ['Шаг пикселя', 'Расстояние просмотра', 'Где применяется', 'Тип экрана', 'Яркость'];
    var rows = arr(x.rows).map(function (r) {
      return '<tr><td data-l="' + cols[0] + '"><b class="px">' + t(r.px) + '</b></td><td data-l="' + cols[1] + '"><span class="dist">' + t(r.dist) + '</span></td><td data-l="' + cols[2] + '">' + t(r.where) + '</td><td data-l="' + cols[3] + '">' + t(r.type) + '</td><td data-l="' + cols[4] + '">' + t(r.bright) + '</td></tr>';
    }).join('');
    if (!rows) return '';
    return sec('specs', '<div class="wrap">' + head('specs', x) +
      '<div class="spec-wrap rv"><table class="spec-tbl"><thead><tr>' + cols.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>');
  };

  /* ---------- about ---------- */
  R.about = function (c) {
    var x = c.about || {}, tr = arr(c.trust && c.trust.items)[0];
    var docs = arr(x.docs).map(function (d) { return '<li><span class="inc-ico s">' + ico(d.icon) + '</span><span>' + t(d.text) + '</span></li>'; }).join('');
    return sec('about', '<div class="wrap about-grid">' +
      (x.video || x.image ? '<div class="about-photo rv">' + mv(x.video, x.image, x.title) +
        (tr ? '<div class="about-stat"><b>' + t(tr.value) + '</b><span>' + t(tr.label) + '</span></div>' : '') + '</div>' : '') +
      '<div class="about-txt rv">' + (x.eyebrow ? '<span class="eyebrow">' + t(x.eyebrow) + '</span>' : '') +
      '<h2>' + acc('about', x.title) + '</h2><div class="about-p">' + paras(x.text) + '</div>' +
      (docs ? '<ul class="docs">' + docs + '</ul>' : '') + '</div></div>');
  };

  /* ---------- reviews ---------- */
  R.reviews = function (c) {
    var x = c.reviews || {}, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var cards = items.map(function (r) {
      var n = Math.max(0, Math.min(5, Number(r.stars) || 0));
      var letter = plain(r.name).trim().charAt(0).toUpperCase() || '•';
      var stars = '';
      for (var k = 0; k < n; k++) stars += '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS.star + '</svg>';
      return '<article class="rev"><div class="rev-top">' + (n ? '<div class="stars" aria-label="Оценка ' + n + ' из 5">' + stars + '</div>' : '') +
        '<span class="rev-q" aria-hidden="true">“</span></div><p>' + t(r.text) + '</p>' +
        '<div class="rev-who"><span class="ava">' + esc(letter) + '</span><div><b>' + t(r.name) + '</b><span>' + t(r.object) + '</span></div></div></article>';
    }).join('');
    var arrows = '<div class="arrows"><button type="button" class="arr" data-rv-prev aria-label="Предыдущий отзыв">' + ico('arrowL') + '</button><button type="button" class="arr" data-rv-next aria-label="Следующий отзыв">' + ico('arrowR') + '</button></div>';
    return sec('reviews', '<div class="wrap">' + head('reviews', x, arrows) + '<div class="rev-track rv" data-rv-track>' + cards + '</div></div>');
  };

  /* ---------- cta: оранжевая секция с формой ---------- */
  R.cta = function (c) {
    var x = c.cta || {}, s = c.settings || {};
    var words = msgWords(c);
    return sec('cta', '<div class="wrap"><div class="cta-card rv">' +
      '<h2>' + acc('cta', x.title) + '</h2>' + (x.text ? '<p class="sub">' + t(x.text) + '</p>' : '') +
      '<form class="cta-form" data-done="' + attr(s.formDone) + '">' +
      '<div class="row3"><label class="fld"><span>Ваше имя</span><input type="text" name="name" placeholder="Имя" autocomplete="name"></label>' +
      '<label class="fld"><span>Телефон *</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label>' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label></div>' +
      '<label class="fld"><span>Кратко о задаче</span><textarea name="msg" placeholder="Где будет экран, примерные размеры, что показывать, сроки"></textarea></label>' +
      '<label class="upload">' + ico('clip') + '<span data-file-label>Прикрепить фото места установки или чертёж</span><input type="file" accept="image/*,.pdf,.dwg" hidden></label>' +
      '<div class="cta-bottom">' + consent(c) +
      '<button class="btn btn-line btn-xl" type="submit"><span>' + t(x.button || 'Отправить') + '</span></button>' +
      '<div class="cta-alt">' + (words ? 'Не хотите заполнять форму?<br>Пишите в ' + words : '') +
      (x.showPhone && s.phone ? (words ? '<br>или звоните ' : 'Звоните ') + '<a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + '</div>' +
      '</div></form></div></div>');
  };

  /* ---------- faq ---------- */
  R.faq = function (c) {
    var x = c.faq || {}, s = c.settings || {}, h = c.hero || {};
    var items = arr(x.items).map(function (q) {
      return '<details class="qa"' + (q.open ? ' open' : '') + '><summary><span>' + t(q.q) + '</span><i class="qa-pm" aria-hidden="true"></i></summary><div class="qa-a">' + paras(q.a) + '</div></details>';
    }).join('');
    if (!items) return '';
    var helper = '<div class="faq-help rv"><b>Не нашли ответ?</b><span>' + t(s.contactName) + (s.contactRole ? ', ' + t(s.contactRole).toLowerCase() : '') + '</span>' +
      (s.phone ? '<a class="faq-phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      '<div class="faq-help-row">' + ask('btn btn-fill btn-sm', s.headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub }) + '<div class="faq-msgs">' + msgs(c, 'dk') + '</div></div></div>';
    return sec('faq', '<div class="wrap faq-grid"><div class="faq-side">' + head('faq', x) + helper + '</div><div class="faq-list rv">' + items + '</div></div>');
  };

  /* ---------- contacts ---------- */
  R.contacts = function (c) {
    var x = c.contacts || {}, s = c.settings || {};
    var info = '<ul class="cinfo">' +
      (s.email ? '<li>' + ico('mail') + '<div><a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' + (s.emailNote ? '<small>' + t(s.emailNote) + '</small>' : '') + '</div></li>' : '') +
      (s.address ? '<li>' + ico('pin') + '<div><span>' + t(s.address) + '</span>' + (s.addressNote ? '<small>' + t(s.addressNote) + '</small>' : '') + '</div></li>' : '') +
      (s.hours ? '<li>' + ico('clock') + '<div><span>' + t(s.hours) + '</span></div></li>' : '') + '</ul>';
    var initials = plain(s.contactName).split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    return sec('contacts', '<div class="wrap">' + head('contacts', x) + '<div class="ct-grid">' +
      '<div class="ct-info rv">' +
      (s.phone ? '<a class="ct-phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.contactName ? '<div class="ct-person"><span class="ava">' + esc(initials) + '</span><div><b>' + t(s.contactName) + '</b><span>' + t(s.contactRole) + '</span></div></div>' : '') +
      info + '<div class="ct-msgs">' + msgs(c) + '</div>' +
      (x.mapNote ? '<div class="ct-map">' + ico('pin') + '<span>' + t(x.mapNote) + '</span></div>' : '') + '</div>' +
      '<form class="ct-form rv" data-done="' + attr(s.formDone) + '">' +
      (x.formTitle ? '<h3>' + t(x.formTitle) + '</h3>' : '') + (x.formSub ? '<p class="calc-sub">' + t(x.formSub) + '</p>' : '') +
      '<div class="row2"><label class="fld"><span>Имя</span><input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name"></label>' +
      '<label class="fld"><span>Телефон *</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label></div>' +
      '<label class="fld"><span>Email</span><input type="email" name="email" placeholder="Для отправки спецификации" autocomplete="email"></label>' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<label class="fld"><span>Задача</span><textarea name="msg" placeholder="Где будет экран, примерные размеры, что показывать, сроки"></textarea></label>' +
      '<button class="btn btn-fill btn-lg btn-block" type="submit"><span>' + t(x.formButton || 'Отправить заявку') + '</span></button>' +
      consent(c, true) + '</form></div></div>');
  };

  /* ---------- footer ---------- */
  R.footer = function (c) {
    var x = c.footer || {}, s = c.settings || {};
    return '<footer class="ftr"><div class="wrap"><div class="ftr-grid">' +
      '<div class="ftr-brand"><a class="logo" href="#top"><span class="logo-mark">' + esc(plain(s.brandMark)) + '</span><span class="logo-txt"><b>' + esc(plain(s.brandName)) + '</b>' + (s.brandTagline ? '<small>' + t(s.brandTagline) + '</small>' : '') + '</span></a>' +
      (x.about ? '<p>' + t(x.about) + '</p>' : '') + '</div>' +
      '<nav class="ftr-nav"><span class="ftr-h">Разделы</span>' + menuLinks(c) + '</nav>' +
      '<div class="ftr-ct">' + (s.phone ? '<a class="ftr-phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.address ? '<span class="ftr-muted">' + t(s.address) + '</span>' : '') +
      (s.hours ? '<span>Режим работы: ' + t(s.hours) + '</span>' : '') +
      (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') +
      '<div class="ftr-msgs">' + msgs(c) + '</div></div></div>' +
      '<div class="ftr-bottom"><span>© ' + new Date().getFullYear() + ' ' + t(s.companyName) + (x.legal ? '. ' + t(x.legal) : '') + '</span>' +
      (x.note ? '<span>' + t(x.note) + '</span>' : '') +
      '<a href="' + attr(s.policyUrl || '#') + '">Политика обработки персональных данных</a></div></div></footer>';
  };

  /* ---------- служебные слои ---------- */
  R.sticky = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="mbar" data-mbar>' + (s.phone ? '<a class="btn btn-ghost-w btn-sm" href="' + tel(s.phone) + '">' + ico('phone') + '<span>Позвонить</span></a>' : '') +
      ask('btn btn-fill btn-sm', s.headerButton || 'Получить расчёт', { title: h.formTitle, sub: h.formSub }) + '</div>';
  };

  R.modal = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="modal" data-modal role="dialog" aria-modal="true" aria-labelledby="mdl-title" aria-hidden="true"><div class="modal-box">' +
      '<button class="modal-x" type="button" data-close aria-label="Закрыть">' + ico('close') + '</button>' +
      '<h3 id="mdl-title" data-def="' + attr(h.formTitle || 'Получить расчёт экрана') + '">' + t(h.formTitle || 'Получить расчёт экрана') + '</h3>' +
      '<p class="modal-sub" data-def="' + attr(h.formSub || '') + '">' + t(h.formSub || '') + '</p>' +
      '<div class="modal-prod" hidden>Задача: <b></b></div>' +
      '<form class="modal-form" data-done="' + attr(s.formDone) + '">' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<div class="row2"><label class="fld"><span>Ширина, м</span><input type="text" name="w" inputmode="decimal" placeholder="6"></label>' +
      '<label class="fld"><span>Высота, м</span><input type="text" name="h" inputmode="decimal" placeholder="3"></label></div>' +
      '<div class="row2"><label class="fld"><span>Имя</span><input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name"></label>' +
      '<label class="fld"><span>Телефон *</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label></div>' +
      '<button class="btn btn-fill btn-lg btn-block" type="submit"><span>' + t(h.formButton || 'Получить расчёт') + '</span></button>' +
      consent(c) + '</form>' +
      '<div class="modal-done" hidden><span class="done-ico">' + ico('tick') + '</span><b>' + t(s.formDone || 'Заявка принята') + '</b>' +
      (msgWords(c) ? '<p>Если удобнее, напишите в ' + msgWords(c) + '</p>' : '') + '</div>' +
      '</div></div>';
  };

  R.lightbox = function () {
    return '<div class="lb" data-lb role="dialog" aria-modal="true" aria-label="Видео объекта" aria-hidden="true"><div class="lb-box">' +
      '<button class="modal-x lb-x" type="button" data-close aria-label="Закрыть">' + ico('close') + '</button>' +
      '<div class="lb-media"><video controls playsinline></video></div>' +
      '<div class="lb-info"><div><span class="cz-type" data-lb-type></span><h3 data-lb-title></h3><p data-lb-desc></p></div>' +
      ask('btn btn-fill', 'Хочу такой же экран', { title: 'Хочу такой же экран', sub: 'Подберём конфигурацию под ваш объект и пришлём смету в течение рабочего дня', extra: ' data-lb-ask' }) + '</div>' +
      '</div></div>';
  };

  R.variant = function () {
    return '<div class="vpill" data-vpill><button type="button" class="vpill-dot" data-vpill-toggle aria-label="Показать название варианта">V2</button>' +
      '<a class="vpill-link" href="../">Вариант 2 · Контраст · <u>все варианты →</u></a></div>';
  };

  var ORDER_SECTIONS = { trust: 1, screens: 1, cases: 1, included: 1, process: 1, calc: 1, specs: 1, about: 1, reviews: 1, cta: 1, faq: 1, contacts: 1 };

  function render(c) {
    c.settings = c.settings || {};
    var html = R.header(c) + R.drawer(c) + '<main>' + R.hero(c);
    arr(c.blocks).forEach(function (b) {
      if (!b || !b.visible || !ORDER_SECTIONS[b.id] || !R[b.id] || !c[b.id]) return;
      html += R[b.id](c) || '';
    });
    html += '</main>' + R.footer(c) + R.sticky(c) + R.modal(c) + R.lightbox() + R.variant();
    var app = document.getElementById('app');
    app.innerHTML = html;
    if (c.meta) {
      if (c.meta.title) document.title = 'Вариант 2 · Контраст: ' + plain(c.meta.title);
      var md = document.querySelector('meta[name="description"]');
      if (md && c.meta.description) md.setAttribute('content', plain(c.meta.description));
    }
    if (window.V2App) window.V2App.init(c);
  }

  window.V2Render = { render: render, plain: plain };

  var app = document.getElementById('app');
  if (!app) return;
  fetch(ROOT + 'content/landing.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (c) {
      render(c);
      if (location.hash.length > 1) {
        var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) setTimeout(function () { el.scrollIntoView(); }, 60);
      }
    })
    .catch(function (e) {
      app.innerHTML = '<div class="wrap" style="padding:120px 24px"><h2>Не удалось загрузить контент</h2><p>' + esc(e.message) + '</p><p>Откройте страницу через веб-сервер (не file://).</p></div>';
    });
})();
