/* Вариант 1 · Светлый. Страница собирается из ../../content/landing.json (тот же файл правит админка).
   Порядок и видимость блоков из blocks, пункты меню из blocks[].menu.
   [[текст]] выводится как обычный текст, \n превращается в перенос строки. */
(function () {
  'use strict';

  var ROOT = '../../';
  var ICONS = {
    config: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    truck: '<path d="M3 7h12v10H3zM15 10h4l2 3v4h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    building: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-7 7a2.1 2.1 0 0 1-3-3l7-7a6 6 0 0 1 7.9-7.9z"/>',
    monitor: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
    check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/>',
    shield: '<path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7z"/><path d="m9 12 2 2 4-4"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    clip: '<path d="M21.4 11.1 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.1a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    quote: '<path d="M10 7H6a2 2 0 0 0-2 2v4h5v5H4M20 7h-4a2 2 0 0 0-2 2v4h5v5h-5" />'
  };
  var MSG = {
    whatsapp: ['WhatsApp', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'],
    telegram: ['Telegram', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.2 1.4 11.7c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>'],
    max: ['MAX', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5l8 9 8-9v14"/></svg>']
  };
  /* Видео для бенто-плиток «Что входит»: в JSON у пунктов нет медиа, берём ролики клиента */
  var BENTO_MEDIA = {
    config: { img: 'assets/video/case-showroom-transparent-wall.jpg', video: 'assets/video/case-showroom-transparent-wall.mp4' },
    wrench: { img: 'assets/video/case-pedestrian-bridge-night.jpg', video: 'assets/video/case-pedestrian-bridge-night.mp4' }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  /* неразрывный пробел после коротких слов: «с», «и», «на» не остаются в конце строки */
  function nb(s) { return s.replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2\u00a0').replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2\u00a0'); }
  function t(s) { return nb(esc(plain(s))).replace(/\n/g, '<br>'); }
  function attr(s) { return esc(plain(s)); }
  function paras(s) {
    return String(s || '').split(/\n\s*\n/).map(function (p) { p = p.trim(); return p ? '<p>' + t(p) + '</p>' : ''; }).join('');
  }
  function media(p) {
    p = String(p || '');
    if (!p) return '';
    if (/^(https?:)?\/\//i.test(p) || /^(data|blob):/i.test(p) || p.charAt(0) === '/') return esc(p);
    return esc(ROOT + p.replace(/^\.\//, ''));
  }
  /* Медиа: видео с автозапуском (app.js autoVideos), без видео — картинка */
  function mv(video, poster, alt) {
    if (video) return '<video muted loop playsinline preload="metadata" data-autoplay' + (poster ? ' poster="' + media(poster) + '"' : '') + ' src="' + media(video) + '"' + (alt ? ' aria-label="' + attr(alt) + '"' : '') + '></video>';
    return poster ? '<img src="' + media(poster) + '" alt="' + attr(alt || '') + '" loading="lazy">' : '';
  }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }
  function svg(name, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.doc) + '</svg>'; }
  function vis(x) { return x && x.visible !== false; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function isOn(c, id) { return arr(c.blocks).some(function (b) { return b.id === id && b.visible !== false; }); }
  function fmt(n) { return Number(n || 0).toLocaleString('ru-RU'); }

  /* Кнопка-пилюля: текст с прокруткой на hover и кружок со стрелкой */
  function btn(label, cls, href, extra, icon) {
    return '<a class="btn ' + (cls || '') + '" href="' + (href || '#') + '"' + (extra || '') + '>' +
      '<span class="btn__roll"><span>' + label + '</span><span aria-hidden="true">' + label + '</span></span>' +
      '<span class="btn__ic">' + svg(icon || 'arrow') + '</span></a>';
  }
  function ask(label, cls, o) {
    o = o || {};
    var a = ' data-ask' +
      (o.title ? ' data-ask-title="' + attr(o.title) + '"' : '') +
      (o.sub ? ' data-ask-sub="' + attr(o.sub) + '"' : '') +
      (o.product ? ' data-ask-product="' + attr(o.product) + '"' : '') +
      (o.type ? ' data-ask-type="' + esc(o.type) + '"' : '') + (o.extra || '');
    return btn(t(label), cls, '#', a, o.icon);
  }
  function messengers(c, cls) {
    var s = c.settings || {};
    return ['whatsapp', 'telegram', 'max'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a class="' + (cls || 'msg') + '" href="' + attr(s[k]) + '" target="_blank" rel="noopener">' + MSG[k][1] + '<span>' + MSG[k][0] + '</span></a>';
    }).join('');
  }
  function menuLinks(c, cls) {
    return arr(c.blocks).filter(function (b) { return b.visible !== false && b.menu; }).map(function (b) {
      return '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="#' + esc(b.id) + '">' + esc(b.menu) + '</a>';
    }).join('');
  }
  function typeOptions(c, selected) {
    return arr(c.screens && c.screens.items).filter(vis).map(function (s) {
      return '<option value="' + esc(s.id) + '"' + (s.id === selected ? ' selected' : '') + '>' + esc(plain(s.shortName || s.name)) + '</option>';
    }).join('') + '<option value="other">' + esc(plain((c.settings || {}).formOther || 'Не знаю, нужна консультация')) + '</option>';
  }
  function consent(c, text) {
    return '<label class="consent"><input type="checkbox" checked required><span>' + (text || 'Отправляя форму, соглашаюсь с') +
      ' <a href="' + attr((c.settings || {}).policyUrl || '#') + '">политикой обработки персональных данных</a></span></label>';
  }

  /* Номер секции идёт по порядку видимых блоков с заголовком */
  var secN = 0;
  function head(x, opts) {
    opts = opts || {};
    secN++;
    return '<div class="shead' + (opts.split ? ' shead--split' : '') + '"><div class="shead__main">' +
      '<div class="sbadge rv"><span class="sbadge__n">' + secN + '</span>' + (x.eyebrow ? '<span class="sbadge__pill">' + t(x.eyebrow) + '</span>' : '') + '</div>' +
      '<h2 class="h2 rv">' + t(x.title) + '</h2>' +
      (x.sub && !opts.noSub ? '<p class="shead__sub rv">' + t(x.sub) + '</p>' : '') +
      '</div>' + (opts.right ? '<div class="shead__right rv">' + opts.right + '</div>' : '') + '</div>';
  }
  function section(id, tone, inner, extraCls) {
    return '<section class="sec tone-' + tone + (extraCls ? ' ' + extraCls : '') + '" id="' + esc(id) + '"><div class="wrap">' + inner + '</div></section>';
  }

  var R = {};

  R.header = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<header class="hdr" data-hdr><div class="wrap hdr__wrap"><nav class="hdr__pill" aria-label="Основное меню">' +
      '<a class="hdr__logo" href="#top" aria-label="' + attr(s.brandName) + '">' + '<img class="brand-logo" src="../logos/v1-logo.svg" alt="' + attr(s.brandName) + '" width="183" height="48">' + '</a>' +
      '<div class="hdr__links">' + menuLinks(c) + '</div>' +
      '<div class="hdr__right">' +
      (s.phone ? '<a class="hdr__phone" href="' + tel(s.phone) + '"><i class="live"></i><span>' + esc(s.phone) + '</span></a>' : '') +
      '<div class="hdr__cta">' + ask(s.headerButton || 'Получить расчёт', 'btn--dark btn--sm', { title: h.formTitle, sub: h.formSub }) + '</div>' +
      (s.phone ? '<a class="hdr__call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + svg('phone') + '</a>' : '') +
      '<button class="hdr__burger" type="button" data-open-menu aria-label="Открыть меню"><span>Меню</span>' + svg('menu') + '</button>' +
      '</div></nav></div></header>';
  };

  R.sheet = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="sheet" data-sheet aria-hidden="true"><div class="sheet__bg" data-close-menu></div>' +
      '<div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Меню">' +
      '<div class="sheet__top"><span class="sheet__tag"><i class="live"></i>' + t(s.phoneNote || s.hours) + '</span>' +
      '<button class="sheet__x" type="button" data-close-menu aria-label="Закрыть меню">' + svg('close') + '</button></div>' +
      '<nav class="sheet__links">' + menuLinks(c) + '</nav>' +
      '<div class="sheet__foot">' +
      (s.phone ? '<a class="sheet__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'btn--accent btn--block', { title: h.formTitle, sub: h.formSub }) +
      '</div></div></div>';
  };

  R.hero = function (c) {
    var h = c.hero || {};
    var heroCase = arr(c.cases && c.cases.items).filter(function (i) { return i.video && i.video === h.video; })[0];
    var tag = '';
    if (heroCase) {
      var f = arr(heroCase.facts).slice(0, 2).map(function (x) { return t(x.v); }).join(' · ');
      tag = '<div class="screen__tag"><i class="live"></i><span><b>' + t(heroCase.type) + '</b>' + (f ? ' · ' + f : '') + '</span></div>';
    }
    var vid = h.video
      ? '<video class="screen__v" autoplay muted loop playsinline preload="auto" data-autoplay' + (h.poster ? ' poster="' + media(h.poster) + '"' : '') + '><source src="' + media(h.video) + '" type="video/mp4"></video>'
      : (h.poster ? '<img class="screen__v" src="' + media(h.poster) + '" alt="">' : '');
    var facts = arr(h.facts).map(function (x) {
      return '<div class="hfact"><b>' + t(x.title) + '</b><span>' + t(x.text) + '</span></div>';
    }).join('');
    var b2 = isOn(c, 'cases') && h.button2 ? btn(t(h.button2), 'btn--light', '#cases', '', 'play') : '';
    return '<section class="hero" id="top">' +
      '<div class="hero__bg" aria-hidden="true"><canvas class="hero__canvas" data-shader></canvas></div>' +
      '<div class="wrap hero__grid">' +
      (h.badge ? '<div class="hero__label rv">' + svg('pin') + '<span>' + t(h.badge) + '</span></div>' : '') +
      '<h1 class="hero__h1 rv">' + t(h.h1) + '</h1>' +
      '<div class="hero__side">' +
      (h.lead ? '<p class="hero__lead rv">' + t(h.lead) + '</p>' : '') +
      '<div class="hero__btns rv">' + ask(h.button1 || 'Рассчитать стоимость', 'btn--accent btn--lg', { title: h.formTitle, sub: h.formSub }) + b2 + '</div>' +
      (facts ? '<div class="hero__facts rv">' + facts + '</div>' : '') + '</div>' +
      (vid ? '<div class="hero__panel rv"><div class="screen"><div class="screen__frame">' + vid + '<span class="screen__glare"></span></div>' + tag + '</div></div>' : '') +
      '</div></section>';
  };

  R.trust = function (c) {
    var items = arr(c.trust && c.trust.items).filter(vis).map(function (i) {
      return '<div class="trust__item rv"><b>' + t(i.value) + '</b><span>' + t(i.label) + '</span></div>';
    }).join('');
    if (!items) return '';
    return '<section class="trust tone-white" id="trust"><div class="wrap"><div class="trust__grid">' + items + '</div></div></section>';
  };

  R.screens = function (c, tone) {
    var x = c.screens, cases = isOn(c, 'cases');
    var cards = arr(x.items).filter(vis).map(function (s) {
      var specs = arr(s.specs).filter(vis).map(function (p) { return '<div class="kv"><dt>' + t(p.k) + '</dt><dd>' + t(p.v) + '</dd></div>'; }).join('');
      var rate = Number(s.rate) > 0 ? '<span class="scard__price">от ' + fmt(s.rate) + ' ₽/м²</span>' : '<span class="scard__price scard__price--muted">Расчёт по проекту</span>';
      return '<article class="scard rv">' +
        '<div class="scard__media">' + mv(s.video, s.image, s.name) + rate + '</div>' +
        '<div class="scard__body"><h3 class="scard__title">' + t(s.name) + '</h3><p class="scard__desc">' + t(s.desc) + '</p>' +
        (specs ? '<dl class="scard__specs">' + specs + '</dl>' : '') +
        '<div class="scard__actions">' +
        ask('Рассчитать', 'btn--accent btn--sm', { title: 'Расчёт: ' + plain(s.name), sub: 'Укажите размеры и телефон, пришлём конфигурацию и смету с монтажом', product: s.name, type: s.id }) +
        (cases ? '<a class="lbtn" href="#cases" data-case-filter="' + esc(s.caseFilter || 'all') + '">Примеры ' + svg('arrow') + '</a>' : '') +
        '</div></div></article>';
    }).join('');
    var help = x.helpButton ? ask(x.helpButton, 'btn--light', { title: 'Помочь с выбором экрана', sub: 'Расскажите, где будет экран, подберём тип и шаг пикселя' }) : '';
    return section('screens', tone, head(x, { split: true, right: help }) + '<div class="sgrid">' + cards + '</div>');
  };

  R.cases = function (c, tone) {
    var x = c.cases, items = arr(x.items).filter(vis), h = c.hero || {};
    if (!items.length) return '';
    var used = {};
    items.forEach(function (i) { arr(i.filters).forEach(function (f) { used[f] = 1; }); });
    var filters = arr(x.filters).filter(function (f) { return used[f.id]; });
    var pills = filters.length ? '<div class="pills rv" role="tablist" data-car-filters><button class="pill is-active" type="button" data-filter="all">' + t(x.allLabel || 'Все объекты') + '</button>' +
      filters.map(function (f) { return '<button class="pill" type="button" data-filter="' + esc(f.id) + '">' + t(f.label) + '</button>'; }).join('') + '</div>' : '';
    var tiles = items.map(function (i) {
      var facts = arr(i.facts).map(function (f) { return '<span>' + t(f.k) + ': <b>' + t(f.v) + '</b></span>'; }).join('');
      var poster = i.poster ? media(i.poster) : '';
      return '<article class="tile" tabindex="0" role="button" aria-label="Смотреть видео: ' + attr(i.title) + '" data-type="' + esc(arr(i.filters).join(' ')) + '"' +
        ' data-video="' + media(i.video) + '" data-poster="' + poster + '" data-title="' + attr(i.title) + '" data-kind="' + attr(i.type) + '" data-desc="' + attr(i.desc) + '">' +
        (poster ? '<img class="tile__bd" src="' + poster + '" alt="" loading="lazy" aria-hidden="true">' : '') +
        (i.video ? '<video class="tile__v" muted loop playsinline preload="none"' + (poster ? ' poster="' + poster + '"' : '') + '><source src="' + media(i.video) + '" type="video/mp4"></video>'
          : (poster ? '<img class="tile__v" src="' + poster + '" alt="">' : '')) +
        '<span class="tile__shade"></span>' +
        '<span class="tile__more"><span class="tile__more-ic">' + svg('play') + '</span><span class="tile__more-t">Смотреть объект</span></span>' +
        '<div class="tile__info">' + (i.type ? '<span class="tile__type">' + t(i.type) + '</span>' : '') +
        '<h3 class="tile__title">' + t(i.title) + '</h3>' + (facts ? '<div class="tile__facts">' + facts + '</div>' : '') + '</div></article>';
    }).join('');
    var arrows = '<div class="car__arrows"><button class="car__arrow" type="button" data-car-prev aria-label="Назад">' + svg('left') + '</button>' +
      '<button class="car__arrow" type="button" data-car-next aria-label="Вперёд">' + svg('right') + '</button></div>';
    var nudge = '<div class="nudge rv"><div class="nudge__ic">' + svg('camera') + '</div><div class="nudge__txt"><b>Хотите такой же экран?</b><span>Пришлите фото места, посчитаем за день</span></div>' +
      ask('Хочу такой же экран', 'btn--accent', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом' }) + '</div>';
    return section('cases', tone,
      head(x, { split: true, right: arrows }) + pills +
      '<div class="car rv" data-car><div class="car__track" data-car-track>' + tiles + '</div></div>' +
      '<div class="car__foot"><div class="car__dots" data-car-dots></div><span class="car__hint">Нажмите на объект, чтобы открыть видео со звуком</span></div>' + nudge,
      'cases');
  };

  R.included = function (c, tone) {
    var x = c.included, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var photoA = items[0];
    var warranty = items.filter(function (i) { return i.icon === 'shield'; })[0];
    var photoB = items.filter(function (i) { return i.icon === 'wrench' && i !== photoA && i !== warranty; })[0] ||
      items.filter(function (i) { return i !== photoA && i !== warranty; })[2];
    var singles = items.filter(function (i) { return i !== photoA && i !== warranty && i !== photoB; });
    var cells = 4 + (warranty ? 2 : 0) + (photoB ? 4 : 0) + singles.length;
    var wideLast = cells % 4 === 3;

    function photoTile(i, cls) {
      var m = BENTO_MEDIA[i.icon] || {};
      if (!m.img) m = i === photoA ? BENTO_MEDIA.config : BENTO_MEDIA.wrench;
      var img = m.img;
      var bg = m.video
        ? '<video class="bento__media" muted loop playsinline preload="none" data-autoplay poster="' + media(img) + '"><source src="' + media(m.video) + '" type="video/mp4"></video>'
        : '<img class="bento__media" src="' + media(img) + '" alt="" loading="lazy">';
      return '<div class="bento__cell bento__cell--photo ' + cls + ' rv">' + bg + '<span class="bento__shade"></span>' +
        '<div class="bento__body"><span class="bento__ic bento__ic--glass">' + svg(i.icon) + '</span><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></div></div>';
    }
    function warrantyTile(i) {
      var m = plain(i.text + ' ' + i.title).match(/(\d+[.,]?\d*)\s*(года|год|лет)/i);
      var big = m ? '<div class="bento__num"><b>' + esc(m[1]) + '</b><span>' + esc(m[2]) + '</span></div>' : '<div class="bento__num bento__num--text"><b>' + t(i.title) + '</b></div>';
      return '<div class="bento__cell bento__cell--warranty rv"><span class="bento__flutes" aria-hidden="true"></span>' +
        '<span class="bento__ic bento__ic--glass">' + svg(i.icon) + '</span>' + big +
        '<div class="bento__body"><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></div></div>';
    }
    function single(i, wide) {
      return '<div class="bento__cell bento__cell--plain' + (wide ? ' bento__cell--wide' : '') + ' rv"><span class="bento__ic">' + svg(i.icon) + '</span>' +
        '<div class="bento__body"><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></div></div>';
    }
    var html = photoTile(photoA, 'bento__cell--a') + (warranty ? warrantyTile(warranty) : '');
    var before = singles.slice(0, 4), after = singles.slice(4);
    html += before.map(function (i, n) { return single(i, wideLast && !after.length && n === before.length - 1); }).join('');
    if (photoB) html += photoTile(photoB, 'bento__cell--b');
    html += after.map(function (i, n) { return single(i, wideLast && n === after.length - 1); }).join('');
    return section('included', tone, head(x) + '<div class="bento">' + html + '</div>');
  };

  R.process = function (c, tone) {
    var x = c.process, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var steps = items.map(function (i, n) {
      var num = (n + 1 < 10 ? '0' : '') + (n + 1);
      return '<li class="step rv" style="--i:' + n + '"><div class="step__node"><span>' + num + '</span></div>' +
        '<div class="step__body"><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p>' +
        (i.term ? '<span class="step__term">' + svg('clock') + t(i.term) + '</span>' : '') + '</div></li>';
    }).join('');
    return section('process', tone, head(x, { split: true }) +
      '<div class="proc" data-proc style="--n:' + items.length + '"><div class="proc__line" aria-hidden="true"><i></i></div><ol class="proc__list">' + steps + '</ol></div>');
  };

  R.calc = function (c, tone) {
    var x = c.calc;
    var types = arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && Number(s.rate) > 0; });
    if (!types.length) return '';
    var def = types.some(function (s) { return s.id === x.defaultType; }) ? x.defaultType : types[0].id;
    var chips = types.map(function (s) {
      return '<label class="tchip"><input type="radio" name="calctype" value="' + esc(s.id) + '" data-rate="' + Number(s.rate) + '" data-px="' + attr(s.px) + '" data-name="' + attr(s.shortName || s.name) + '"' + (s.id === def ? ' checked' : '') + '>' +
        '<span><b>' + t(s.name) + '</b><small>от ' + fmt(s.rate) + ' ₽ за м²' + (s.px ? ' · ' + t(s.px) : '') + '</small></span></label>';
    }).join('');
    function dim(name, label, val) {
      return '<div class="dim"><span class="dim__l">' + label + '</span><div class="dim__ctl">' +
        '<button type="button" class="dim__b" data-step="' + name + ':-0.5" aria-label="Уменьшить">−</button>' +
        '<input type="number" name="' + name + '" min="0.5" max="200" step="0.1" inputmode="decimal" value="' + val + '" aria-label="' + label + '">' +
        '<button type="button" class="dim__b" data-step="' + name + ':0.5" aria-label="Увеличить">+</button></div></div>';
    }
    var form = '<form class="calc__form rv" data-calc data-mount-share="' + Number(x.mountShare || 0) + '" novalidate>' +
      '<div class="calc__fh"><h3>' + t(x.formTitle || 'Калькулятор') + '</h3>' + (x.formSub ? '<p>' + t(x.formSub) + '</p>' : '') + '</div>' +
      '<div class="calc__lbl">Тип экрана</div><div class="calc__types">' + chips + '</div>' +
      '<div class="calc__lbl">Размер экрана, метры</div><div class="calc__dims">' + dim('w', 'Ширина', Number(x.defaultWidth || 6)) + '<span class="calc__x">×</span>' + dim('h', 'Высота', Number(x.defaultHeight || 3)) + '</div>' +
      '<label class="switch"><input type="checkbox" name="mount" checked><i></i><span>' + t(x.mountLabel || 'Включить монтаж') + '</span></label>' +
      (arr(c.hero && c.hero.facts).length ? '<ul class="calc__facts">' + arr(c.hero.facts).map(function (f) { return '<li>' + svg('check') + t(f.title) + '</li>'; }).join('') + '</ul>' : '') +
      '</form>';
    var out = '<div class="calc__out rv"><span class="calc__k"><i class="live"></i>Ориентировочная стоимость</span>' +
      '<div class="calc__price" data-out="price">—</div>' +
      '<dl class="calc__rows">' +
      '<div><dt>Тип экрана</dt><dd data-out="type">—</dd></div>' +
      '<div><dt>Площадь</dt><dd data-out="area">—</dd></div>' +
      '<div><dt>Шаг пикселя</dt><dd data-out="px">—</dd></div>' +
      '<div><dt>Экран, за м²</dt><dd data-out="rate">—</dd></div>' +
      '<div><dt>Монтаж и конструкция</dt><dd data-out="mount">—</dd></div>' +
      '</dl>' +
      ask(x.button || 'Получить точную смету', 'btn--accent btn--lg btn--block', { title: 'Получить точную смету', sub: 'Пришлём спецификацию и смету с монтажом в течение рабочего дня', product: 'Экран по калькулятору', extra: ' data-calc-ask' }) +
      (x.excludes ? '<p class="calc__note">' + t(x.excludes) + '</p>' : '') + '</div>';
    return section('calc', tone, head(x, { split: true }) + '<div class="calc">' + form + out + '</div>', 'calcsec');
  };

  R.specs = function (c, tone) {
    var x = c.specs, rows = arr(x.rows).filter(vis);
    if (!rows.length) return '';
    var th = ['Шаг пикселя', 'Расстояние просмотра', 'Где применяется', 'Тип экрана', 'Яркость'];
    var body = rows.map(function (r) {
      return '<tr><td data-l="' + th[0] + '"><span class="px">' + t(r.px) + '</span></td><td data-l="' + th[1] + '"><b>' + t(r.dist) + '</b></td><td data-l="' + th[2] + '">' + t(r.where) +
        '</td><td data-l="' + th[3] + '">' + t(r.type) + '</td><td data-l="' + th[4] + '">' + t(r.bright) + '</td></tr>';
    }).join('');
    return section('specs', tone, head(x, { split: true }) +
      '<div class="stbl rv"><table><thead><tr>' + th.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>');
  };

  R.about = function (c, tone) {
    var x = c.about;
    var docs = arr(x.docs).filter(vis).map(function (d) { return '<div class="adoc rv"><span class="adoc__ic">' + svg(d.icon) + '</span><span>' + t(d.text) + '</span></div>'; }).join('');
    secN++;
    return section('about', tone, '<div class="about">' +
      '<div class="about__main"><div class="sbadge rv"><span class="sbadge__n">' + secN + '</span>' + (x.eyebrow ? '<span class="sbadge__pill">' + t(x.eyebrow) + '</span>' : '') + '</div>' +
      '<h2 class="h2 rv">' + t(x.title) + '</h2><div class="about__text rv">' + paras(x.text) + '</div>' +
      (docs ? '<div class="about__docs">' + docs + '</div>' : '') + '</div>' +
      (x.video || x.image ? '<div class="about__photo rv">' + mv(x.video, x.image, x.title) + '</div>' : '') +
      '</div>');
  };

  R.reviews = function (c, tone) {
    var x = c.reviews, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var cards = items.map(function (r) {
      var n = Math.max(0, Math.min(5, Number(r.stars) || 0));
      var letter = plain(r.name).trim().charAt(0).toUpperCase() || '•';
      var stars = '';
      for (var k = 0; k < n; k++) stars += svg('star', 'star');
      return '<figure class="rev rv">' + (n ? '<div class="rev__stars" aria-label="' + n + ' из 5">' + stars + '</div>' : '') +
        '<blockquote>' + t(r.text) + '</blockquote>' +
        '<figcaption class="rev__who"><span class="rev__ava">' + esc(letter) + '</span><span><b>' + t(r.name) + '</b><small>' + t(r.object) + '</small></span></figcaption></figure>';
    }).join('');
    return section('reviews', tone, head(x) + '<div class="revs">' + cards + '</div>');
  };

  R.cta = function (c, tone) {
    var x = c.cta, s = c.settings || {};
    return '<section class="sec sec--band tone-' + tone + '" id="cta"><div class="wrap"><div class="band rv"><span class="band__flutes" aria-hidden="true"></span>' +
      '<div class="band__txt"><h2>' + t(x.title) + '</h2>' + (x.text ? '<p>' + t(x.text) + '</p>' : '') + '</div>' +
      '<div class="band__btns">' + ask(x.button || 'Оставить заявку', 'btn--white btn--lg', { title: x.title, sub: x.text, icon: 'camera' }) +
      (x.showPhone && s.phone ? '<a class="band__phone" href="' + tel(s.phone) + '">' + svg('phone') + esc(s.phone) + '</a>' : '') +
      '</div></div></div></section>';
  };

  R.faq = function (c, tone) {
    var x = c.faq, s = c.settings || {}, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var list = items.map(function (q, n) {
      var id = 'faq-a-' + n;
      return '<div class="faq__item' + (q.open ? ' is-open' : '') + ' rv"><button class="faq__q" type="button" aria-expanded="' + (q.open ? 'true' : 'false') + '" aria-controls="' + id + '">' +
        '<span>' + t(q.q) + '</span><i class="faq__ic" aria-hidden="true"></i></button>' +
        '<div class="faq__a" id="' + id + '" role="region"><div class="faq__ain">' + paras(q.a) + '</div></div></div>';
    }).join('');
    var aside = '<div class="faq__ask rv"><b>Не нашли ответ?</b><span>' + t(s.contactName) + ' ответит на вопросы по экрану и монтажу</span>' +
      (s.phone ? '<a class="faq__tel" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + '</div>';
    return section('faq', tone, '<div class="faq"><div class="faq__head">' + head(x) + aside + '</div><div class="faq__list">' + list + '</div></div>');
  };

  R.contacts = function (c, tone) {
    var x = c.contacts, s = c.settings || {};
    var initials = plain(s.contactName).split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    var msgs = messengers(c, 'msg');
    var card = '<div class="ccard rv"><div class="ccard__person"><span class="ccard__ava">' + esc(initials) + '<i class="live"></i></span><div><b>' + t(s.contactName) + '</b><span>' + t(s.contactRole) + '</span></div></div>' +
      (s.phone ? '<a class="ccard__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.hours ? '<div class="ccard__hours">' + svg('clock') + t(s.hours) + '</div>' : '') +
      '<ul class="ccard__list">' +
      (s.email ? '<li>' + svg('mail') + '<div><a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' + (s.emailNote ? '<small>' + t(s.emailNote) + '</small>' : '') + '</div></li>' : '') +
      (s.address ? '<li>' + svg('pin') + '<div><span>' + t(s.address) + '</span>' + (s.addressNote ? '<small>' + t(s.addressNote) + '</small>' : '') + '</div></li>' : '') +
      '</ul>' + (msgs ? '<div class="ccard__msgs">' + msgs + '</div>' : '') + '</div>';
    var form = '<form class="cform rv" data-done="' + attr(s.formDone) + '">' +
      '<h3>' + t(x.formTitle) + '</h3>' + (x.formSub ? '<p class="cform__sub">' + t(x.formSub) + '</p>' : '') +
      '<div class="frow"><label class="fld"><span>Имя</span><input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name"></label>' +
      '<label class="fld"><span>Телефон</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label></div>' +
      '<div class="frow"><label class="fld"><span>Email (необязательно)</span><input type="email" name="email" placeholder="Для отправки спецификации" autocomplete="email"></label>' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label></div>' +
      '<label class="fld"><span>Задача</span><textarea name="task" rows="3" placeholder="Где будет экран, примерные размеры, что показывать, сроки"></textarea></label>' +
      '<label class="upload">' + svg('clip') + '<span>Прикрепить фото объекта или чертёж</span><input type="file" hidden></label>' +
      '<button class="btn btn--accent btn--lg btn--block" type="submit"><span class="btn__roll"><span>' + t(x.formButton || 'Отправить заявку') + '</span><span aria-hidden="true">' + t(x.formButton || 'Отправить заявку') + '</span></span><span class="btn__ic">' + svg('arrow') + '</span></button>' +
      consent(c, 'Соглашаюсь с') + '</form>';
    return section('contacts', tone, head(x, { split: true }) + '<div class="contacts">' + card + form + '</div>', 'contactsec');
  };

  R.footer = function (c) {
    var x = c.footer || {}, s = c.settings || {};
    return '<footer class="foot tone-dark"><div class="wrap"><div class="foot__grid">' +
      '<div class="foot__brand"><a class="foot__logo" href="#top">' + '<img class="brand-logo" src="../logos/v1-logo-white.svg" alt="' + attr(s.brandName) + '" width="183" height="48">' + '</a>' +
      (x.about ? '<p>' + t(x.about) + '</p>' : '') + '</div>' +
      '<nav class="foot__col"><h4>Разделы</h4>' + menuLinks(c) + '</nav>' +
      '<div class="foot__col"><h4>Связь</h4>' + (s.phone ? '<a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') + messengers(c, 'foot__msg') + '</div>' +
      '</div><div class="foot__legal"><span>' + t(s.companyName) + '. ' + t(x.legal) + '</span>' + (x.note ? '<span>' + t(x.note) + '</span>' : '') +
      '<a href="' + attr(s.policyUrl || '#') + '">Политика обработки персональных данных</a></div></div></footer>';
  };

  R.mbar = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="mbar" data-mbar>' + (s.phone ? '<a class="mbar__call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + svg('phone') + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'btn--accent btn--block', { title: h.formTitle, sub: h.formSub }) + '</div>';
  };

  R.modal = function (c) {
    var s = c.settings || {}, h = c.hero || {}, cl = c.calc || {};
    return '<div class="modal" data-modal aria-hidden="true"><div class="modal__bg" data-close-modal></div>' +
      '<div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<button class="modal__x" type="button" data-close-modal aria-label="Закрыть">' + svg('close') + '</button>' +
      '<h3 id="modal-title" data-m-title>' + t(h.formTitle || 'Получить расчёт экрана') + '</h3>' +
      '<p class="modal__sub" data-m-sub>' + t(h.formSub || '') + '</p>' +
      '<div class="modal__prod" data-m-prod hidden>Задача: <b></b></div>' +
      '<form class="mform" data-done="' + attr(s.formDone) + '" data-default-title="' + attr(h.formTitle || 'Получить расчёт экрана') + '" data-default-sub="' + attr(h.formSub || '') + '">' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c, cl.defaultType) + '</select></label>' +
      '<div class="frow frow--2"><label class="fld"><span>Ширина, м</span><input type="text" name="w" inputmode="decimal" placeholder="' + Number(cl.defaultWidth || 6) + '"></label>' +
      '<label class="fld"><span>Высота, м</span><input type="text" name="h" inputmode="decimal" placeholder="' + Number(cl.defaultHeight || 3) + '"></label></div>' +
      '<label class="fld"><span>Телефон</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label>' +
      '<button class="btn btn--accent btn--lg btn--block" type="submit"><span class="btn__roll"><span>' + t(h.formButton || 'Получить расчёт') + '</span><span aria-hidden="true">' + t(h.formButton || 'Получить расчёт') + '</span></span><span class="btn__ic">' + svg('arrow') + '</span></button>' +
      consent(c) + '</form>' +
      (s.phone ? '<div class="modal__alt">Или позвоните: <a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a></div>' : '') +
      '</div></div>';
  };

  R.lightbox = function (c) {
    return '<div class="lb" data-lb aria-hidden="true"><div class="lb__bg" data-close-lb></div>' +
      '<div class="lb__box" role="dialog" aria-modal="true" aria-label="Видео объекта">' +
      '<button class="lb__x" type="button" data-close-lb aria-label="Закрыть">' + svg('close') + '</button>' +
      '<div class="lb__media"><video controls playsinline data-lb-video></video></div>' +
      '<div class="lb__cap"><div><span class="lb__type" data-lb-type></span><b data-lb-title></b><p data-lb-desc></p></div>' +
      ask('Хочу такой же экран', 'btn--accent', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом', extra: ' data-lb-ask' }) +
      '</div></div></div>';
  };

  var DARK = { cases: 1, calc: 1, contacts: 1 };

  function render(c) {
    secN = 0;
    c.settings = c.settings || {};
    var parts = [R.header(c), R.sheet(c), '<main id="main">', R.hero(c)];
    var light = 1, prevTone = 'white'; /* после hero: trust белый, дальше светлые чередуются */
    arr(c.blocks).forEach(function (b) {
      if (b.visible === false || !R[b.id] || !c[b.id]) return;
      var tone;
      if (b.id === 'trust') tone = 'white';
      else if (DARK[b.id]) tone = 'dark';
      else if (b.id === 'cta') tone = prevTone === 'dark' ? 'white' : prevTone; /* полоса продолжает фон предыдущей секции */
      else { tone = light % 2 ? 'soft' : 'white'; light++; }
      var html = R[b.id](c, tone);
      if (html) { parts.push(html); prevTone = tone; }
    });
    parts.push('</main>', R.footer(c), R.mbar(c), R.modal(c), R.lightbox(c));
    var app = document.getElementById('app');
    app.innerHTML = parts.join('');
    if (c.meta) {
      document.title = plain(c.meta.title);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', plain(c.meta.description));
    }
    if (window.V1App) window.V1App.init(c);
  }

  window.V1Render = { render: render, plain: plain };

  var app = document.getElementById('app');
  if (!app) return;
  fetch(ROOT + 'content/landing.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (c) {
      render(c);
      if (location.hash.length > 1) {
        var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) setTimeout(function () { el.scrollIntoView(); }, 50);
      }
    })
    .catch(function (e) {
      app.innerHTML = '<div class="wrap" style="padding:120px 20px"><h2 class="h2">Не удалось загрузить контент</h2><p>' + esc(e.message) + '</p></div>';
    });
})();
