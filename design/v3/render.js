/* Вариант 3 · Stitch. Визуальный язык из макета Google Stitch (design/Stitch, DESIGN.md «Pixel Daylight»),
   контент только из ../../content/landing.json (тот же файл правит админка).
   Порядок и видимость блоков из blocks, пункты меню из blocks[].menu.
   [[текст]] выводится как обычный текст, \n превращается в перенос строки.
   Основа сборки и логика взяты из варианта 1, разметка переделана под Stitch. */
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
    tick: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
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
    chevron: '<path d="m6 9 6 6 6-6"/>',
    /* иконки типов экранов */
    glass: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    curve: '<path d="M3 6.5c6-3 12-3 18 0v11c-6-3-12-3-18 0z"/>',
    bridge: '<path d="M2 16h20M4 16v4M20 16v4M2 9c5 6 15 6 20 0"/><path d="M8 13.4V16M12 14.3V16M16 13.4V16"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'
  };
  var SCREEN_ICONS = { transparent: 'glass', outdoor: 'sun', indoor: 'monitor', flex: 'curve', bridge: 'bridge', custom: 'sparkle' };
  var MSG = {
    whatsapp: ['WhatsApp', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'],
    telegram: ['Telegram', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.2 1.4 11.7c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>'],
    max: ['MAX', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5l8 9 8-9v14"/></svg>']
  };
  /* Видео-плитки в «Что входит»: у пунктов в JSON нет медиа, берём ролики клиента из assets/video.
     Порядок важен: первые две найденные плитки становятся видео-плитками 2×1 */
  var BENTO_MEDIA = {
    wrench: { img: 'assets/video/case-pedestrian-bridge-night.jpg', video: 'assets/video/case-pedestrian-bridge-night.mp4' },
    monitor: { img: 'assets/video/case-facade-highway.jpg', video: 'assets/video/case-facade-highway.mp4' },
    truck: { img: 'assets/video/case-pedestrian-bridge-day.jpg', video: 'assets/video/case-pedestrian-bridge-day.mp4' }
  };
  /* Ссылки-стрелки внизу плиток «Что входит» (как в макете Stitch), ведут на блоки этой же страницы */
  var BENTO_LINKS = {
    config: ['Как выбрать шаг пикселя', 'specs'],
    truck: ['Этапы и сроки', 'process'],
    doc: ['Вопросы и ответы', 'faq']
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  /* неразрывный пробел после коротких слов: «с», «и», «на» не остаются в конце строки */
  function nb(s) { return s.replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2 ').replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2 '); }
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
  /* Медиа карточки: если есть видео, выводим его (muted loop playsinline, играет только в кадре через app.js),
     постер всегда; если видео нет, картинка */
  function vmedia(video, poster, cls, alt) {
    if (video) return '<video class="' + cls + '" muted loop playsinline preload="metadata" data-autoplay' + (poster ? ' poster="' + media(poster) + '"' : '') +
      (alt ? ' aria-label="' + attr(alt) + '"' : '') + '><source src="' + media(video) + '" type="video/mp4"></video>';
    return poster ? '<img class="' + cls + '" src="' + media(poster) + '" alt="' + attr(alt || '') + '" loading="lazy">' : '';
  }
  /* если у карточки нет своего видео, но её картинка — кадр одного из объектов, берём ролик этого объекта */
  function videoByPoster(c, img) {
    if (!img) return '';
    var m = arr(c.cases && c.cases.items).filter(function (i) { return i.poster === img && i.video; })[0];
    return m ? m.video : '';
  }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }
  function svg(name, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.doc) + '</svg>'; }
  function vis(x) { return x && x.visible !== false; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function isOn(c, id) { return arr(c.blocks).some(function (b) { return b.id === id && b.visible !== false; }) && !!c[id]; }
  function fmt(n) { return Number(n || 0).toLocaleString('ru-RU'); }

  /* Кнопка-пилюля в духе Stitch: сплошная заливка, текст, необязательная стрелка */
  function btn(label, cls, href, extra, icon) {
    return '<a class="btn ' + (cls || '') + '" href="' + (href || '#') + '"' + (extra || '') + '><span class="btn__t">' + label + '</span>' +
      (icon ? svg(icon, 'btn__ic') : '') + '</a>';
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
  function submitBtn(label, cls) {
    return '<button class="btn ' + cls + '" type="submit"><span class="btn__t">' + t(label) + '</span>' + svg('arrow', 'btn__ic') + '</button>';
  }
  function messengers(c, cls) {
    var s = c.settings || {};
    return ['whatsapp', 'telegram', 'max'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a class="' + (cls || 'msg') + '" href="' + attr(s[k]) + '" target="_blank" rel="noopener">' + MSG[k][1] + '<span>' + MSG[k][0] + '</span></a>';
    }).join('');
  }
  function menuLinks(c, cls) {
    return arr(c.blocks).filter(function (b) { return b.visible !== false && b.menu && c[b.id]; }).map(function (b) {
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

  /* Заголовок секции: синяя подпись капсом, h2, подзаголовок. По центру, как в Stitch */
  function head(x, opts) {
    opts = opts || {};
    return '<div class="shead' + (opts.split ? ' shead--split' : '') + (opts.left ? ' shead--left' : '') + '"><div class="shead__main">' +
      (x.eyebrow ? '<span class="eyebrow rv">' + t(x.eyebrow) + '</span>' : '') +
      '<h2 class="h2 rv">' + t(x.title) + '</h2>' +
      (x.sub && !opts.noSub ? '<p class="shead__sub rv">' + t(x.sub) + '</p>' : '') +
      '</div>' + (opts.right ? '<div class="shead__right rv">' + opts.right + '</div>' : '') + '</div>';
  }
  function section(id, tone, inner, extraCls) {
    return '<section class="sec tone-' + tone + (extraCls ? ' ' + extraCls : '') + '" id="' + esc(id) + '">' +
      (tone === 'dark' ? '<span class="sec__glow sec__glow--a" aria-hidden="true"></span><span class="sec__glow sec__glow--b" aria-hidden="true"></span>' : '') +
      '<div class="wrap">' + inner + '</div></section>';
  }

  var R = {};

  R.header = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<header class="hdr" data-hdr><div class="hdr__wrap"><nav class="hdr__pill" aria-label="Основное меню">' +
      '<a class="hdr__logo" href="#top" aria-label="' + attr(s.brandName) + '">' + '<img class="brand-logo" src="../logos/v3-logo.svg" alt="' + attr(s.brandName) + '" width="183" height="48">' + '</a>' +
      '<div class="hdr__links">' + menuLinks(c) + '</div>' +
      '<div class="hdr__right">' +
      (s.phone ? '<a class="hdr__phone" href="' + tel(s.phone) + '"><b>' + esc(s.phone) + '</b>' +
        (s.phoneNote ? '<small><i class="live"></i>' + t(s.phoneNote) + '</small>' : '') + '</a>' : '') +
      '<div class="hdr__cta">' + ask(s.headerButton || 'Получить расчёт', 'btn--primary btn--sm', { title: h.formTitle, sub: h.formSub }) + '</div>' +
      (s.phone ? '<a class="hdr__call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + svg('phone') + '</a>' : '') +
      '<button class="hdr__burger" type="button" data-open-menu aria-label="Открыть меню">' + svg('menu') + '</button>' +
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
      ask(s.headerButton || 'Получить расчёт', 'btn--primary btn--lg btn--block', { title: h.formTitle, sub: h.formSub }) +
      '</div></div></div>';
  };

  R.hero = function (c) {
    var h = c.hero || {};
    var heroCase = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && i.video && i.video === h.video; })[0];
    var cap = '';
    if (heroCase) {
      var f = arr(heroCase.facts).map(function (x) { return t(x.k) + ' ' + t(x.v); }).join(' • ');
      cap = '<div class="hmedia__cap"><div class="hmedia__txt">' + (heroCase.type ? '<span class="hmedia__chip">' + t(heroCase.type) + '</span>' : '') +
        '<p class="hmedia__t">' + t(heroCase.title) + '</p>' + (f ? '<p class="hmedia__s">' + f + '</p>' : '') + '</div>' +
        ask('Хочу такой же экран', 'btn--glass', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом', product: heroCase.title }) + '</div>';
    }
    var vid = h.video
      ? '<video class="hmedia__v" autoplay muted loop playsinline preload="auto" data-autoplay' + (h.poster ? ' poster="' + media(h.poster) + '"' : '') + '><source src="' + media(h.video) + '" type="video/mp4"></video>'
      : (h.poster ? '<img class="hmedia__v" src="' + media(h.poster) + '" alt="">' : '');
    var facts = arr(h.facts).map(function (x) { return '<li>' + svg('tick') + '<span>' + t(x.title) + '</span></li>'; }).join('');
    var b2 = isOn(c, 'cases') && h.button2 ? btn(t(h.button2), 'btn--soft btn--lg', '#cases') : '';
    return '<section class="hero" id="top"><span class="hero__glow" aria-hidden="true"></span>' +
      '<div class="wrap hero__in">' +
      (h.badge ? '<div class="gbadge hero__badge rv"><i></i><span>' + t(h.badge) + '</span></div>' : '') +
      '<h1 class="hero__h1 rv">' + t(h.h1) + '</h1>' +
      (h.lead ? '<p class="hero__lead rv">' + t(h.lead) + '</p>' : '') +
      '<div class="hero__btns rv">' + ask(h.button1 || 'Рассчитать стоимость', 'btn--primary btn--lg', { title: h.formTitle, sub: h.formSub }) + b2 + '</div>' +
      (facts ? '<ul class="hero__facts rv">' + facts + '</ul>' : '') +
      (vid ? '<div class="hero__media rv"><div class="hmedia">' + vid + '<span class="hmedia__shade"></span>' + cap + '</div></div>' : '') +
      '</div></section>';
  };

  R.trust = function (c) {
    var items = arr(c.trust && c.trust.items).filter(vis).map(function (i) {
      return '<div class="trust__item"><b class="grad-text">' + t(i.value) + '</b><span>' + t(i.label) + '</span></div>';
    }).join('');
    if (!items) return '';
    return '<section class="trust" id="trust"><div class="wrap"><div class="trust__box rv">' + items + '</div></div></section>';
  };

  R.screens = function (c, tone) {
    var x = c.screens, cases = isOn(c, 'cases');
    var cards = arr(x.items).filter(vis).map(function (s) {
      var specs = arr(s.specs).filter(vis).map(function (p) { return '<div class="kv"><dt>' + t(p.k) + '</dt><dd>' + t(p.v) + '</dd></div>'; }).join('');
      var rate = Number(s.rate) > 0 ? '<span class="scard__price">от ' + fmt(s.rate) + ' ₽/м²</span>' : '<span class="scard__price scard__price--muted">Расчёт по проекту</span>';
      return '<article class="scard rv">' +
        '<div class="scard__media">' + vmedia(s.video || videoByPoster(c, s.image), s.image, 'scard__v', s.name) +
        '<span class="scard__ic">' + svg(SCREEN_ICONS[s.id] || 'monitor') + '</span>' + rate + '</div>' +
        '<div class="scard__body"><h3 class="scard__title">' + t(s.name) + '</h3><p class="scard__desc">' + t(s.desc) + '</p>' +
        (specs ? '<dl class="scard__specs">' + specs + '</dl>' : '') +
        '<div class="scard__actions">' +
        ask('Рассчитать', 'btn--tint', { title: 'Расчёт: ' + plain(s.name), sub: 'Укажите размеры и телефон, пришлём конфигурацию и смету с монтажом', product: s.name, type: s.id }) +
        (cases ? '<a class="lbtn" href="#cases" data-case-filter="' + esc(s.caseFilter || 'all') + '">Примеры ' + svg('arrow') + '</a>' : '') +
        '</div></div></article>';
    }).join('');
    var help = x.helpButton ? '<div class="sgrid__more rv">' + ask(x.helpButton, 'btn--outline btn--lg', { title: 'Помочь с выбором экрана', sub: 'Расскажите, где будет экран, подберём тип и шаг пикселя', icon: 'arrow' }) + '</div>' : '';
    return section('screens', tone, head(x) + '<div class="sgrid">' + cards + '</div>' + help);
  };

  R.cases = function (c, tone) {
    var x = c.cases, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var used = {};
    items.forEach(function (i) { arr(i.filters).forEach(function (f) { used[f] = 1; }); });
    var filters = arr(x.filters).filter(function (f) { return used[f.id]; });
    var pills = filters.length ? '<div class="pills rv" role="tablist" data-car-filters><button class="pill is-active" type="button" data-filter="all">' + t(x.allLabel || 'Все объекты') + '</button>' +
      filters.map(function (f) { return '<button class="pill" type="button" data-filter="' + esc(f.id) + '">' + t(f.label) + '</button>'; }).join('') + '</div>' : '';
    var tiles = items.map(function (i) {
      var facts = arr(i.facts).map(function (f) { return '<div class="tile__fact"><span>' + t(f.k) + '</span><b>' + t(f.v) + '</b></div>'; }).join('');
      var poster = i.poster ? media(i.poster) : '';
      return '<article class="tile" tabindex="0" role="button" aria-label="Смотреть видео: ' + attr(i.title) + '" data-type="' + esc(arr(i.filters).join(' ')) + '"' +
        ' data-video="' + media(i.video) + '" data-poster="' + poster + '" data-title="' + attr(i.title) + '" data-kind="' + attr(i.type) + '" data-desc="' + attr(i.desc) + '">' +
        (poster ? '<img class="tile__bd" src="' + poster + '" alt="" loading="lazy" aria-hidden="true">' : '') +
        (i.video ? '<video class="tile__v" muted loop playsinline preload="none"' + (poster ? ' poster="' + poster + '"' : '') + '><source src="' + media(i.video) + '" type="video/mp4"></video>'
          : (poster ? '<img class="tile__v" src="' + poster + '" alt="">' : '')) +
        '<span class="tile__shade"></span>' +
        (i.type ? '<span class="tile__type">' + t(i.type) + '</span>' : '') +
        '<span class="tile__more"><span class="tile__more-ic">' + svg('play') + '</span><span class="tile__more-t">Смотреть объект</span></span>' +
        '<div class="tile__info"><h3 class="tile__title">' + t(i.title) + '</h3>' + (facts ? '<div class="tile__facts">' + facts + '</div>' : '') + '</div></article>';
    }).join('');
    var arrows = '<div class="car__arrows"><button class="car__arrow" type="button" data-car-prev aria-label="Назад">' + svg('left') + '</button>' +
      '<button class="car__arrow" type="button" data-car-next aria-label="Вперёд">' + svg('right') + '</button></div>';
    var nudge = '<div class="nudge rv"><div class="nudge__ic">' + svg('camera') + '</div><div class="nudge__txt"><b>Хотите такой же экран?</b><span>Пришлите фото места, посчитаем за день</span></div>' +
      ask('Хочу такой же экран', 'btn--primary btn--lg', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом', icon: 'arrow' }) + '</div>';
    return section('cases', tone,
      head(x, { split: true, left: true, right: arrows }) + pills +
      '<div class="car rv" data-car><div class="car__track" data-car-track>' + tiles + '</div></div>' +
      '<div class="car__foot"><div class="car__dots" data-car-dots></div><span class="car__hint">Нажмите на объект, чтобы открыть видео со звуком</span></div>' + nudge,
      'cases');
  };

  R.included = function (c, tone) {
    var x = c.included, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var warranty = items.filter(function (i) { return i.icon === 'shield' || /гарант/i.test(plain(i.title)); })[0];
    var photos = items.filter(function (i) { return i !== warranty && BENTO_MEDIA[i.icon]; })
      .sort(function (a, b) { return Object.keys(BENTO_MEDIA).indexOf(a.icon) - Object.keys(BENTO_MEDIA).indexOf(b.icon); }).slice(0, 2);
    var singles = items.filter(function (i) { return i !== warranty && photos.indexOf(i) < 0; });
    /* сетка 4 колонки: гарантия 2×1, видео-плитки 2×1, остальные 1×1; недостающие клетки добираем широкими плитками в конце */
    var cells = (warranty ? 2 : 0) + photos.length * 2 + singles.length;
    var need = (4 - cells % 4) % 4;
    var wideFrom = singles.length - Math.min(need, singles.length);
    var oddMd = wideFrom % 2 === 1; /* на планшете 2 колонки: нечётную одиночную плитку тоже растягиваем */

    function linkFor(i) {
      var l = BENTO_LINKS[i.icon];
      return l && isOn(c, l[1]) ? '<a class="bento__link" href="#' + l[1] + '">' + l[0] + ' ' + svg('arrow') + '</a>' : '';
    }
    function single(i, n) {
      var wide = n >= wideFrom, wideMd = !wide && oddMd && n === wideFrom - 1;
      return '<div class="bento__cell bento__cell--plain' + (wide ? ' bento__cell--wide' : '') + (wideMd ? ' bento__cell--wide-md' : '') + ' rv">' +
        '<span class="bento__ic">' + svg(i.icon) + '</span><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p>' + linkFor(i) + '</div>';
    }
    function warrantyTile(i) {
      var src = plain(i.text + ' ' + i.title);
      var m = src.match(/(\d+[.,]?\d*)\s*(года|год|лет)/i);
      var parts = plain(i.text).replace(/\.\s*$/, '').split(/,\s*/).filter(function (p) { return p && !(m && p.indexOf(m[0]) > -1); });
      var big = m ? '<div class="bento__num"><b>' + esc(m[1]) + '</b><span>' + esc(m[2]) + '</span></div>' : '';
      var body = parts.length >= 2
        ? '<ul class="bento__list">' + parts.map(function (p) { return '<li>' + svg('tick') + '<span>' + t(p.charAt(0).toUpperCase() + p.slice(1)) + '</span></li>'; }).join('') + '</ul>'
        : '<p>' + t(i.text) + '</p>';
      return '<div class="bento__cell bento__cell--warranty rv"><span class="bento__rays" aria-hidden="true"></span>' +
        '<span class="bento__chip">' + svg(i.icon) + t(i.title) + '</span>' + big + body + '</div>';
    }
    function photoTile(i) {
      var m = BENTO_MEDIA[i.icon];
      return '<div class="bento__cell bento__cell--photo rv">' + vmedia(m.video, m.img, 'bento__media') + '<span class="bento__shade"></span>' +
        '<span class="bento__ic bento__ic--glass">' + svg(i.icon) + '</span><div class="bento__body"><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></div></div>';
    }
    /* порядок: [гарантия ×2, a, b] [c, видео ×2, d] [видео ×2, e, …] */
    var html = warranty ? warrantyTile(warranty) : '';
    var slots = [3, 4]; /* после скольких одиночных плиток вставлять видео-плитки */
    singles.forEach(function (i, n) {
      photos.forEach(function (p, k) { if (slots[k] === n) html += photoTile(p); });
      html += single(i, n);
    });
    photos.forEach(function (p, k) { if (slots[k] >= singles.length) html += photoTile(p); });
    return section('included', tone, head(x) + '<div class="bento">' + html + '</div>');
  };

  R.process = function (c, tone) {
    var x = c.process, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var steps = items.map(function (i, n) {
      var num = (n + 1 < 10 ? '0' : '') + (n + 1);
      var accent = n === 0 || n === items.length - 1;
      return '<li class="step' + (accent ? ' step--accent' : '') + ' rv"><span class="step__n">' + num + '</span>' +
        '<h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p>' +
        (i.term ? '<span class="step__term">' + svg('clock') + '<span>' + t(i.term) + '</span></span>' : '') + '</li>';
    }).join('');
    return section('process', tone, head(x) + '<ol class="steps" style="--n:' + items.length + '">' + steps + '</ol>');
  };

  R.calc = function (c, tone) {
    var x = c.calc;
    var types = arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && Number(s.rate) > 0; });
    if (!types.length) return '';
    var def = types.some(function (s) { return s.id === x.defaultType; }) ? x.defaultType : types[0].id;
    var chips = types.map(function (s) {
      return '<label class="tchip"><input type="radio" name="calctype" value="' + esc(s.id) + '" data-rate="' + Number(s.rate) + '" data-px="' + attr(s.px) + '" data-name="' + attr(s.shortName || s.name) + '"' + (s.id === def ? ' checked' : '') + '>' +
        '<span>' + svg(SCREEN_ICONS[s.id] || 'monitor') + '<b>' + t(s.name) + '</b><small>от ' + fmt(s.rate) + ' ₽/м²' + (s.px ? ' · ' + t(s.px) : '') + '</small></span></label>';
    }).join('');
    function dim(name, label, val) {
      return '<div class="dim"><span class="dim__l">' + label + '</span><div class="dim__ctl">' +
        '<button type="button" class="dim__b" data-step="' + name + ':-0.5" aria-label="Уменьшить">−</button>' +
        '<input type="number" name="' + name + '" min="0.5" max="200" step="0.1" inputmode="decimal" value="' + val + '" aria-label="' + label + '">' +
        '<button type="button" class="dim__b" data-step="' + name + ':0.5" aria-label="Увеличить">+</button></div></div>';
    }
    var form = '<form class="calc__form" data-calc data-mount-share="' + Number(x.mountShare || 0) + '" novalidate>' +
      '<div class="calc__col"><div class="calc__lbl">Тип экрана</div><div class="calc__types">' + chips + '</div></div>' +
      '<div class="calc__col"><div class="calc__lbl">Размер экрана, метры</div><div class="calc__dims">' + dim('w', 'Ширина', Number(x.defaultWidth || 6)) + '<span class="calc__x">×</span>' + dim('h', 'Высота', Number(x.defaultHeight || 3)) + '</div>' +
      '<label class="switch"><input type="checkbox" name="mount" checked><i></i><span>' + t(x.mountLabel || 'Включить монтаж') + '</span></label>' +
      (x.formSub ? '<p class="calc__hint">' + t(x.formSub) + '</p>' : '') + '</div>' +
      '</form>';
    var out = '<div class="calc__out"><div class="calc__res"><span class="calc__k">Ориентировочная стоимость</span>' +
      '<div class="calc__price" data-out="price">—</div>' +
      '<dl class="calc__rows">' +
      '<div><dt>Тип</dt><dd data-out="type">—</dd></div>' +
      '<div><dt>Площадь</dt><dd data-out="area">—</dd></div>' +
      '<div><dt>Шаг пикселя</dt><dd data-out="px">—</dd></div>' +
      '<div><dt>Экран, за м²</dt><dd data-out="rate">—</dd></div>' +
      '<div><dt>Монтаж и конструкция</dt><dd data-out="mount">—</dd></div>' +
      '</dl></div>' +
      '<div class="calc__act">' + ask(x.button || 'Получить точную смету', 'btn--primary btn--lg btn--glow', { title: 'Получить точную смету', sub: 'Пришлём спецификацию и смету с монтажом в течение рабочего дня', product: 'Экран по калькулятору', extra: ' data-calc-ask', icon: 'arrow' }) + '</div></div>';
    return section('calc', tone, head(x) + '<div class="calc rv">' + (x.formTitle ? '<div class="calc__fh"><h3>' + t(x.formTitle) + '</h3></div>' : '') + form + out +
      (x.excludes ? '<p class="calc__note">' + t(x.excludes) + '</p>' : '') + '</div>', 'calcsec');
  };

  R.specs = function (c, tone) {
    var x = c.specs, rows = arr(x.rows).filter(vis);
    if (!rows.length) return '';
    var th = ['Шаг пикселя', 'Расстояние просмотра', 'Где применяется', 'Тип экрана', 'Яркость'];
    var body = rows.map(function (r) {
      return '<tr><td data-l="' + th[0] + '"><span class="px">' + t(r.px) + '</span></td><td data-l="' + th[1] + '"><b>' + t(r.dist) + '</b></td><td data-l="' + th[2] + '">' + t(r.where) +
        '</td><td data-l="' + th[3] + '">' + t(r.type) + '</td><td data-l="' + th[4] + '"><span class="muted">' + t(r.bright) + '</span></td></tr>';
    }).join('');
    return section('specs', tone, head(x) +
      '<div class="stbl rv"><table><thead><tr>' + th.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>', 'specsec');
  };

  R.about = function (c, tone) {
    var x = c.about, s = c.settings || {};
    var docs = arr(x.docs).filter(vis).map(function (d) { return '<li class="rv"><span class="adoc__ic">' + svg(d.icon) + '</span><span>' + t(d.text) + '</span></li>'; }).join('');
    /* подпись к фото берём из объекта с тем же кадром, иначе название компании */
    var src = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && x.image && i.poster === x.image; })[0];
    var capL = src ? t(src.title) : t(s.companyName || x.title), capR = src ? t(src.type) : t(s.brandName);
    return section('about', tone, '<div class="about">' +
      '<div class="about__main">' + (x.eyebrow ? '<span class="eyebrow rv">' + t(x.eyebrow) + '</span>' : '') +
      '<h2 class="h2 rv">' + t(x.title) + '</h2><div class="about__text rv">' + paras(x.text) + '</div>' +
      (docs ? '<ul class="about__docs">' + docs + '</ul>' : '') + '</div>' +
      (x.image || x.video ? '<figure class="about__photo rv"><div class="about__img">' + vmedia(x.video || (src && src.video), x.image || (src && src.poster), 'about__v', x.title) + '</div>' +
        '<figcaption><span>' + capL + '</span><b>' + capR + '</b></figcaption></figure>' : '') +
      '</div>');
  };

  R.reviews = function (c, tone) {
    var x = c.reviews, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var cards = items.map(function (r) {
      var n = Math.max(0, Math.min(5, Number(r.stars) || 0));
      var stars = '';
      for (var k = 0; k < n; k++) stars += svg('star', 'star');
      return '<figure class="rev rv">' + (n ? '<div class="rev__stars" aria-label="' + n + ' из 5">' + stars + '</div>' : '') +
        '<blockquote>' + t(r.text) + '</blockquote>' +
        '<figcaption class="rev__who"><b>' + t(r.name) + '</b><small>' + t(r.object) + '</small></figcaption></figure>';
    }).join('');
    return section('reviews', tone, head(x) + '<div class="revs">' + cards + '</div>');
  };

  R.cta = function (c) {
    var x = c.cta, s = c.settings || {};
    return '<section class="band" id="cta"><span class="band__glow" aria-hidden="true"></span><div class="wrap band__in rv">' +
      '<div class="band__txt"><h2>' + t(x.title) + '</h2>' + (x.text ? '<p>' + t(x.text) + '</p>' : '') + '</div>' +
      '<div class="band__btns">' + ask(x.button || 'Оставить заявку', 'btn--white btn--lg', { title: x.title, sub: x.text, icon: 'camera' }) +
      (x.showPhone && s.phone ? '<a class="band__phone" href="' + tel(s.phone) + '">' + svg('phone') + esc(s.phone) + '</a>' : '') +
      '</div></div></section>';
  };

  R.faq = function (c, tone) {
    var x = c.faq, s = c.settings || {}, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var list = items.map(function (q, n) {
      var id = 'faq-a-' + n;
      return '<div class="faq__item' + (q.open ? ' is-open' : '') + ' rv"><button class="faq__q" type="button" aria-expanded="' + (q.open ? 'true' : 'false') + '" aria-controls="' + id + '">' +
        '<span>' + t(q.q) + '</span><span class="faq__ic" aria-hidden="true">' + svg('chevron') + '</span></button>' +
        '<div class="faq__a" id="' + id + '" role="region"><div class="faq__ain">' + paras(q.a) + '</div></div></div>';
    }).join('');
    var aside = '<div class="faq__ask rv"><span class="faq__ask-ic">' + svg('phone') + '</span><div><b>Не нашли ответ?</b><span>' + t(s.contactName) + ' ответит на вопросы по экрану и монтажу</span></div>' +
      (s.phone ? '<a class="faq__tel" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + '</div>';
    return section('faq', tone, head(x) + '<div class="faq">' + list + aside + '</div>');
  };

  R.contacts = function (c, tone) {
    var x = c.contacts, s = c.settings || {};
    var initials = plain(s.contactName).split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    var msgs = messengers(c, 'msg');
    function row(icon, main, note) {
      return '<li><span class="clist__ic">' + svg(icon) + '</span><div>' + main + (note ? '<small>' + t(note) + '</small>' : '') + '</div></li>';
    }
    var left = '<div class="contacts__info">' + (x.eyebrow ? '<span class="eyebrow rv">' + t(x.eyebrow) + '</span>' : '') +
      '<h2 class="h2 rv">' + t(x.title) + '</h2>' + (x.sub ? '<p class="shead__sub rv">' + t(x.sub) + '</p>' : '') +
      '<div class="person rv"><span class="person__ava">' + esc(initials) + '<i class="live"></i></span><div><b>' + t(s.contactName) + '</b><span>' + t(s.contactRole) + '</span></div></div>' +
      '<ul class="clist rv">' +
      (s.phone ? row('phone', '<a class="clist__main" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>', s.hours) : '') +
      (s.email ? row('mail', '<a class="clist__main" href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>', s.emailNote) : '') +
      (s.address ? row('pin', '<span class="clist__main">' + t(s.address) + '</span>', s.addressNote) : '') +
      '</ul>' + (msgs ? '<div class="msgs rv">' + msgs + '</div>' : '') + '</div>';
    var form = '<form class="cform rv" data-done="' + attr(s.formDone) + '">' +
      '<h3>' + t(x.formTitle) + '</h3>' + (x.formSub ? '<p class="cform__sub">' + t(x.formSub) + '</p>' : '') +
      '<div class="frow"><label class="fld"><span>Имя</span><input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name"></label>' +
      '<label class="fld"><span>Телефон</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label></div>' +
      '<div class="frow"><label class="fld"><span>Email (необязательно)</span><input type="email" name="email" placeholder="Для отправки спецификации" autocomplete="email"></label>' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label></div>' +
      '<label class="fld"><span>Задача</span><textarea name="task" rows="3" placeholder="Где будет экран, примерные размеры, что показывать, сроки"></textarea></label>' +
      '<label class="upload">' + svg('clip') + '<span>Прикрепить фото объекта или чертёж</span><input type="file" hidden></label>' +
      submitBtn(x.formButton || 'Отправить заявку', 'btn--primary btn--lg btn--block btn--glow') +
      consent(c, 'Соглашаюсь с') + '</form>';
    return section('contacts', tone, '<div class="contacts">' + left + form + '</div>', 'contactsec');
  };

  R.footer = function (c) {
    var x = c.footer || {}, s = c.settings || {};
    return '<footer class="foot"><div class="wrap"><div class="foot__grid">' +
      '<div class="foot__brand"><a class="foot__logo" href="#top">' + '<img class="brand-logo" src="../logos/v3-logo-white.svg" alt="' + attr(s.brandName) + '" width="183" height="48">' + '</a>' +
      (x.about ? '<p>' + t(x.about) + '</p>' : '') + '</div>' +
      '<nav class="foot__col"><h4>Разделы</h4>' + menuLinks(c) + '</nav>' +
      '<div class="foot__col"><h4>Связь</h4>' + (s.phone ? '<a class="foot__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.hours ? '<span class="foot__note">' + t(s.hours) + '</span>' : '') +
      (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') + messengers(c, 'foot__msg') + '</div>' +
      '</div><div class="foot__legal"><div><span>' + t(s.companyName) + '. ' + t(x.legal) + '</span>' + (x.note ? '<span>' + t(x.note) + '</span>' : '') + '</div>' +
      '<a href="' + attr(s.policyUrl || '#') + '">Политика обработки персональных данных</a></div></div></footer>';
  };

  R.mbar = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="mbar" data-mbar>' + (s.phone ? '<a class="mbar__call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + svg('phone') + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'btn--primary btn--lg btn--block', { title: h.formTitle, sub: h.formSub }) + '</div>';
  };

  R.modal = function (c) {
    var s = c.settings || {}, h = c.hero || {}, cl = c.calc || {};
    return '<div class="modal" data-modal aria-hidden="true"><div class="modal__bg" data-close-modal></div>' +
      '<div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<button class="modal__x" type="button" data-close-modal aria-label="Закрыть">' + svg('close') + '</button>' +
      '<img class="modal__mark modal__mark--img" src="../logos/v3-mark.svg" alt="" width="44" height="44">' +
      '<h3 id="modal-title" data-m-title>' + t(h.formTitle || 'Получить расчёт экрана') + '</h3>' +
      '<p class="modal__sub" data-m-sub>' + t(h.formSub || '') + '</p>' +
      '<div class="modal__prod" data-m-prod hidden>Задача: <b></b></div>' +
      '<form class="mform" data-done="' + attr(s.formDone) + '" data-default-title="' + attr(h.formTitle || 'Получить расчёт экрана') + '" data-default-sub="' + attr(h.formSub || '') + '">' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c, cl.defaultType) + '</select></label>' +
      '<div class="frow frow--2"><label class="fld"><span>Ширина, м</span><input type="text" name="w" inputmode="decimal" placeholder="' + Number(cl.defaultWidth || 6) + '"></label>' +
      '<label class="fld"><span>Высота, м</span><input type="text" name="h" inputmode="decimal" placeholder="' + Number(cl.defaultHeight || 3) + '"></label></div>' +
      '<label class="fld"><span>Телефон</span><input type="tel" name="phone" placeholder="+7" required autocomplete="tel"></label>' +
      submitBtn(h.formButton || 'Получить расчёт', 'btn--primary btn--lg btn--block btn--glow') +
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
      ask('Хочу такой же экран', 'btn--primary btn--lg', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом', extra: ' data-lb-ask', icon: 'arrow' }) +
      '</div></div></div>';
  };

  /* Тёмные только объекты и калькулятор (там светятся экраны) и подвал; светлые чередуются белый / #F8FAFC */
  var DARK = { cases: 1, calc: 1 };

  function render(c) {
    c.settings = c.settings || {};
    var parts = [R.header(c), R.sheet(c), '<main id="main">', R.hero(c)];
    var light = 1;
    arr(c.blocks).forEach(function (b) {
      if (b.visible === false || !R[b.id] || !c[b.id]) return;
      var tone;
      if (b.id === 'trust' || b.id === 'cta') tone = '';
      else if (DARK[b.id]) tone = 'dark';
      else { tone = light % 2 ? 'soft' : 'white'; light++; }
      var html = R[b.id](c, tone);
      if (html) parts.push(html);
    });
    parts.push('</main>', R.footer(c), R.mbar(c), R.modal(c), R.lightbox(c));
    var app = document.getElementById('app');
    app.innerHTML = parts.join('');
    if (c.meta) {
      document.title = plain(c.meta.title);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', plain(c.meta.description));
    }
    if (window.V3App) window.V3App.init(c);
  }

  window.V3Render = { render: render, plain: plain };

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
