/* Вариант 5 · Истории объектов. Страница построена как рассказ: первый экран, где стеклянная витрина
   «включается» при прокрутке, потом главы по реальным объектам на весь экран, и только после них
   коротко: что ещё бывает, сколько стоит, письмо от менеджера, вопросы, контакты.
   Контент только из ../../content/landing.json (тот же файл правит админка).
   Новые поля для этого варианта: hero.sceneOff, hero.sceneOn, cases.items[].story, process.letter,
   faq.items[].talk. Если поле пустое, берётся старое (desc, items, a).
   Блоки trust, included, specs отдельными секциями не выводятся: цифры идут строкой под первым экраном,
   комплект поставки одной фразой под калькулятором, таблица шага пикселя опущена. */
(function () {
  'use strict';

  var ROOT = '../../';
  var MSG = {
    whatsapp: 'WhatsApp', telegram: 'Telegram', max: 'MAX'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  function nb(s) { return s.replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2 ').replace(/(^|[\s(«>])([а-яёА-ЯЁ0-9]{1,2}) /g, '$1$2 '); }
  function t(s) { return nb(esc(plain(s))).replace(/\n/g, '<br>'); }
  /* Подпись из одной фразы без точки в конце */
  function soft(s) {
    var p = plain(s).trim();
    if (/^[^.!?]+\.$/.test(p)) p = p.slice(0, -1);
    return nb(esc(p)).replace(/\n/g, '<br>');
  }
  function attr(s) { return esc(plain(s)); }
  function paras(s, cls) {
    return String(s || '').split(/\n\s*\n/).map(function (p) { p = p.trim(); return p ? '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + t(p) + '</p>' : ''; }).join('');
  }
  function media(p) {
    p = String(p || '');
    if (!p) return '';
    if (/^(https?:)?\/\//i.test(p) || /^(data|blob):/i.test(p) || p.charAt(0) === '/') return esc(p);
    return esc(ROOT + p.replace(/^\.\//, ''));
  }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }
  function vis(x) { return x && x.visible !== false; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function isOn(c, id) { return arr(c.blocks).some(function (b) { return b.id === id && b.visible !== false; }) && !!c[id]; }
  function fmt(n) { return Number(n || 0).toLocaleString('ru-RU'); }
  function two(n) { return (n < 9 ? '0' : '') + (n + 1); }
  /* Заглушка целиком в [[...]]: показывать нечего */
  function stub(s) { return /^\s*\[\[[\s\S]*\]\]\s*$/.test(String(s || '')); }
  /* Имя в дательном падеже для заголовка «Написать Ивану»: только простые случаи, иначе пусто */
  function dative(name) {
    name = String(name || '').trim();
    if (!name) return '';
    if (/[аяь]$/i.test(name)) return name.replace(/а$/i, 'е').replace(/я$/i, 'е').replace(/ь$/i, 'ю');
    if (/[йи]$/i.test(name)) return name.replace(/ий$/i, 'ию').replace(/й$/i, 'ю');
    if (/[бвгджзклмнпрстфхцчшщ]$/i.test(name)) return name + 'у';
    return '';
  }
  function rate(s) { return Number(s.rate) > 0 ? 'от ' + fmt(s.rate) + ' ₽ за м²' : ''; }
  /* «Уличный: фасад, медиафасад» → ['Уличный', 'фасад, медиафасад'] */
  function split(s) { var p = plain(s.shortName || s.name).split(':'); return [p[0].trim(), (p[1] || '').trim()]; }
  /* Тип экрана, к которому относится объект: по filters объекта и caseFilter типа */
  function screenFor(c, item) {
    var f = arr(item.filters);
    return arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && s.caseFilter && f.indexOf(s.caseFilter) > -1; })[0];
  }

  function btn(label, cls, href, extra) {
    return '<a class="btn ' + (cls || '') + '" href="' + (href || '#') + '"' + (extra || '') + '>' + label + '</a>';
  }
  function ask(label, cls, o) {
    o = o || {};
    var a = ' data-ask' +
      (o.title ? ' data-ask-title="' + attr(o.title) + '"' : '') +
      (o.sub ? ' data-ask-sub="' + attr(o.sub) + '"' : '') +
      (o.product ? ' data-ask-product="' + attr(o.product) + '"' : '') +
      (o.type ? ' data-ask-type="' + esc(o.type) + '"' : '') + (o.extra || '');
    return btn(t(label), cls, '#', a);
  }
  function submitBtn(label, cls) { return '<button class="btn ' + (cls || '') + '" type="submit">' + t(label) + '</button>'; }
  function messengers(c) {
    var s = c.settings || {};
    return ['whatsapp', 'telegram', 'max'].filter(function (k) { return s[k]; }).map(function (k) {
      return '<a href="' + attr(s[k]) + '" target="_blank" rel="noopener">' + MSG[k] + '</a>';
    }).join('');
  }
  function menuLinks(c) {
    return arr(c.blocks).filter(function (b) { return b.visible !== false && b.menu && c[b.id] && R[b.id]; }).map(function (b) {
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
  function section(id, tone, body, cls) {
    return '<section class="sec' + (cls ? ' ' + cls : '') + '" id="' + esc(id) + '" data-tone="' + tone + '"><div class="wrap">' + body + '</div></section>';
  }

  var R = {};

  R.header = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<header class="hdr"><a class="hdr__brand" href="#top" aria-label="' + attr(s.brandName) + ' — на главную">' +
      '<img class="hdr__logo hdr__logo--dark" src="../logos/v3-logo.svg" alt="" width="146" height="37">' +
      '<img class="hdr__logo hdr__logo--light" src="../logos/v3-logo-white.svg" alt="' + attr(s.brandName) + '" width="146" height="37"></a>' +
      '<nav class="hdr__nav" aria-label="Разделы">' + menuLinks(c) + '</nav>' +
      (s.phone ? '<a class="hdr__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + (s.phoneNote ? '<small>' + t(s.phoneNote) + '</small>' : '') + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'btn--sm hdr__cta', { title: h.formTitle, sub: h.formSub }) +
      (s.phone ? '<a class="hdr__call" href="' + tel(s.phone) + '" aria-label="Позвонить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg></a>' : '') +
      '<button class="hdr__burger" type="button" data-open-menu aria-label="Открыть меню">Меню</button></header>';
  };

  R.sheet = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="sheet" data-sheet aria-hidden="true"><div class="sheet__bg" data-close-menu></div>' +
      '<div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Меню">' +
      '<div class="sheet__top"><span>' + t(s.phoneNote || s.hours) + '</span><button class="sheet__x" type="button" data-close-menu aria-label="Закрыть меню">Закрыть</button></div>' +
      '<nav class="sheet__links">' + menuLinks(c) + '</nav>' +
      '<div class="sheet__foot">' + (s.phone ? '<a class="sheet__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'btn--block', { title: h.formTitle, sub: h.formSub }) + '</div></div></div>';
  };

  /* Первый экран: витрина включается. Ролик берётся из объекта с типом «прозрачный», иначе hero.video */
  R.hero = function (c) {
    var h = c.hero || {}, s = c.settings || {};
    var glass = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && i.video && arr(i.filters).indexOf('transparent') > -1; })[0];
    var video = (glass && glass.video) || h.video, poster = (glass && glass.poster) || h.poster;
    var title = h.titleShort || h.h1;
    var trust = arr(c.trust && c.trust.items).filter(vis).map(function (i) { return '<li><b>' + t(i.value) + '</b> ' + soft(i.label) + '</li>'; }).join('');
    return '<section class="open" id="top" data-open data-tone="dark" aria-label="Витрина включается"><div class="open__stage">' +
      (video ? '<video class="open__video" muted loop playsinline preload="auto"' + (poster ? ' poster="' + media(poster) + '"' : '') + ' src="' + media(video) + '"></video>' : '') +
      '<div class="open__off" aria-hidden="true"' + (poster ? ' style="background-image:url(' + media(poster) + ')"' : '') + '></div>' +
      '<div class="open__rows" aria-hidden="true"></div><div class="open__glow" aria-hidden="true"></div>' +
      '<div class="open__shade" aria-hidden="true"></div>' +
      '<div class="open__caps"><span class="open__lamp" aria-hidden="true"></span>' +
      (h.sceneOff ? '<p class="open__cap" data-cap-off>' + soft(h.sceneOff) + '</p>' : '') +
      (h.sceneOn ? '<p class="open__cap open__cap--on" data-cap-on>' + soft(h.sceneOn) + '</p>' : '') + '</div>' +
      '<div class="open__copy"><h1 class="open__h1">' + t(title) + '</h1>' +
      (h.badge ? '<p class="open__where">' + soft(h.badge) + '</p>' : '') +
      '<div class="open__btns">' + ask('Хочу такую витрину', 'btn--white', { title: 'Хочу такую витрину', sub: 'Оставьте телефон и размеры стекла, посчитаем прозрачный экран с монтажом', type: 'transparent' }) +
      (s.phone ? '<a class="open__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + '</div></div>' +
      '<p class="open__hint" aria-hidden="true">листайте</p>' +
      '</div></section>' +
      (trust ? '<div class="proof" data-tone="dark"><ul class="wrap proof__list">' + trust + '</ul></div>' : '');
  };

  /* Главы: по одной на объект */
  R.cases = function (c) {
    var items = arr(c.cases && c.cases.items).filter(function (i) { return vis(i) && (i.video || i.poster); });
    if (!items.length) return '';
    var total = items.length;
    return '<div class="chs" id="cases">' + items.map(function (i, n) {
      var sc = screenFor(c, i), price = sc ? rate(sc) : '';
      var facts = arr(i.facts).filter(function (f) { return !stub(f.v); }).map(function (f) { return '<span>' + t(f.v) + '</span>'; }).join('');
      var poster = i.poster ? media(i.poster) : '';
      return '<section class="ch" data-tone="dark" aria-label="' + attr(i.title) + '">' +
        (poster ? '<img class="ch__bd" src="' + poster + '" alt="" loading="lazy" aria-hidden="true">' : '') +
        (i.video ? '<video class="ch__v" muted loop playsinline preload="metadata" data-autoplay' + (poster ? ' poster="' + poster + '"' : '') + '><source src="' + media(i.video) + '" type="video/mp4"></video>' : '<img class="ch__v" src="' + poster + '" alt="">') +
        '<span class="ch__shade" aria-hidden="true"></span>' +
        '<div class="wrap ch__in"><p class="ch__n">' + two(n) + ' / ' + two(total - 1) + (i.type ? ' · ' + soft(i.type) : '') + '</p>' +
        '<div class="ch__txt rv"><h2 class="ch__t">' + soft(i.title) + '</h2><p class="ch__s">' + soft(i.story || i.desc) + '</p>' +
        (facts ? '<p class="ch__f">' + facts + '</p>' : '') +
        '<div class="ch__act">' + ask('Хочу так же', 'btn--white', { title: 'Хочу так же', sub: 'Оставьте телефон и размеры, пришлём конфигурацию и смету с монтажом', product: i.title, type: sc ? sc.id : '' }) +
        (price ? '<span class="ch__p">такой экран ' + price + '</span>' : '') + '</div></div>' +
        (i.video ? '<button class="ch__snd" type="button" data-sound aria-pressed="false">Включить звук</button>' : '') +
        '</div></section>';
    }).join('') + '</div>';
  };

  /* Что ещё бывает: шесть строк типов */
  R.screens = function (c) {
    var x = c.screens, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var rows = items.map(function (s) {
      var p = split(s);
      return '<li class="kinds__row rv"><span class="kinds__name">' + esc(p[0]) + '</span><span class="kinds__where">' + esc(p[1]) + '</span>' +
        '<span class="kinds__px">' + t(s.px || '') + '</span><span class="kinds__price">' + (rate(s) || 'по проекту') + '</span>' +
        ask('Рассчитать', 'btn--link', { title: 'Расчёт: ' + plain(s.name), sub: 'Укажите размеры и телефон, пришлём конфигурацию и смету с монтажом', product: s.name, type: s.id }) + '</li>';
    }).join('');
    return section('screens', 'light',
      '<div class="intro rv"><h2 class="h2">Что ещё бывает</h2><p class="intro__s">' + soft(x.sub) + '</p></div>' +
      '<ul class="kinds"><li class="kinds__head"><span>Экран</span><span>Куда ставят</span><span>Шаг пикселя</span><span>Цена</span><span></span></li>' + rows + '</ul>');
  };

  R.calc = function (c) {
    var x = c.calc, inc = c.included;
    var types = arr(c.screens && c.screens.items).filter(function (s) { return vis(s) && Number(s.rate) > 0; });
    if (!types.length) return '';
    var def = types.some(function (s) { return s.id === x.defaultType; }) ? x.defaultType : types[0].id;
    var chips = types.map(function (s) {
      return '<label class="chip"><input type="radio" name="calctype" value="' + esc(s.id) + '" data-rate="' + Number(s.rate) + '" data-name="' + attr(s.name) + '" data-px="' + attr(s.px) + '"' +
        (s.id === def ? ' checked' : '') + '><span>' + esc(split(s)[0]) + '</span></label>';
    }).join('');
    function dim(name, label, val) {
      return '<div class="dim"><span class="dim__l">' + label + '</span><div class="dim__box">' +
        '<button type="button" data-step="' + name + ':-0.5" aria-label="Меньше">−</button>' +
        '<input name="' + name + '" type="number" inputmode="decimal" min="0.5" step="0.5" value="' + Number(val || 1) + '" aria-label="' + label + ', м">' +
        '<button type="button" data-step="' + name + ':0.5" aria-label="Больше">+</button></div></div>';
    }
    var included = isOn(c, 'included') ? arr(inc.items).map(function (i) { var s = plain(i.title); return s.charAt(0).toLowerCase() + s.slice(1); }).join(', ') : '';
    var row = function (k, label) { return '<div><dt>' + label + '</dt><dd data-out="' + k + '">—</dd></div>'; };
    return section('calc', 'light',
      '<div class="calc"><div class="calc__l rv"><h2 class="h2">' + t(x.title) + '</h2><p class="intro__s">' + soft(x.sub) + '</p>' +
      (included ? '<p class="calc__inc">В цену входит: ' + esc(included) + '</p>' : '') +
      (x.excludes ? '<p class="calc__ex">' + t(x.excludes) + '</p>' : '') + '</div>' +
      '<form class="calc__f rv" data-calc data-mount-share="' + Number(x.mountShare || 0) + '" onsubmit="return false">' +
      '<p class="calc__lab">Какой экран</p><div class="chips">' + chips + '</div>' +
      '<p class="calc__lab">Размер, метры</p><div class="dims">' + dim('w', 'Ширина', x.defaultWidth || 6) + '<span class="dims__x">×</span>' + dim('h', 'Высота', x.defaultHeight || 3) + '</div>' +
      '<label class="tgl"><input type="checkbox" name="mount" checked><i aria-hidden="true"></i><span>' + soft(x.mountLabel || 'Включить монтаж') + '</span></label>' +
      '<div class="calc__out"><p class="calc__lab">Ориентир</p><p class="calc__price" data-out="price"></p>' +
      '<dl class="calc__rows">' + row('area', 'Площадь') + row('type', 'Тип') + row('px', 'Шаг пикселя') + row('rate', 'За м²') + row('mount', 'Монтаж и конструкция') + '</dl>' +
      ask(x.button || 'Получить точную смету', 'btn--block', { title: 'Точная смета', sub: 'Пришлём конфигурацию и смету с монтажом в течение рабочего дня', extra: ' data-calc-ask' }) +
      '</div></form></div>', 'sec--paper');
  };

  /* Как это происходит: письмо от менеджера, иначе этапы абзацами */
  R.process = function (c) {
    var x = c.process, s = c.settings || {};
    var body = x.letter ? paras(x.letter) : arr(x.items).filter(vis).map(function (i) {
      return '<p><b>' + t(i.title) + (i.term ? ', ' + plain(i.term).toLowerCase() : '') + '.</b> ' + t(i.text) + '</p>';
    }).join('');
    if (!body) return '';
    return section('process', 'light',
      '<div class="letter"><div class="letter__l rv"><h2 class="h2">' + t(x.title) + '</h2>' + (x.sub && !x.letter ? '<p class="intro__s">' + soft(x.sub) + '</p>' : '') + '</div>' +
      '<div class="letter__b rv">' + body +
      '<p class="letter__sign"><b>' + t(s.contactName) + '</b><span>' + soft(s.contactRole) + '</span>' +
      (s.phone ? '<a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') + '</p>' +
      '</div></div>');
  };

  R.about = function (c) {
    var x = c.about;
    var docs = arr(x.docs).filter(vis).map(function (d) { return '<li>' + soft(d.text) + '</li>'; }).join('');
    return section('about', 'light',
      '<div class="about"><div class="about__l rv"><p class="label">' + soft(x.eyebrow || 'Кто мы') + '</p><h2 class="h2 h2--s">' + t(x.title) + '</h2></div>' +
      '<div class="about__b rv">' + paras(x.text) + (docs ? '<ul class="about__docs">' + docs + '</ul>' : '') + '</div></div>', 'sec--paper');
  };

  /* Только настоящие отзывы: заглушки в [[...]] не показываем */
  R.reviews = function (c) {
    var x = c.reviews, items = arr(x.items).filter(function (r) { return vis(r) && !stub(r.text); });
    if (!items.length) return '';
    var cards = items.map(function (r) {
      return '<figure class="rev rv"><blockquote>' + t(r.text) + '</blockquote><figcaption><b>' + t(r.name) + '</b> ' + soft(r.object) + '</figcaption></figure>';
    }).join('');
    return section('reviews', 'light', '<h2 class="h2 rv">' + t(x.title) + '</h2><div class="revs">' + cards + '</div>');
  };

  R.cta = function (c) {
    var x = c.cta, s = c.settings || {};
    return section('cta', 'dark',
      '<div class="band rv"><div><h2 class="h2">' + t(x.title) + '</h2>' + (x.text ? '<p class="band__s">' + soft(x.text) + '</p>' : '') + '</div>' +
      '<div class="band__a">' + ask(x.button || 'Отправить фото', 'btn--white', { title: plain(x.title), sub: plain(x.text) }) +
      (x.showPhone && s.phone ? '<a class="band__phone" href="' + tel(s.phone) + '">или ' + esc(s.phone) + '</a>' : '') + '</div></div>', 'sec--ink');
  };

  R.faq = function (c) {
    var x = c.faq, items = arr(x.items).filter(vis);
    if (!items.length) return '';
    var list = items.map(function (q, n) {
      var open = !!q.open;
      return '<div class="faq__item' + (open ? ' is-open' : '') + '"><h3><button class="faq__q" type="button" aria-expanded="' + open + '" aria-controls="faq-' + n + '">' + t(q.q) + '</button></h3>' +
        '<div class="faq__a" id="faq-' + n + '"><div>' + paras(q.talk || q.a) + '</div></div></div>';
    }).join('');
    return section('faq', 'light', '<div class="faq"><h2 class="h2 rv">' + t(x.title) + '</h2><div class="faq__list rv">' + list + '</div></div>');
  };

  R.contacts = function (c) {
    var x = c.contacts, s = c.settings || {};
    var msg = messengers(c);
    return section('contacts', 'light',
      '<div class="cont"><div class="cont__l rv"><h2 class="h2">' + esc(dative(plain(s.contactName).split(/\s+/)[0]) ? 'Написать ' + dative(plain(s.contactName).split(/\s+/)[0]) : plain(x.title || 'Контакты')) + '</h2>' +
      (x.sub ? '<p class="intro__s">' + soft(x.sub) + '</p>' : '') +
      '<p class="cont__who"><b>' + t(s.contactName) + '</b><span>' + soft(s.contactRole) + '</span></p>' +
      (s.phone ? '<a class="cont__phone" href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') +
      '<p class="cont__lines">' + (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') + (s.hours ? '<span>' + soft(s.hours) + '</span>' : '') + (s.address ? '<span>' + soft(s.address) + (s.addressNote ? ', ' + plain(s.addressNote).toLowerCase() : '') + '</span>' : '') + '</p>' +
      (msg ? '<p class="cont__msg">' + msg + '</p>' : '') + '</div>' +
      '<form class="cform rv" data-done="' + attr(s.formDone || 'Заявка принята') + '">' +
      '<p class="cform__t">' + soft(x.formSub || x.formTitle) + '</p>' +
      '<div class="frow"><label class="fld"><span>Имя</span><input name="name" autocomplete="name" placeholder="Как к вам обращаться"></label>' +
      '<label class="fld"><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" placeholder="+7" required></label></div>' +
      '<label class="fld"><span>Какой экран</span><select name="type">' + typeOptions(c) + '</select></label>' +
      '<label class="fld"><span>Где и какого размера</span><textarea name="msg" rows="3" placeholder="Например: витрина 4 на 2,5 метра на первом этаже"></textarea></label>' +
      '<label class="upload"><span>Приложить фото места</span><input type="file" accept="image/*,.pdf" hidden></label>' +
      submitBtn(x.formButton || 'Отправить', 'btn--block') + consent(c) + '</form></div>');
  };

  R.footer = function (c) {
    var s = c.settings || {}, f = c.footer || {};
    return '<footer class="foot" data-tone="dark"><div class="wrap">' +
      '<div class="foot__top"><a class="foot__brand" href="#top"><img src="../logos/v3-logo-white.svg" alt="' + attr(s.brandName) + '" width="150" height="38"></a>' +
      '<nav class="foot__nav" aria-label="Разделы">' + menuLinks(c) + '</nav>' +
      '<div class="foot__c">' + (s.phone ? '<a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a>' : '') + (s.email ? '<a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a>' : '') + '</div></div>' +
      '<div class="foot__legal"><span>' + (f.legal ? t(f.legal) + '<br>' : '') + (f.note ? soft(f.note) : '') + '</span>' +
      '<a href="' + attr(s.policyUrl || '#') + '">Политика обработки персональных данных</a></div>' +
      '</div></footer>';
  };

  R.mbar = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="mbar">' + (s.phone ? '<a class="mbar__call" href="' + tel(s.phone) + '">Позвонить</a>' : '') +
      ask(s.headerButton || 'Получить расчёт', 'btn--block', { title: h.formTitle, sub: h.formSub }) + '</div>';
  };

  R.modal = function (c) {
    var s = c.settings || {}, h = c.hero || {};
    return '<div class="modal" data-modal aria-hidden="true"><div class="modal__bg" data-close-modal></div>' +
      '<div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
      '<button class="modal__x" type="button" data-close-modal aria-label="Закрыть">Закрыть</button>' +
      '<form data-default-title="' + attr(h.formTitle || 'Получить расчёт экрана') + '" data-default-sub="' + attr(h.formSub || '') + '" data-done="' + attr(s.formDone || 'Заявка принята') + '">' +
      '<h3 class="modal__t" id="m-title" data-m-title></h3><p class="modal__s" data-m-sub></p>' +
      '<p class="modal__prod" data-m-prod hidden>Экран: <b></b></p>' +
      '<label class="fld"><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" placeholder="+7" required></label>' +
      '<label class="fld"><span>Какой экран</span><select name="type">' + typeOptions(c, (c.calc || {}).defaultType) + '</select></label>' +
      '<div class="frow frow--2"><label class="fld"><span>Ширина, м</span><input name="w" inputmode="decimal" placeholder="6"></label>' +
      '<label class="fld"><span>Высота, м</span><input name="h" inputmode="decimal" placeholder="3"></label></div>' +
      submitBtn(h.formButton || 'Получить расчёт', 'btn--block') + consent(c) + '</form>' +
      (s.phone ? '<p class="modal__alt">Или позвоните: <a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a></p>' : '') +
      '</div></div>';
  };

  function render(c) {
    c.settings = c.settings || {};
    var order = arr(c.blocks).filter(function (b) { return b.visible !== false && R[b.id] && c[b.id]; }).map(function (b) { return b.id; });
    /* Главы объектов идут раньше списка типов: типы в этом варианте дополняют истории, а не наоборот */
    var si = order.indexOf('screens'), ci = order.indexOf('cases');
    if (si > -1 && ci > si) { order.splice(si, 1); order.splice(order.indexOf('cases') + 1, 0, 'screens'); }
    var parts = [R.header(c), R.sheet(c), '<main id="main">', R.hero(c)];
    order.forEach(function (id) { var out = R[id](c); if (out) parts.push(out); });
    parts.push('</main>', R.footer(c), R.mbar(c), R.modal(c));
    document.getElementById('app').innerHTML = parts.join('');
    if (c.meta) {
      document.title = plain(c.meta.title);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', plain(c.meta.description));
    }
    if (window.V5App) window.V5App.init(c);
  }

  window.V5Render = { render: render, plain: plain };

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
