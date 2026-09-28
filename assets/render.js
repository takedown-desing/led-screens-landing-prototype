/* Лендинг LED-экранов: страница собирается из content/landing.json.
   В режиме предпросмотра (landing.html?preview=1) данные приходят из админки через postMessage.
   В тексте [[так]] подсвечивается оранжевым как условное значение, пустая строка делит абзацы. */
(function () {
  'use strict';

  var ICONS = {
    config: '<path d="M4 6h16M4 12h10M4 18h7"/>',
    truck: '<path d="M3 7h13v10H3zM16 10h4l1 3v4h-5z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    building: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-7 7a2.1 2.1 0 0 1-3-3l7-7a6 6 0 0 1 7.9-7.9z"/>',
    monitor: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
    check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/>',
    shield: '<path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7z"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    clip: '<path d="M21.4 11.1 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.1a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };
  var ICON_LABELS = {
    config: 'Список, настройка', truck: 'Доставка', building: 'Здание, склад', wrench: 'Монтаж, инструмент',
    monitor: 'Экран, ПО', check: 'Готово, проверка', shield: 'Гарантия, защита', doc: 'Документ',
    users: 'Люди, команда', pin: 'Адрес, регион', phone: 'Телефон', mail: 'Почта', clock: 'Сроки, время', star: 'Качество'
  };
  var MSG = {
    whatsapp: ['WhatsApp', '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'],
    telegram: ['Telegram', '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.6 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.2 1.4 11.7c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>'],
    max: ['MAX', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 19V5l8 9 8-9v14"/></svg>']
  };

  /* Пометки прототипа: источник каждого блока. Это не контент заказчика, в админке не редактируются. */
  var LABELS = {
    header: ['mix', 'Шапка: название компании из брифа, меню собирается из блоков, у которых в админке задан пункт меню, телефон и кнопка расчёта'],
    hero: ['mix', 'Первый экран: цель из брифа (получать заявки), предложение по головному спросу «светодиодный экран» (4 667 показов/мес по Москве и области), три факта и форма расчёта. Фон: видео шоурума из материалов клиента'],
    trust: ['client', 'Цифры компании: заполняет клиент. Оранжевые значения условные, показывают формат блока'],
    screens: ['mix', 'Типы экранов: фото и видео из материалов клиента. Деление по применению повторяет спрос: «уличные светодиодные экраны» 232, «прозрачный светодиодный экран» 96, «гибкий светодиодный экран» 113, «экраны для помещений» 104 показов/мес'],
    cases: ['brief', 'Объекты: шесть видео из брифа, экраны установлены компанией. Город, площадь и шаг пикселя по каждому объекту заполняет клиент (оранжевые значения условные)'],
    included: ['res', 'Что входит в поставку и монтаж: снимает вопросы «а конструкция», «а таможня», «а кто настроит». Стандартный блок для лендинга услуг под ключ'],
    process: ['res', 'Этапы: показывают срок и что происходит после заявки. Сроки условные, заполняет клиент'],
    calc: ['res', 'Стоимость: спрос «светодиодный экран цена» 109 и «сколько стоит светодиодный экран» 78 показов/мес. Ставки за м² задаются в типах экранов, условные'],
    specs: ['res', 'Таблица подбора: спрос «светодиодный экран шаг» 164, «размер светодиодного экрана» 140, «разрешение» 91 показов/мес'],
    about: ['mix', 'О компании: название из брифа. Юрлицо, склад и сервис заполняет клиент. Фото производства из материалов клиента'],
    reviews: ['client', 'Отзывы: заполняет клиент. Тексты условные. Если видимых отзывов нет, блок скрывается сам'],
    cta: ['res', 'Промежуточный призыв: второй вход в заявку для тех, кто не заполнил форму на первом экране'],
    faq: ['res', 'Вопросы и ответы: закрывают типовые возражения до звонка. Ответы уточняет клиент'],
    contacts: ['brief', 'Контакты из брифа: Иван Меньшов, +7 906 767 2566, imenshov@addu.ru. Адрес, режим работы и мессенджеры заполняет клиент'],
    footer: ['mix', 'Подвал: название компании из брифа, реквизиты и политику заполняет клиент']
  };

  var mediaMap = {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function t(s) { return esc(s).replace(/\[\[([\s\S]+?)\]\]/g, '<span class="fill">$1</span>').replace(/\n/g, '<br>'); }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  function attr(s) { return esc(plain(s)); }
  function paras(s) {
    return String(s || '').split(/\n\s*\n/).map(function (p) { p = p.trim(); return p ? '<p>' + t(p) + '</p>' : ''; }).join('');
  }
  function src(p) { return esc(mediaMap[p] || p || ''); }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }
  function svg(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + (ICONS[name] || ICONS.doc) + '</svg>'; }
  function tag(id) { var l = LABELS[id]; return l ? ' data-tag="' + l[0] + '" data-label="' + esc(l[1]) + '"' : ''; }
  function vis(x) { return x && x.visible !== false; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function isOn(c, id) { return arr(c.blocks).some(function (b) { return b.id === id && b.visible; }); }
  function ask(cls, text, title, sub, product, type, extra) {
    return '<a class="' + cls + '" href="#" data-ask data-ask-title="' + attr(title) + '" data-ask-sub="' + attr(sub) + '"' +
      (product ? ' data-ask-product="' + attr(product) + '"' : '') + (type ? ' data-ask-type="' + esc(type) + '"' : '') + (extra || '') + '>' + t(text) + '</a>';
  }
  function head(x, right) {
    return '<div class="section-head"><div>' +
      (x.eyebrow ? '<span class="eyebrow" data-cms="Надзаголовок">' + t(x.eyebrow) + '</span>' : '') +
      '<h2 data-cms="Заголовок раздела">' + t(x.title) + '</h2>' +
      (x.sub ? '<p data-cms="Подзаголовок раздела">' + t(x.sub) + '</p>' : '') +
      '</div>' + (right || '') + '</div>';
  }
  function typeOptions(c) {
    return arr(c.screens && c.screens.items).filter(vis).map(function (s) {
      return '<option value="' + esc(s.id) + '">' + esc(plain(s.shortName || s.name)) + '</option>';
    }).join('') + '<option value="other">' + esc(plain(c.settings.formOther || 'Не знаю, нужна консультация')) + '</option>';
  }
  function consent(c, text) {
    return '<label class="consent"><input type="checkbox" checked> ' + (text || 'Отправляя форму, соглашаюсь с') +
      ' <a href="' + attr(c.settings.policyUrl || '#') + '">политикой обработки персональных данных</a></label>';
  }
  function messengers(c, cls) {
    var s = c.settings;
    return ['whatsapp', 'telegram', 'max'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a href="' + attr(s[k]) + '"' + (cls ? ' class="' + cls + '"' : '') + ' target="_blank" rel="noopener">' + MSG[k][1] + MSG[k][0] + '</a>';
    }).join('');
  }
  function menuLinks(c) {
    return arr(c.blocks).filter(function (b) { return b.visible && b.menu; }).map(function (b) {
      return '<a href="#' + esc(b.id) + '">' + esc(b.menu) + '</a>';
    }).join('');
  }
  function fmt(n) { return Number(n || 0).toLocaleString('ru-RU'); }

  var R = {};

  R.header = function (c) {
    var s = c.settings, h = c.hero || {};
    return '<header class="header blk"' + tag('header') + '><div class="container">' +
      '<a class="logo" href="#top" data-cms="Логотип и название"><span class="mark">' + esc(s.brandMark) + '</span>' +
      '<span><b>' + esc(s.brandName) + '</b><span>' + t(s.brandTagline) + '</span></span></a>' +
      '<nav class="hdr-nav" data-cms="Меню: пункты из блоков">' + menuLinks(c) + '</nav>' +
      '<div class="hdr-contacts">' +
      '<a class="phone" href="' + tel(s.phone) + '" data-cms="Телефон"><span>' + esc(s.phone) + '</span><small>' + t(s.phoneNote) + '</small></a>' +
      ask('btn btn-primary', s.headerButton || 'Получить расчёт', h.formTitle, h.formSub) +
      '<button class="burger" data-open-menu aria-label="Меню">' + svg('menu') + '</button>' +
      '</div></div></header>';
  };

  R.drawer = function (c) {
    var s = c.settings;
    return '<div class="drawer"><div class="panel"><button class="close" data-close-menu aria-label="Закрыть">✕</button>' +
      '<h4>Разделы</h4>' + menuLinks(c) +
      '<h4>Связь</h4><a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a><a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' +
      messengers(c) + '</div></div>';
  };

  R.hero = function (c) {
    var h = c.hero, s = c.settings;
    var bg = h.video
      ? '<video autoplay muted loop playsinline' + (h.poster ? ' poster="' + src(h.poster) + '"' : '') + '><source src="' + src(h.video) + '" type="video/mp4"></video>'
      : (h.poster ? '<img src="' + src(h.poster) + '" alt="">' : '');
    var facts = arr(h.facts).map(function (f) { return '<div class="bullet"><b>' + t(f.title) + '</b><span>' + t(f.text) + '</span></div>'; }).join('');
    var b1 = isOn(c, 'calc') ? '<a class="btn btn-primary btn-lg" href="#calc">' + t(h.button1) + '</a>' : ask('btn btn-primary btn-lg', h.button1, h.formTitle, h.formSub);
    var b2 = isOn(c, 'cases') && h.button2 ? '<a class="btn btn-outline btn-lg" href="#cases">' + t(h.button2) + '</a>' : '';
    return '<section class="hero blk" id="top"' + tag('hero') + '>' +
      '<div class="bg" data-cms="Фон: видео или фото">' + bg + '</div>' +
      '<div class="container"><div>' +
      (h.badge ? '<span class="geo">' + svg('pin') + ' <span data-cms="Регион">' + t(h.badge) + '</span></span>' : '') +
      '<h1 data-cms="Заголовок H1">' + t(h.h1) + '</h1>' +
      (h.lead ? '<p class="lead" data-cms="Подзаголовок">' + t(h.lead) + '</p>' : '') +
      (facts ? '<div class="bullets" data-cms="Факты первого экрана">' + facts + '</div>' : '') +
      '<div class="cta-row">' + b1 + b2 + (h.note ? '<span class="note">' + t(h.note) + '</span>' : '') + '</div>' +
      '</div>' +
      '<form class="card-form" data-done="' + attr(s.formDone) + '" data-cms="Форма первого экрана">' +
      '<h3>' + t(h.formTitle) + '</h3><div class="sub">' + t(h.formSub) + '</div>' +
      '<label class="field"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<div class="row2"><label class="field"><span>Ширина, м</span><input type="text" inputmode="decimal" placeholder="6"></label>' +
      '<label class="field"><span>Высота, м</span><input type="text" inputmode="decimal" placeholder="3"></label></div>' +
      '<div class="row2"><label class="field"><span>Имя</span><input type="text" placeholder="Как к вам обращаться"></label>' +
      '<label class="field"><span>Телефон</span><input type="tel" placeholder="+7" required></label></div>' +
      '<button class="btn btn-primary btn-block btn-lg" type="submit">' + t(h.formButton || 'Получить расчёт') + '</button>' +
      consent(c) + '</form></div></section>';
  };

  R.trust = function (c) {
    var items = arr(c.trust.items).map(function (i) { return '<div class="item"><b>' + t(i.value) + '</b><span>' + t(i.label) + '</span></div>'; }).join('');
    return '<div class="trust blk" id="trust"' + tag('trust') + '><div class="container" data-cms="Цифры доверия">' + items + '</div></div>';
  };

  R.screens = function (c, alt) {
    var x = c.screens, cases = isOn(c, 'cases');
    var cards = arr(x.items).filter(vis).map(function (s) {
      var specs = arr(s.specs).map(function (p) { return '<li><span>' + t(p.k) + '</span><b>' + t(p.v) + '</b></li>'; }).join('');
      return '<article class="prod"><div class="media">' + (s.image ? '<img src="' + src(s.image) + '" alt="' + attr(s.name) + '" loading="lazy">' : '') +
        (s.chip ? '<span class="chip">' + t(s.chip) + '</span>' : '') + '</div>' +
        '<div class="body"><h3>' + t(s.name) + '</h3><p>' + t(s.desc) + '</p>' + (specs ? '<ul class="specs">' + specs + '</ul>' : '') +
        '<div class="actions">' + ask('btn btn-primary btn-sm', 'Рассчитать', 'Расчёт: ' + plain(s.name), 'Укажите размеры и место установки, пришлём конфигурацию и смету', s.name, s.id) +
        (cases ? '<a class="btn btn-ghost btn-sm" href="#cases" data-case-filter="' + esc(s.caseFilter || 'all') + '">Примеры</a>' : '') +
        '</div></div></article>';
    }).join('');
    var help = x.helpButton ? ask('btn btn-outline', x.helpButton, 'Помочь с выбором экрана', 'Расскажите, где будет экран и что на нём показывать: подберём тип и шаг пикселя') : '';
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="screens"' + tag('screens') + '><div class="container">' + head(x, help) +
      '<div class="prod-grid" data-cms="Карточки типов экранов">' + cards + '</div></div></section>';
  };

  R.cases = function (c, alt) {
    var x = c.cases, items = arr(x.items).filter(vis);
    var used = {};
    items.forEach(function (i) { arr(i.filters).forEach(function (f) { used[f] = 1; }); });
    var filters = arr(x.filters).filter(function (f) { return used[f.id]; });
    var tabs = filters.length ? '<div class="filters" data-tabs="#case-list" data-cms="Фильтр по типу"><button class="tab active" data-filter="all">' + t(x.allLabel || 'Все объекты') + '</button>' +
      filters.map(function (f) { return '<button class="tab" data-filter="' + esc(f.id) + '">' + t(f.label) + '</button>'; }).join('') + '</div>' : '';
    var cards = items.map(function (i) {
      var facts = arr(i.facts).map(function (f) { return '<span>' + t(f.k) + ' <b>' + t(f.v) + '</b></span>'; }).join('');
      var media = i.video
        ? '<video preload="metadata" playsinline' + (i.poster ? ' poster="' + src(i.poster) + '"' : '') + '><source src="' + src(i.video) + '" type="video/mp4"></video>' +
          '<span class="play"><i><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></i></span><span class="dur"></span>'
        : (i.poster ? '<img src="' + src(i.poster) + '" alt="' + attr(i.title) + '" loading="lazy">' : '');
      return '<article class="case" data-type="' + esc(arr(i.filters).join(' ')) + '"><div class="media">' + media + '</div>' +
        '<div class="body">' + (i.type ? '<div class="type">' + t(i.type) + '</div>' : '') + '<h3>' + t(i.title) + '</h3><p>' + t(i.desc) + '</p>' +
        (facts ? '<div class="facts">' + facts + '</div>' : '') + '</div></article>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="cases"' + tag('cases') + '><div class="container">' + head(x) + tabs +
      '<div class="case-grid" id="case-list" data-cms="Объекты: видео, тип, описание, параметры">' + cards + '</div></div></section>';
  };

  R.included = function (c, alt) {
    var x = c.included;
    var items = arr(x.items).map(function (i) {
      return '<div class="feat"><div class="ico">' + svg(i.icon) + '</div><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p></div>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="included"' + tag('included') + '><div class="container">' + head(x) +
      '<div class="feat-grid" data-cms="Пункты состава услуги">' + items + '</div></div></section>';
  };

  R.process = function (c, alt) {
    var x = c.process;
    var items = arr(x.items).map(function (i, n) {
      return '<div class="step"><div class="n">' + (n + 1) + '</div><h3>' + t(i.title) + '</h3><p>' + t(i.text) + '</p>' + (i.term ? '<span class="t">' + t(i.term) + '</span>' : '') + '</div>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="process"' + tag('process') + '><div class="container">' + head(x) +
      '<div class="steps" data-cms="Этапы">' + items + '</div></div></section>';
  };

  R.calc = function (c, alt) {
    var x = c.calc;
    var types = arr(c.screens.items).filter(function (s) { return vis(s) && Number(s.rate) > 0; });
    var def = types.some(function (s) { return s.id === x.defaultType; }) ? x.defaultType : (types[0] && types[0].id);
    var opts = types.map(function (s) {
      return '<option value="' + esc(s.id) + '" data-rate="' + Number(s.rate) + '" data-px="' + attr(s.px) + '" data-name="' + attr(s.shortName || s.name) + '"' +
        (s.id === def ? ' selected' : '') + '>' + esc(plain(s.shortName || s.name)) + '</option>';
    }).join('');
    var rows = types.map(function (s) {
      var price = 'от ' + fmt(s.rate) + ' ₽';
      return '<tr><td>' + t(s.shortName || s.name) + '</td><td>' + esc(s.px || '') + '</td><td>' + (x.draftRates ? '<span class="fill">' + price + '</span>' : price) + '</td></tr>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="calc"' + tag('calc') + '><div class="container">' + head(x) +
      '<div class="calc"><form class="card-form" data-calc data-mount-share="' + Number(x.mountShare || 0) + '">' +
      '<h3>' + t(x.formTitle) + '</h3><div class="sub">' + t(x.formSub) + '</div>' +
      '<div class="row2"><label class="field"><span>Ширина, м</span><input type="number" name="w" min="0.5" step="0.1" value="' + Number(x.defaultWidth || 6) + '"></label>' +
      '<label class="field"><span>Высота, м</span><input type="number" name="h" min="0.5" step="0.1" value="' + Number(x.defaultHeight || 3) + '"></label></div>' +
      '<label class="field"><span>Тип экрана</span><select name="calctype">' + opts + '</select></label>' +
      '<label class="consent" style="margin:0 0 14px"><input type="checkbox" name="mount" checked> ' + t(x.mountLabel) + '</label>' +
      '<table class="price-tbl" data-cms="Ставки: из типов экранов"><tr><th>Тип</th><th>Шаг</th><th>За м²</th></tr>' + rows + '</table>' +
      '</form><div><div class="calc-out"><span class="eyebrow">Ориентировочно</span><div class="big" data-out="price">—</div>' +
      '<div class="row"><span>Тип экрана</span><b data-out="type">—</b></div>' +
      '<div class="row"><span>Площадь</span><b data-out="area">—</b></div>' +
      '<div class="row"><span>Рекомендуемый шаг пикселя</span><b data-out="px">—</b></div>' +
      '<div class="row"><span>Монтаж и конструкция</span><b data-out="mount">—</b></div>' +
      (x.excludes ? '<div class="note">' + t(x.excludes) + '</div>' : '') +
      '<div style="margin-top:18px">' + ask('btn btn-primary btn-lg btn-block', x.button || 'Получить точную смету', 'Получить точную смету', 'Пришлём спецификацию и смету с монтажом в течение рабочего дня', 'Экран по калькулятору', '', ' data-calc-ask') + '</div>' +
      '</div></div></div></div></section>';
  };

  R.specs = function (c, alt) {
    var x = c.specs;
    var rows = arr(x.rows).map(function (r) {
      return '<tr><td>' + t(r.px) + '</td><td>' + t(r.dist) + '</td><td>' + t(r.where) + '</td><td>' + t(r.type) + '</td><td>' + t(r.bright) + '</td></tr>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="specs"' + tag('specs') + '><div class="container">' + head(x) +
      '<div class="tbl-wrap"><table class="spec-tbl" data-cms="Строки таблицы подбора"><thead><tr><th>Шаг пикселя</th><th>Минимальное расстояние просмотра</th><th>Где применяется</th><th>Тип экрана</th><th>Яркость</th></tr></thead><tbody>' +
      rows + '</tbody></table></div></div></section>';
  };

  R.about = function (c, alt) {
    var x = c.about;
    var docs = arr(x.docs).map(function (d) { return '<div class="doc">' + svg(d.icon) + '<span>' + t(d.text) + '</span></div>'; }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="about"' + tag('about') + '><div class="container"><div class="about"><div>' +
      (x.eyebrow ? '<span class="eyebrow">' + t(x.eyebrow) + '</span>' : '') +
      '<h2 data-cms="Заголовок">' + t(x.title) + '</h2><div data-cms="Текст о компании">' + paras(x.text) + '</div>' +
      (docs ? '<div class="docs" data-cms="Документы и факты">' + docs + '</div>' : '') + '</div>' +
      (x.image ? '<div class="photo" data-cms="Фото"><img src="' + src(x.image) + '" alt="' + attr(x.title) + '" loading="lazy"></div>' : '') +
      '</div></div></section>';
  };

  R.reviews = function (c, alt) {
    var x = c.reviews, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var cards = items.map(function (r) {
      var n = Math.max(0, Math.min(5, Number(r.stars) || 0));
      var letter = plain(r.name).trim().charAt(0).toUpperCase() || '•';
      return '<div class="rev">' + (n ? '<div class="stars">' + new Array(n + 1).join('★') + '</div>' : '') +
        '<div class="who"><div class="ava">' + esc(letter) + '</div><div><b>' + t(r.name) + '</b><span>' + t(r.object) + '</span></div></div>' +
        '<p>' + t(r.text) + '</p></div>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="reviews"' + tag('reviews') + '><div class="container">' + head(x) +
      '<div class="rev-grid" data-cms="Отзывы">' + cards + '</div></div></section>';
  };

  R.cta = function (c) {
    var x = c.cta, s = c.settings;
    return '<div class="cta-band blk" id="cta"' + tag('cta') + '><div class="container"><div>' +
      '<h2 data-cms="Заголовок призыва">' + t(x.title) + '</h2>' + (x.text ? '<p data-cms="Текст призыва">' + t(x.text) + '</p>' : '') + '</div>' +
      '<div class="cta-row">' + ask('btn btn-primary btn-lg', x.button || 'Оставить заявку', x.title, x.text) +
      (x.showPhone ? '<a class="btn btn-outline btn-lg" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      '</div></div></div>';
  };

  R.faq = function (c, alt) {
    var x = c.faq;
    var items = arr(x.items).map(function (q) {
      return '<details' + (q.open ? ' open' : '') + '><summary>' + t(q.q) + '</summary>' + paras(q.a) + '</details>';
    }).join('');
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="faq"' + tag('faq') + '><div class="container">' + head(x) +
      '<div class="faq" data-cms="Вопросы и ответы">' + items + '</div></div></section>';
  };

  R.contacts = function (c, alt) {
    var x = c.contacts, s = c.settings;
    var initials = plain(s.contactName).split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    var msgs = messengers(c);
    return '<section class="section' + (alt ? ' alt' : '') + ' blk" id="contacts"' + tag('contacts') + '><div class="container">' + head(x) +
      '<div class="contacts"><div class="contact-card" data-cms="Контакты: из общих настроек">' +
      '<div class="person"><div class="ava">' + esc(initials) + '</div><div><b>' + t(s.contactName) + '</b><span>' + t(s.contactRole) + '</span></div></div>' +
      '<ul class="clist">' +
      '<li>' + svg('phone') + '<div><a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' + (s.hours ? '<small>' + t(s.hours) + '</small>' : '') + '</div></li>' +
      '<li>' + svg('mail') + '<div><a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' + (s.emailNote ? '<small>' + t(s.emailNote) + '</small>' : '') + '</div></li>' +
      (s.address ? '<li>' + svg('pin') + '<div><span>' + t(s.address) + '</span>' + (s.addressNote ? '<small>' + t(s.addressNote) + '</small>' : '') + '</div></li>' : '') +
      '</ul>' + (msgs ? '<div class="msgs">' + msgs + '</div>' : '') +
      (x.mapNote ? '<div class="map" data-cms="Карта">' + t(x.mapNote) + '</div>' : '') + '</div>' +
      '<form class="card-form" data-done="' + attr(s.formDone) + '" data-cms="Форма заявки">' +
      '<h3>' + t(x.formTitle) + '</h3><div class="sub">' + t(x.formSub) + '</div>' +
      '<div class="row2"><label class="field"><span>Имя</span><input type="text" placeholder="Как к вам обращаться"></label>' +
      '<label class="field"><span>Телефон</span><input type="tel" placeholder="+7" required></label></div>' +
      '<label class="field"><span>Email (необязательно)</span><input type="email" placeholder="Для отправки спецификации"></label>' +
      '<label class="field"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<label class="field"><span>Задача</span><textarea placeholder="Где будет экран, примерные размеры, что показывать, сроки"></textarea></label>' +
      '<label class="upload">' + svg('clip') + 'Прикрепить фото объекта или чертёж (jpg, pdf, dwg до 20 МБ)<input type="file" hidden></label>' +
      '<div style="margin-top:14px"><button class="btn btn-primary btn-block btn-lg" type="submit">' + t(x.formButton || 'Отправить заявку') + '</button></div>' +
      consent(c, 'Соглашаюсь с') + '</form></div></div></section>';
  };

  R.footer = function (c) {
    var x = c.footer, s = c.settings;
    return '<footer class="footer blk" id="footer"' + tag('footer') + '><div class="container"><div>' +
      '<h4 data-cms="Название компании">' + t(s.companyName) + '</h4>' + (x.about ? '<p data-cms="Описание">' + t(x.about) + '</p>' : '') +
      '<div class="legal" data-cms="Реквизиты">' + t(x.legal) + (x.note ? '<br>' + t(x.note) : '') + '</div></div>' +
      '<div><h4>Разделы</h4>' + menuLinks(c) + '</div>' +
      '<div><h4>Связь</h4><a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a><a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' +
      messengers(c) + '<a href="' + attr(s.policyUrl || '#') + '">Политика обработки персональных данных</a></div>' +
      '</div></footer>';
  };

  R.sticky = function (c) {
    var s = c.settings, h = c.hero || {};
    return '<div class="sticky-cta"><a class="btn btn-outline" href="' + tel(s.phone) + '">Позвонить</a>' +
      ask('btn btn-primary', s.headerButton || 'Получить расчёт', h.formTitle, h.formSub) + '</div>';
  };

  R.modal = function (c) {
    var s = c.settings;
    return '<div class="modal"><div class="box"><button class="close" data-close-modal aria-label="Закрыть">✕</button>' +
      '<h3>Получить расчёт экрана</h3><div class="sub">Ответим в течение рабочего дня</div>' +
      '<div class="prod-line">Задача: <b>—</b></div>' +
      '<form data-done="' + attr(s.formDone) + '">' +
      '<label class="field"><span>Тип экрана</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<div class="row2"><label class="field"><span>Имя</span><input type="text" placeholder="Как к вам обращаться"></label>' +
      '<label class="field"><span>Телефон</span><input type="tel" placeholder="+7" required></label></div>' +
      '<label class="field"><span>Комментарий</span><textarea placeholder="Размеры, место установки, сроки"></textarea></label>' +
      '<label class="upload">' + svg('clip') + 'Прикрепить фото или чертёж<input type="file" hidden></label>' +
      '<div style="margin-top:14px"><button class="btn btn-primary btn-block btn-lg" type="submit">Отправить</button></div>' +
      consent(c, 'Соглашаюсь с') + '</form></div></div>';
  };

  var SECTION_BLOCKS = { screens: 1, cases: 1, included: 1, process: 1, calc: 1, specs: 1, about: 1, reviews: 1, faq: 1, contacts: 1 };
  var cache = {}, lastKeys = '';

  function render(c) {
    var parts = [['header', R.header(c)], ['drawer', R.drawer(c)], ['hero', R.hero(c)]];
    var n = 0;
    arr(c.blocks).forEach(function (b) {
      if (!b.visible || !R[b.id] || !c[b.id]) return;
      var html = R[b.id](c, SECTION_BLOCKS[b.id] ? (n % 2 === 1) : false);
      if (!html) return;
      if (SECTION_BLOCKS[b.id]) n++;
      parts.push([b.id, html]);
    });
    parts.push(['footer', R.footer(c)], ['sticky', R.sticky(c)], ['modal', R.modal(c)]);

    var app = document.getElementById('app');
    var keys = parts.map(function (p) { return p[0]; }).join(',');
    if (keys !== lastKeys) {
      var y = window.scrollY;
      app.innerHTML = parts.map(function (p) { return '<div class="part" data-part="' + p[0] + '">' + p[1] + '</div>'; }).join('');
      cache = {};
      parts.forEach(function (p) { cache[p[0]] = p[1]; });
      lastKeys = keys;
      if (y) window.scrollTo(0, y);
    } else {
      parts.forEach(function (p) {
        if (cache[p[0]] === p[1]) return;
        var box = app.querySelector('[data-part="' + p[0] + '"]');
        if (box) box.innerHTML = p[1];
        cache[p[0]] = p[1];
      });
    }
    if (c.meta) {
      document.title = (isPreview ? 'Предпросмотр: ' : 'Прототип: ') + plain(c.meta.title);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', plain(c.meta.description));
    }
    if (window.LandingApp) window.LandingApp.afterRender();
  }

  var isPreview = /[?&]preview=1\b/.test(location.search);
  window.LandingRender = { ICONS: ICONS, ICON_LABELS: ICON_LABELS, plain: plain, render: render };

  var app = document.getElementById('app');
  if (!app) return;

  function fail(msg) {
    app.innerHTML = '<div class="container" style="padding:80px 24px"><h2>Не удалось загрузить контент</h2><p class="muted">' + esc(msg) + '</p></div>';
  }
  function load(first) {
    return fetch('content/landing.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (c) {
        render(c);
        if (first && location.hash.length > 1) {
          var el = document.getElementById(location.hash.slice(1));
          if (el) el.scrollIntoView();
        }
      })
      .catch(function (e) { fail(e.message); });
  }

  if (isPreview) {
    document.documentElement.classList.add('is-preview');
    document.body.classList.add('hide-tags');
    var got = false;
    window.addEventListener('message', function (e) {
      if (e.origin !== location.origin || !e.data) return;
      if (e.data.type === 'content') {
        got = true;
        mediaMap = e.data.media || {};
        try { render(e.data.content); } catch (err) { fail(err.message); }
      } else if (e.data.type === 'scrollTo') {
        var el = document.getElementById(e.data.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (e.data.id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    if (window.parent !== window) window.parent.postMessage({ type: 'ready' }, location.origin);
    setTimeout(function () { if (!got) load(false); }, 1500);
  } else {
    load(true);
  }
})();
