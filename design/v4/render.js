/* Вариант 4 · Сцена. Визуальный язык из макета дизайнера (led.addu.fun): первый экран-сцена с залом,
   шрифт Wix Madefor Display, синий #3054ff, кнопки-пилюли с прокруткой текста, цифры-барабаны,
   спокойная редакционная вёрстка на линиях вместо карточек с иконками.
   Контент только из ../../content/landing.json (тот же файл правит админка).
   Порядок и видимость блоков из blocks, пункты меню из blocks[].menu.
   [[текст]] выводится как обычный текст, \n превращается в перенос строки.
   Точка в конце однофразовых подписей не выводится (soft), длинные абзацы остаются как есть. */
(function () {
  'use strict';

  var ROOT = '../../';
  var ICONS = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    left: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    right: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    play: '<path d="M9 6v12l10-6Z" fill="currentColor" stroke="none"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    clip: '<path d="M21.4 11.1 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.1a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'
  };
  var MSG = {
    whatsapp: ['WhatsApp', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'],
    telegram: ['Telegram', '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.2 1.4 11.7c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>'],
    max: ['MAX', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5l8 9 8-9v14"/></svg>']
  };
  /* Видео-полоса в «Что входит»: у пунктов в JSON нет медиа, берём ролик монтажа из assets/video */
  var INCLUDED_MEDIA = { video: 'assets/video/case-pedestrian-bridge-night.mp4', poster: 'assets/video/case-pedestrian-bridge-night.jpg' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  /* неразрывный пробел после коротких слов: «с», «и», «на» не остаются в конце строки */
  function nb(s) { return s.replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2 ').replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2 '); }
  function t(s) { return nb(esc(plain(s))).replace(/\n/g, '<br>'); }
  /* Подпись из одной фразы показываем без точки в конце: так читается как подпись, а не как справка */
  function soft(s) {
    var p = plain(s).trim();
    if (/^[^.!?]+\.$/.test(p)) p = p.slice(0, -1);
    return nb(esc(p)).replace(/\n/g, '<br>');
  }
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
  /* Видео с постером: muted loop playsinline, играет только в кадре (app.js) */
  function vmedia(video, poster, cls, alt) {
    if (video) return '<video class="' + cls + '" muted loop playsinline preload="metadata" data-autoplay' + (poster ? ' poster="' + media(poster) + '"' : '') +
      (alt ? ' aria-label="' + attr(alt) + '"' : '') + '><source src="' + media(video) + '" type="video/mp4"></video>';
    return poster ? '<img class="' + cls + '" src="' + media(poster) + '" alt="' + attr(alt || '') + '" loading="lazy">' : '';
  }
  function videoByPoster(c, img) {
    if (!img) return '';
    var m = arr(c.cases && c.cases.items).filter(function (i) { return i.poster === img && i.video; })[0];
    return m ? m.video : '';
  }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }
  function svg(name, cls, sw) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>'; }
  function vis(x) { return x && x.visible !== false; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function isOn(c, id) { return arr(c.blocks).some(function (b) { return b.id === id && b.visible !== false; }) && !!c[id]; }
  function fmt(n) { return Number(n || 0).toLocaleString('ru-RU'); }
  function two(n) { return (n < 9 ? '0' : '') + (n + 1); }
  /* «Уличный: фасад, медиафасад» → «Уличный» */
  function shortType(s) { return plain(s.shortName || s.name).split(':')[0].trim(); }

  /* Кнопка из макета: пилюля, текст прокручивается при наведении, стрелка в круге */
  function inner(label, icon) {
    return '<span class="mbtn__roll"><span>' + label + '</span><span aria-hidden="true">' + label + '</span></span>' +
      '<span class="mbtn__dot">' + svg(icon || 'arrow', 'ic--' + (icon || 'arrow')) + '</span>';
  }
  function mbtn(label, cls, href, extra, icon) {
    return '<a class="mbtn ' + (cls || '') + '" href="' + (href || '#') + '"' + (extra || '') + '>' + inner(label, icon) + '</a>';
  }
  function ask(label, cls, o) {
    o = o || {};
    var a = ' data-ask' +
      (o.title ? ' data-ask-title="' + attr(o.title) + '"' : '') +
      (o.sub ? ' data-ask-sub="' + attr(o.sub) + '"' : '') +
      (o.product ? ' data-ask-product="' + attr(o.product) + '"' : '') +
      (o.type ? ' data-ask-type="' + esc(o.type) + '"' : '') + (o.extra || '');
    return mbtn(t(label), cls, '#', a, o.icon);
  }
  function submitBtn(label, cls) {
    return '<button class="mbtn ' + cls + '" type="submit">' + inner(t(label)) + '</button>';
  }
  function messengers(c, cls) {
    var s = c.settings || {};
    return ['whatsapp', 'telegram', 'max'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a class="' + (cls || 'msg') + '" href="' + attr(s[k]) + '" target="_blank" rel="noopener">' + MSG[k][1] + '<span>' + MSG[k][0] + '</span></a>';
    }).join('');
  }
  function menuLinks(c) {
    return arr(c.blocks).filter(function (b) { return b.visible !== false && b.menu && c[b.id]; }).map(function (b) {
      return '<a href="#' + esc(b.id) + '">' + esc(b.menu) + '</a>';
    }).join('');
  }
  function typeOptions(c, selected) {
    return arr(c.screens && c.screens.items).filter(vis).map(function (s) {
      return '<option value="' + esc(s.id) + '"' + (s.id === selected ? ' selected' : '') + '>' + esc(plain(s.shortName || s.name)) + '</option>';
    }).join('') + '<option value="other">' + esc(plain((c.settings || {}).formOther || 'Не знаю, нужна консультация')) + '</option>';
  }
  function consent(c) {
    return '<label class="consent"><input type="checkbox" checked required><span>Отправляя форму, соглашаюсь с ' +
      '<a href="' + attr((c.settings || {}).policyUrl || '#') + '">политикой обработки персональных данных</a></span></label>';
  }

  /* Заголовок секции из макета: слева подпись и h2, справа подзаголовок по нижнему краю */
  function intro(x, right) {
    var side = right != null ? right : (x.sub ? '<p class="intro__sub">' + soft(x.sub) + '</p>' : '');
    return '<div class="intro rv"><div class="intro__main">' +
      (x.eyebrow ? '<p class="label">' + t(x.eyebrow) + '</p>' : '') +
      '<h2 class="h2">' + t(x.title) + '</h2></div>' + (side ? '<div class="intro__side">' + side + '</div>' : '') + '</div>';
  }
  function section(id, tone, body, cls) {
    return '<section class="sec sec--' + tone + (cls ? ' ' + cls : '') + '" id="' + esc(id) + '"><div class="wrap">' + body + '</div></section>';
  }

  var R = {};

  R.header = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<header class="hdr"><a class="hdr__brand" href="#top" aria-label="' + attr(s.brandName) + ' — на главную">' +
      '<img src="../logos/v3-logo-white.svg" alt="' + attr(s.brandName) + '" width="146" height="37"></a>' +
      '<nav class="hdr__nav" aria-label="Разделы">' + menuLinks(c) + '</nav>' +
      '<div class="hdr__contacts">' +
      (s.phone ? '<a class="hdr__phone" href="' + tel(s.phone) + '"><span>' + esc(s.phone) + '</span>' +
        (s.phoneNote ? '<small><i class="pulse" aria-hidden="true"></i>' + t(s.phoneNote) + '</small>' : '') + '</a>' : '') +
      (s.email ? '<a class="hdr__mail" href="mailto:' + attr(s.email) + '">' + svg('mail', '', 1.5) + '<span>' + esc(s.email) + '</span></a>' : '') +
      '</div>' +
      ask(s.headerButton || 'Получить расчёт', 'mbtn--blue mbtn--sm hdr__cta', { title: h.formTitle, sub: h.formSub }) +
      (s.phone ? '<a class="hdr__call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + svg('phone') + '</a>' : '') +
      '<button class="hdr__burger" type="button" data-open-menu aria-label="Открыть меню"><i></i><i></i></button></header>';
  };

  R.sheet = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="sheet" data-sheet aria-hidden="true"><div class="sheet__bg" data-close-menu></div>' +
      '<div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Меню">' +
      '<div class="sheet__top"><span class="sheet__note"><i class="pulse" aria-hidden="true"></i>' + t(s.phoneNote || s.hours) + '</span>' +
      '<button class="sheet__x" type="button" data-close-menu aria-label="Закрыть меню">' + svg('close') + '</button></div>' +
      '<nav class="sheet__links">' + menuLinks(c) + '</nav>' +
      '<div class="sheet__foot">' +
      (s.phone ? '<a class="sheet__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'mbtn--blue mbtn--block', { title: h.formTitle, sub: h.formSub }) +
      '</div></div></div>';
  };

  /* Первый экран-сцена. Видео на весь экран, при прокрутке экран «монтируется» на стену зала (scene.js) */
  R.hero = function (c) {
    var h = c.hero || {};
    var title = h.titleShort || h.h1;
    var b2 = isOn(c, 'cases') && h.button2 ? mbtn(t(h.button2), 'mbtn--white', '#cases', '', 'play') : '';
    var facts = arr(h.facts).map(function (x) { return '<li><b>' + t(x.title) + '</b>' + (x.text ? '<span>' + soft(x.text) + '</span>' : '') + '</li>'; }).join('');
    var vid = h.video
      ? '<video class="screen__video" autoplay muted loop playsinline preload="auto"' + (h.poster ? ' poster="' + media(h.poster) + '"' : '') + ' src="' + media(h.video) + '"></video>'
      : (h.poster ? '<img class="screen__video" src="' + media(h.poster) + '" alt="">' : '');
    return '<section class="scene" id="top" data-scene aria-label="LED-экран в пространстве"><div class="scene__stage">' +
      '<div class="scene__room" aria-hidden="true"></div>' +
      '<div class="screen" data-screen>' +
      '<div class="screen__bg" aria-hidden="true">' + vid + '<span class="screen__shade"></span><span class="screen__dots"></span><span class="screen__seams"></span></div>' +
      '<div class="screen__head">' +
      (h.badge ? '<p class="screen__pre">' + soft(h.badge) + '</p>' : '') +
      '<h1 class="screen__h1">' + t(title) + '</h1>' +
      '<div class="screen__actions">' + ask(h.button1 || 'Рассчитать стоимость', 'mbtn--blue mbtn--hero', { title: h.formTitle, sub: h.formSub }) +
      (b2 ? b2.replace('class="mbtn ', 'class="mbtn mbtn--hero ') : '') + '</div></div>' +
      (h.lead ? '<p class="screen__support">' + soft(h.lead) + '</p>' : '') +
      '</div>' +
      (facts ? '<ul class="scene__facts" aria-label="Коротко">' + facts + '</ul>' : '') +
      '</div></section>';
  };

  /* Цифры доверия: барабаны прокручиваются до значения при появлении */
  R.trust = function (c) {
    var h = c.hero || {};
    var items = arr(c.trust && c.trust.items).filter(vis).map(function (i) {
      var v = plain(i.value).trim();
      return '<div class="proof__item"><p class="proof__v" data-wheel="' + esc(v) + '">' + esc(v) + '</p><p class="proof__c">' + soft(i.label) + '</p></div>';
    }).join('');
    if (!items) return '';
    return '<section class="proof" id="trust" aria-label="В цифрах">' +
      (h.video ? '<div class="proof__light" aria-hidden="true"><video muted loop playsinline preload="none" data-autoplay src="' + media(h.video) + '"></video></div>' : '') +
      '<div class="wrap proof__grid">' + items + '</div><div class="proof__exit" aria-hidden="true"></div></section>';
  };

  /* Типы экранов: список строк слева, видео и характеристики выбранного справа (на телефоне раскрывается под строкой) */
  R.screens = function (c, tone) {
    var x = c.screens, cases = isOn(c, 'cases');
    var items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var rows = items.map(function (s, n) {
      var on = n === 0;
      var specs = arr(s.specs).filter(vis).map(function (p) { return '<div><dt>' + t(p.k) + '</dt><dd>' + t(p.v) + '</dd></div>'; }).join('');
      var price = Number(s.rate) > 0 ? '<p class="pick__price"><span>ориентир</span>от ' + fmt(s.rate) + ' ₽ за м²</p>' : '<p class="pick__price"><span>цена</span>по проекту</p>';
      return '<button class="pick__row' + (on ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + on + '" data-pick-id="' + esc(s.id) + '">' +
        '<span class="pick__n">' + two(n) + '</span><span class="pick__name">' + t(s.name) + '</span>' +
        (s.px ? '<span class="pick__px">' + t(s.px) + '</span>' : '<span class="pick__px"></span>') + svg('arrow', 'pick__ar') + '</button>' +
        '<div class="pick__panel' + (on ? ' is-active' : '') + '" data-pick-panel="' + esc(s.id) + '" role="tabpanel">' +
        '<div class="pick__media">' + vmedia(s.video || videoByPoster(c, s.image), s.image, 'pick__v', s.name) + '</div>' +
        '<div class="pick__body"><p class="pick__desc">' + soft(s.desc) + '</p>' + price + '</div>' +
        (specs ? '<dl class="pick__specs">' + specs + '</dl>' : '') +
        '<div class="pick__btns">' +
        ask('Рассчитать этот экран', 'mbtn--blue', { title: 'Расчёт: ' + plain(s.name), sub: 'Укажите размеры и телефон, пришлём конфигурацию и смету с монтажом', product: s.name, type: s.id }) +
        (cases && s.caseFilter ? '<a class="lnk" href="#cases" data-case-filter="' + esc(s.caseFilter) + '">Смотреть объекты' + svg('arrow') + '</a>' : '') +
        '</div></div>';
    }).join('');
    var help = x.helpButton ? '<div class="pick__help"><p>Не знаете, какой нужен? Расскажите о месте, подберём тип и шаг пикселя</p>' +
      ask(x.helpButton, 'mbtn--ink', { title: 'Помочь с выбором экрана', sub: 'Расскажите, где будет экран, подберём тип и шаг пикселя' }) + '</div>' : '';
    return section('screens', tone, intro(x) + '<div class="pick rv" data-pick role="tablist" aria-label="Типы экранов">' + rows + '</div>' + help);
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
      var facts = arr(i.facts).map(function (f) { return '<span><i>' + t(f.k) + '</i>' + t(f.v) + '</span>'; }).join('');
      var poster = i.poster ? media(i.poster) : '';
      return '<article class="tile" tabindex="0" role="button" aria-label="Смотреть видео: ' + attr(i.title) + '" data-type="' + esc(arr(i.filters).join(' ')) + '"' +
        ' data-video="' + media(i.video) + '" data-poster="' + poster + '" data-title="' + attr(i.title) + '" data-kind="' + attr(i.type) + '" data-desc="' + attr(i.desc) + '">' +
        (poster ? '<img class="tile__bd" src="' + poster + '" alt="" loading="lazy" aria-hidden="true">' : '') +
        (i.video ? '<video class="tile__v" muted loop playsinline preload="none"' + (poster ? ' poster="' + poster + '"' : '') + '><source src="' + media(i.video) + '" type="video/mp4"></video>'
          : (poster ? '<img class="tile__v" src="' + poster + '" alt="">' : '')) +
        '<span class="tile__shade"></span>' +
        '<span class="tile__play">' + svg('play') + '</span>' +
        '<div class="tile__info">' + (i.type ? '<p class="tile__type">' + t(i.type) + '</p>' : '') + '<h3 class="tile__title">' + soft(i.title) + '</h3>' +
        (facts ? '<p class="tile__facts">' + facts + '</p>' : '') + '</div></article>';
    }).join('');
    var arrows = '<div class="car__arrows"><button class="car__arrow" type="button" data-car-prev aria-label="Назад">' + svg('left') + '</button>' +
      '<button class="car__arrow" type="button" data-car-next aria-label="Вперёд">' + svg('right') + '</button></div>';
    var nudge = '<div class="nudge rv"><p class="nudge__t">Хотите такой же экран?<span>Пришлите фото места, посчитаем за день</span></p>' +
      ask('Хочу такой же', 'mbtn--blue', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом' }) + '</div>';
    return section('cases', tone,
      intro(x, (x.sub ? '<p class="intro__sub">' + soft(x.sub) + '</p>' : '') + arrows) + pills +
      '<div class="car rv" data-car><div class="car__track" data-car-track>' + tiles + '</div></div>' +
      '<div class="car__foot"><div class="car__dots" data-car-dots></div><span class="car__hint">Нажмите на объект, чтобы посмотреть видео со звуком</span></div>' + nudge,
      'sec--screen');
  };

  /* Что входит: широкая видео-полоса с главной мыслью и восемь пунктов на линиях, без иконок */
  R.included = function (c, tone) {
    var x = c.included, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var warranty = items.filter(function (i) { return i.icon === 'shield' || /гарант/i.test(plain(i.title)); })[0];
    var big = warranty && plain(warranty.text).match(/\d+\s*(год[а-я]*|лет|мес[а-я]*)/i);
    var strip = '<div class="inc__strip rv">' + vmedia(INCLUDED_MEDIA.video, INCLUDED_MEDIA.poster, 'inc__v', 'Монтаж экрана') +
      '<span class="inc__shade" aria-hidden="true"></span>' +
      (x.sub ? '<p class="inc__lead">' + soft(x.sub) + '</p>' : '') +
      (big ? '<p class="inc__big"><b>' + esc(big[0]) + '</b><span>' + t(warranty.title).toLowerCase() + '</span></p>' : '') + '</div>';
    var list = items.map(function (i, n) {
      return '<li class="rv"><span class="inc__n">' + two(n) + '</span><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></li>';
    }).join('');
    return section('included', tone, intro(x, '') + strip + '<ol class="inc__list">' + list + '</ol>');
  };

  /* Как работаем: строки 01–05, срок справа синим */
  R.process = function (c, tone) {
    var x = c.process, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var rows = items.map(function (i, n) {
      return '<li class="step rv"><span class="step__n">' + two(n) + '</span><h3 class="step__t">' + t(i.title) + '</h3><p class="step__x">' + t(i.text) + '</p>' +
        (i.term ? '<p class="step__term">' + t(i.term) + '</p>' : '') + '</li>';
    }).join('');
    return section('process', tone, intro(x) + '<ol class="steps">' + rows + '</ol>');
  };

  R.calc = function (c, tone) {
    var x = c.calc;
    var types = arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && Number(s.rate) > 0; });
    if (!types.length) return '';
    var def = types.some(function (s) { return s.id === x.defaultType; }) ? x.defaultType : types[0].id;
    var chips = types.map(function (s) {
      return '<label class="chip"><input type="radio" name="calctype" value="' + esc(s.id) + '" data-rate="' + Number(s.rate) + '" data-name="' + attr(s.name) + '" data-px="' + attr(s.px) + '"' +
        (s.id === def ? ' checked' : '') + '><span>' + esc(shortType(s)) + '</span></label>';
    }).join('');
    function dim(name, label, val) {
      return '<div class="dim"><span class="dim__l">' + label + '</span><div class="dim__box">' +
        '<button type="button" data-step="' + name + ':-0.5" aria-label="Меньше">' + svg('minus') + '</button>' +
        '<input name="' + name + '" type="number" inputmode="decimal" min="0.5" step="0.5" value="' + Number(val || 1) + '" aria-label="' + label + ', м">' +
        '<button type="button" data-step="' + name + ':0.5" aria-label="Больше">' + svg('plus') + '</button></div><span class="dim__u">м</span></div>';
    }
    var row = function (k, label) { return '<div><dt>' + label + '</dt><dd data-out="' + k + '">—</dd></div>'; };
    return section('calc', tone,
      '<div class="calc">' +
      '<div class="calc__l rv">' + (x.eyebrow ? '<p class="label">' + t(x.eyebrow) + '</p>' : '') + '<h2 class="h2">' + t(x.title) + '</h2>' +
      (x.sub ? '<p class="calc__sub">' + t(x.sub) + '</p>' : '') + (x.excludes ? '<p class="calc__ex">' + t(x.excludes) + '</p>' : '') + '</div>' +
      '<form class="calc__f rv" data-calc data-mount-share="' + Number(x.mountShare || 0) + '" onsubmit="return false">' +
      '<p class="calc__lab">Тип экрана</p><div class="chips">' + chips + '</div>' +
      '<p class="calc__lab">Размер экрана</p><div class="dims">' + dim('w', 'Ширина', x.defaultWidth || 6) + '<span class="dims__x">×</span>' + dim('h', 'Высота', x.defaultHeight || 3) + '</div>' +
      '<label class="tgl"><input type="checkbox" name="mount" checked><i aria-hidden="true"></i><span>' + t(x.mountLabel || 'Включить монтаж') + '</span></label>' +
      '<div class="calc__out"><p class="calc__lab">Ориентировочная стоимость</p><p class="calc__price" data-out="price"></p>' +
      '<dl class="calc__rows">' + row('area', 'Площадь') + row('type', 'Тип') + row('px', 'Шаг пикселя') + row('rate', 'Ставка за м²') + row('mount', 'Монтаж и конструкция') + '</dl>' +
      ask(x.button || 'Получить точную смету', 'mbtn--blue mbtn--block', { title: 'Точная смета', sub: 'Пришлём конфигурацию и смету с монтажом в течение рабочего дня', extra: ' data-calc-ask' }) +
      '</div></form></div>', 'sec--screen');
  };

  R.specs = function (c, tone) {
    var x = c.specs, rows = arr(x.rows).filter(vis);
    if (!rows.length) return '';
    var body = rows.map(function (r) {
      return '<tr class="rv"><td class="st__px">' + t(r.px) + '</td><td class="st__d">' + t(r.dist) + '</td><td>' + t(r.where) + '</td><td>' + t(r.type) + '</td><td class="st__b">' + t(r.bright) + '</td></tr>';
    }).join('');
    return section('specs', tone, intro(x) +
      '<div class="st"><table><thead><tr><th>Шаг пикселя</th><th>Расстояние до зрителя</th><th>Где ставят</th><th>Тип экрана</th><th>Яркость</th></tr></thead><tbody>' + body + '</tbody></table></div>');
  };

  R.about = function (c, tone) {
    var x = c.about;
    var docs = arr(x.docs).filter(vis).map(function (d) { return '<li>' + soft(d.text) + '</li>'; }).join('');
    var src = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && x.image && i.poster === x.image; })[0];
    var vid = x.video || (src && src.video) || '';
    var cap = src ? soft(src.title) : t((c.settings || {}).brandName);
    return section('about', tone,
      '<div class="about">' +
      '<div class="about__t rv">' + (x.eyebrow ? '<p class="label">' + t(x.eyebrow) + '</p>' : '') + '<h2 class="h2 h2--m">' + t(x.title) + '</h2>' +
      '<div class="about__p">' + paras(x.text) + '</div>' + (docs ? '<ul class="about__docs">' + docs + '</ul>' : '') + '</div>' +
      ((vid || x.image) ? '<figure class="about__m rv">' + vmedia(vid, x.image, 'about__v', x.title) + '<figcaption>' + cap + '</figcaption></figure>' : '') +
      '</div>');
  };

  R.reviews = function (c, tone) {
    var x = c.reviews, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var cards = items.map(function (r) {
      return '<figure class="rev rv"><blockquote>' + t(r.text) + '</blockquote><figcaption><b>' + t(r.name) + '</b><span>' + soft(r.object) + '</span></figcaption></figure>';
    }).join('');
    return section('reviews', tone, intro(x, '') + '<div class="revs">' + cards + '</div>');
  };

  R.cta = function (c) {
    var x = c.cta, s = c.settings || {};
    return '<section class="band" id="cta"><div class="wrap band__in rv"><div><h2 class="h2">' + t(x.title) + '</h2>' + (x.text ? '<p>' + soft(x.text) + '</p>' : '') + '</div>' +
      '<div class="band__act">' + ask(x.button || 'Отправить фото', 'mbtn--white', { title: plain(x.title), sub: plain(x.text), icon: 'camera' }) +
      (x.showPhone && s.phone ? '<a class="band__phone" href="' + tel(s.phone) + '">или позвоните ' + esc(s.phone) + '</a>' : '') + '</div></div></section>';
  };

  R.faq = function (c, tone) {
    var x = c.faq, s = c.settings || {}, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var list = items.map(function (q, n) {
      var open = !!q.open;
      return '<div class="faq__item' + (open ? ' is-open' : '') + '"><h3><button class="faq__q" type="button" aria-expanded="' + open + '" aria-controls="faq-' + n + '">' +
        '<span>' + t(q.q) + '</span><i aria-hidden="true"></i></button></h3>' +
        '<div class="faq__a" id="faq-' + n + '"><div><p>' + t(q.a) + '</p></div></div></div>';
    }).join('');
    var aside = '<div class="faq__aside">' + (x.eyebrow ? '<p class="label">' + t(x.eyebrow) + '</p>' : '') + '<h2 class="h2">' + t(x.title) + '</h2>' +
      '<p class="faq__more">Не нашли ответ? ' + esc(plain(s.contactName || 'Менеджер')) + ' ответит на вопросы по экрану и монтажу</p>' +
      (s.phone ? '<a class="faq__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + '</div>';
    return section('faq', tone, '<div class="faq">' + aside + '<div class="faq__list rv">' + list + '</div></div>');
  };

  R.contacts = function (c, tone) {
    var x = c.contacts, s = c.settings || {};
    function line(label, main, note, href) {
      if (!main) return '';
      return '<div class="cline"><dt>' + label + '</dt><dd>' + (href ? '<a href="' + href + '">' + t(main) + '</a>' : t(main)) + (note ? '<small>' + soft(note) + '</small>' : '') + '</dd></div>';
    }
    var msg = messengers(c, 'msg');
    return section('contacts', tone,
      '<div class="cont">' +
      '<div class="cont__l rv">' + (x.eyebrow ? '<p class="label">' + t(x.eyebrow) + '</p>' : '') + '<h2 class="h2">' + t(x.title) + '</h2>' +
      (x.sub ? '<p class="cont__sub">' + soft(x.sub) + '</p>' : '') +
      '<div class="cont__person"><b>' + t(s.contactName) + '</b><span>' + soft(s.contactRole) + '</span></div>' +
      (s.phone ? '<a class="cont__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      '<dl class="cont__list">' + line('Почта', s.email, s.emailNote, s.email ? 'mailto:' + attr(s.email) : '') + line('Время', s.hours) + line('Адрес', s.address, s.addressNote) + '</dl>' +
      (msg ? '<div class="cont__msg">' + msg + '</div>' : '') + '</div>' +
      '<form class="cform rv" data-done="' + attr(s.formDone || 'Заявка принята') + '">' +
      '<h3 class="cform__t">' + t(x.formTitle || 'Оставить заявку') + '</h3>' + (x.formSub ? '<p class="cform__s">' + soft(x.formSub) + '</p>' : '') +
      '<div class="frow"><label class="fld"><span>Имя</span><input name="name" autocomplete="name" placeholder="Как к вам обращаться"></label>' +
      '<label class="fld"><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" placeholder="+7" required></label></div>' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<label class="fld"><span>Задача</span><textarea name="msg" rows="3" placeholder="Где будет экран, примерный размер, сроки"></textarea></label>' +
      '<label class="upload">' + svg('clip') + '<span>Приложить фото или чертёж</span><input type="file" accept="image/*,.pdf" hidden></label>' +
      submitBtn(x.formButton || 'Отправить заявку', 'mbtn--blue mbtn--block') + consent(c) + '</form>' +
      '</div>');
  };

  R.footer = function (c) {
    var s = c.settings || {}, f = c.footer || {};
    return '<footer class="foot"><div class="wrap">' +
      '<div class="foot__top"><a class="foot__brand" href="#top"><img src="../logos/v3-logo-white.svg" alt="' + attr(s.brandName) + '" width="160" height="40"></a>' +
      (f.about ? '<p class="foot__about">' + soft(f.about) + '</p>' : '') + '</div>' +
      '<div class="foot__grid"><nav class="foot__nav" aria-label="Разделы">' + menuLinks(c) + '</nav>' +
      '<div class="foot__contacts">' + (s.phone ? '<a class="foot__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') + '<div class="foot__msg">' + messengers(c, 'msg msg--d') + '</div></div></div>' +
      '<div class="foot__legal"><div>' + (f.legal ? '<span>' + t(f.legal) + '</span>' : '') + (f.note ? '<span>' + soft(f.note) + '</span>' : '') + '</div>' +
      '<a href="' + attr(s.policyUrl || '#') + '">Политика обработки персональных данных</a></div>' +
      '</div></footer>';
  };

  R.mbar = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="mbar">' + (s.phone ? '<a class="mbar__call" href="' + tel(s.phone) + '" aria-label="Позвонить">' + svg('phone') + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'mbtn--blue mbtn--block', { title: h.formTitle, sub: h.formSub }) + '</div>';
  };

  R.modal = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="modal" data-modal aria-hidden="true"><div class="modal__bg" data-close-modal></div>' +
      '<div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
      '<button class="modal__x" type="button" data-close-modal aria-label="Закрыть">' + svg('close') + '</button>' +
      '<form data-default-title="' + attr(h.formTitle || 'Получить расчёт экрана') + '" data-default-sub="' + attr(h.formSub || '') + '" data-done="' + attr(s.formDone || 'Заявка принята') + '">' +
      '<h3 class="modal__t" id="m-title" data-m-title></h3><p class="modal__s" data-m-sub></p>' +
      '<p class="modal__prod" data-m-prod hidden>Экран: <b></b></p>' +
      '<label class="fld"><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" placeholder="+7" required></label>' +
      '<label class="fld"><span>Тип экрана</span><select name="type">' + typeOptions(c, (c.calc || {}).defaultType) + '</select></label>' +
      '<div class="frow frow--2"><label class="fld"><span>Ширина, м</span><input name="w" inputmode="decimal" placeholder="6"></label>' +
      '<label class="fld"><span>Высота, м</span><input name="h" inputmode="decimal" placeholder="3"></label></div>' +
      submitBtn(h.formButton || 'Получить расчёт', 'mbtn--blue mbtn--block') + consent(c) + '</form>' +
      (s.phone ? '<p class="modal__alt">Или позвоните: <a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a></p>' : '') +
      '</div></div>';
  };

  R.lightbox = function () {
    return '<div class="lb" data-lb aria-hidden="true"><div class="lb__bg" data-close-lb></div>' +
      '<div class="lb__box" role="dialog" aria-modal="true" aria-label="Видео объекта">' +
      '<button class="lb__x" type="button" data-close-lb aria-label="Закрыть">' + svg('close') + '</button>' +
      '<div class="lb__media"><video controls playsinline data-lb-video></video></div>' +
      '<div class="lb__cap"><div><p class="lb__type" data-lb-type></p><b data-lb-title></b><p data-lb-desc></p></div>' +
      ask('Хочу такой же экран', 'mbtn--blue', { title: 'Хочу такой же экран', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом', extra: ' data-lb-ask' }) +
      '</div></div></div>';
  };

  /* Тёмные «экраны» на светлой странице: объекты и калькулятор. Светлые чередуются бумага / белый */
  var SCREEN = { cases: 1, calc: 1 };

  /* Фон секции для заливки углов вокруг тёмного блока */
  var TONE_BG = { paper: 'var(--paper)', white: 'var(--white)', trust: 'var(--paper)', cta: 'var(--blue)', dark: 'var(--paper)' };

  function render(c) {
    c.settings = c.settings || {};
    var parts = [R.header(c), R.sheet(c), '<main id="main">', R.hero(c)];
    var light = 0, list = [];
    arr(c.blocks).forEach(function (b) {
      if (b.visible === false || !R[b.id] || !c[b.id]) return;
      var tone;
      if (b.id === 'trust' || b.id === 'cta') tone = b.id;
      else if (SCREEN[b.id]) tone = 'dark';
      else { tone = light % 2 ? 'white' : 'paper'; light++; }
      var out = R[b.id](c, tone);
      if (out) list.push({ tone: tone, html: out });
    });
    list.forEach(function (x, k) {
      if (x.tone !== 'dark') { parts.push(x.html); return; }
      var prev = k ? TONE_BG[list[k - 1].tone] : 'var(--night)';
      var next = k < list.length - 1 ? TONE_BG[list[k + 1].tone] : 'var(--night)';
      parts.push('<div class="sw" style="--a:' + prev + ';--b:' + next + '">' + x.html + '</div>');
    });
    parts.push('</main>', R.footer(c), R.mbar(c), R.modal(c), R.lightbox(c));
    document.getElementById('app').innerHTML = parts.join('');
    if (c.meta) {
      document.title = plain(c.meta.title);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', plain(c.meta.description));
    }
    if (window.V4App) window.V4App.init(c);
  }

  window.V4Render = { render: render, plain: plain };

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
      app.innerHTML = '<div class="wrap" style="padding:160px 20px"><h2 class="h2">Не удалось загрузить контент</h2><p>' + esc(e.message) + '</p></div>';
    });
})();
