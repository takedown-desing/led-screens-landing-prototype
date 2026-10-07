/* Описание разделов и полей админки. Пути полей верхнего уровня абсолютные (hero.h1),
   поля внутри списков задаются относительно элемента списка. */
(function () {
  'use strict';
  function uid() { return Math.random().toString(36).slice(2, 8); }
  function plain(s) { return String(s == null ? '' : s).replace(/\[\[([\s\S]+?)\]\]/g, '$1'); }
  function head(root) {
    return [
      { k: root + '.eyebrow', type: 'text', label: 'Надзаголовок', hint: 'Мелкая строка над заголовком. Можно оставить пустой' },
      { k: root + '.title', type: 'text', label: 'Заголовок раздела' },
      { k: root + '.sub', type: 'textarea', rows: 2, label: 'Подзаголовок' }
    ];
  }
  function icons() {
    var L = (window.LandingRender && window.LandingRender.ICON_LABELS) || {};
    return Object.keys(L).map(function (k) { return [k, L[k]]; });
  }
  var kv = [
    { k: 'k', type: 'text', label: 'Название', placeholder: 'Шаг пикселя' },
    { k: 'v', type: 'text', label: 'Значение', placeholder: 'P3.9' }
  ];

  var BLOCK_NAMES = {
    trust: 'Цифры доверия', screens: 'Типы экранов', cases: 'Объекты (видео)', included: 'Что входит',
    process: 'Как работаем', calc: 'Стоимость и калькулятор', specs: 'Таблица подбора', about: 'О компании',
    reviews: 'Отзывы', cta: 'Призыв «Пришлите фото»', faq: 'Вопросы и ответы', contacts: 'Контакты и форма'
  };

  var PAGES = [
    {
      id: 'settings', title: 'Контакты и общие данные', scroll: 'top', group: 'Общее',
      intro: 'Эти данные выводятся сразу в нескольких местах: шапка, мобильное меню, контакты, подвал, кнопки звонка.',
      fields: [
        { type: 'group', label: 'Название и логотип', fields: [
          { k: 'settings.brandMark', type: 'text', label: 'Буквы в значке логотипа', hint: 'До 3 символов', max: 3 },
          { k: 'settings.brandName', type: 'text', label: 'Название в шапке' },
          { k: 'settings.brandTagline', type: 'text', label: 'Строка под названием' },
          { k: 'settings.companyName', type: 'text', label: 'Полное название компании', hint: 'Подвал сайта' }
        ] },
        { type: 'group', label: 'Контактное лицо и связь', fields: [
          { k: 'settings.contactName', type: 'text', label: 'Имя' },
          { k: 'settings.contactRole', type: 'text', label: 'Чем занимается' },
          { k: 'settings.phone', type: 'text', label: 'Телефон', hint: 'Ссылка для звонка собирается из цифр автоматически' },
          { k: 'settings.phoneNote', type: 'text', label: 'Подпись под телефоном в шапке' },
          { k: 'settings.hours', type: 'text', label: 'Режим работы', hint: 'Раздел «Контакты»' },
          { k: 'settings.email', type: 'text', label: 'Email' },
          { k: 'settings.emailNote', type: 'text', label: 'Подпись под email' },
          { k: 'settings.address', type: 'text', label: 'Адрес' },
          { k: 'settings.addressNote', type: 'text', label: 'Подпись под адресом' }
        ] },
        { type: 'group', label: 'Мессенджеры', hint: 'Полная ссылка, например https://wa.me/79067672566 или https://t.me/имя. Пустое поле убирает кнопку с сайта.', fields: [
          { k: 'settings.whatsapp', type: 'text', label: 'WhatsApp' },
          { k: 'settings.telegram', type: 'text', label: 'Telegram' },
          { k: 'settings.max', type: 'text', label: 'MAX' }
        ] },
        { type: 'group', label: 'Кнопки и формы', fields: [
          { k: 'settings.headerButton', type: 'text', label: 'Кнопка в шапке и на телефоне' },
          { k: 'settings.formDone', type: 'text', label: 'Текст после отправки формы' },
          { k: 'settings.formOther', type: 'text', label: 'Последний пункт в списке типов экрана' },
          { k: 'settings.policyUrl', type: 'text', label: 'Ссылка на политику обработки персональных данных' }
        ] },
        { type: 'group', label: 'Для поисковиков', fields: [
          { k: 'meta.title', type: 'text', label: 'Title страницы', hint: 'Заголовок во вкладке браузера и в выдаче. До 70 символов', counter: 70 },
          { k: 'meta.description', type: 'textarea', rows: 3, label: 'Description', hint: 'Описание в выдаче. До 160 символов', counter: 160 }
        ] }
      ]
    },
    {
      id: 'blocks', title: 'Блоки: порядок и показ', scroll: 'top', group: 'Общее', special: 'blocks',
      intro: 'Стрелками меняется порядок блоков на странице. Галочка включает и выключает блок. Если заполнить «Пункт меню», блок появится в меню шапки и подвала. Шапка, первый экран и подвал всегда на месте.'
    },
    {
      id: 'hero', title: 'Первый экран', scroll: 'top', group: 'Блоки',
      fields: [
        { k: 'hero.badge', type: 'text', label: 'Строка региона над заголовком' },
        { k: 'hero.h1', type: 'textarea', rows: 2, label: 'Главный заголовок (H1)' },
        { k: 'hero.titleShort', type: 'text', label: 'Короткий заголовок на видео (варианты дизайна 4 и 5)', hint: 'Крупный заголовок первого экрана в вариантах 4 и 5. Пустое поле: выводится главный заголовок' },
        { type: 'group', label: 'Витрина включается (вариант дизайна 5)', fields: [
          { k: 'hero.sceneOff', type: 'text', label: 'Подпись, пока экран выключен' },
          { k: 'hero.sceneOn', type: 'text', label: 'Подпись, когда экран включился' }
        ] },
        { k: 'hero.lead', type: 'textarea', rows: 4, label: 'Подзаголовок' },
        { k: 'hero.video', type: 'media', kind: 'video', label: 'Фоновое видео', poster: 'hero.poster', hint: 'MP4 без звука, лучше до 10 МБ. Если видео нет, фоном станет картинка ниже' },
        { k: 'hero.poster', type: 'media', kind: 'image', label: 'Картинка фона', hint: 'Показывается, пока грузится видео, и вместо него' },
        { k: 'hero.facts', type: 'list', label: 'Факты под подзаголовком', addLabel: 'Добавить факт', max: 3,
          title: function (i) { return i.title; }, make: function () { return { title: 'Новый факт', text: '' }; },
          item: [
            { k: 'title', type: 'text', label: 'Жирная строка' },
            { k: 'text', type: 'text', label: 'Пояснение' }
          ] },
        { k: 'hero.button1', type: 'text', label: 'Основная кнопка', hint: 'Ведёт к калькулятору' },
        { k: 'hero.button2', type: 'text', label: 'Вторая кнопка', hint: 'Ведёт к объектам. Пустое поле убирает кнопку' },
        { k: 'hero.note', type: 'text', label: 'Подпись рядом с кнопками' },
        { type: 'group', label: 'Форма справа', fields: [
          { k: 'hero.formTitle', type: 'text', label: 'Заголовок формы' },
          { k: 'hero.formSub', type: 'text', label: 'Подпись формы' },
          { k: 'hero.formButton', type: 'text', label: 'Текст кнопки' }
        ] }
      ]
    },
    {
      id: 'trust', title: 'Цифры доверия', scroll: 'trust', group: 'Блоки',
      fields: [
        { k: 'trust.items', type: 'list', label: 'Цифры', addLabel: 'Добавить цифру', max: 4,
          title: function (i) { return plain(i.value) + ' ' + plain(i.label); }, make: function () { return { value: '0', label: '' }; },
          item: [
            { k: 'value', type: 'text', label: 'Число', placeholder: '120+' },
            { k: 'label', type: 'text', label: 'Подпись' }
          ] }
      ]
    },
    {
      id: 'screens', title: 'Типы экранов', scroll: 'screens', group: 'Блоки',
      intro: 'Типы экранов попадают в карточки, в списки «Тип экрана» во всех формах и в калькулятор. Ставка за м² больше нуля включает тип в калькулятор.',
      fields: head('screens').concat([
        { k: 'screens.helpButton', type: 'text', label: 'Кнопка справа от заголовка', hint: 'Пустое поле убирает кнопку' },
        { k: 'screens.items', type: 'list', label: 'Карточки', addLabel: 'Добавить тип экрана',
          title: function (i) { return i.name; },
          make: function () { return { id: uid(), name: 'Новый тип экрана', shortName: '', desc: '', video: '', image: '', chip: '', specs: [], rate: 0, px: '', caseFilter: '', visible: true }; },
          item: [
            { k: 'visible', type: 'checkbox', label: 'Показывать на сайте' },
            { k: 'name', type: 'text', label: 'Название карточки' },
            { k: 'shortName', type: 'text', label: 'Короткое название', hint: 'Для списков в формах и калькулятора, например «Уличный: фасад, медиафасад»' },
            { k: 'desc', type: 'textarea', rows: 3, label: 'Описание' },
            { k: 'video', type: 'media', kind: 'video', label: 'Видео', poster: 'image', hint: 'MP4 без звука, играет в карточке само. Превью создастся из кадра автоматически' },
            { k: 'image', type: 'media', kind: 'image', label: 'Превью или фото', hint: 'Картинка до запуска видео. Без видео карточка показывается с этой картинкой' },
            { k: 'chip', type: 'text', label: 'Подпись на фото', hint: 'Пустое поле убирает подпись' },
            { k: 'specs', type: 'list', inline: true, label: 'Характеристики', addLabel: 'Добавить строку', max: 6, item: kv, make: function () { return { k: '', v: '' }; } },
            { k: 'rate', type: 'number', label: 'Ставка за м², ₽', min: 0, step: 1000, hint: '0 — тип не участвует в калькуляторе' },
            { k: 'px', type: 'text', label: 'Рекомендуемый шаг пикселя', hint: 'Показывается в калькуляторе' },
            { k: 'caseFilter', type: 'select', label: 'Кнопка «Примеры» открывает объекты', options: function (c) {
              return [['', 'Все объекты']].concat((c.cases.filters || []).map(function (f) { return [f.id, plain(f.label)]; }));
            } }
          ] }
      ])
    },
    {
      id: 'cases', title: 'Объекты (видео)', scroll: 'cases', group: 'Блоки',
      intro: 'Сначала задайте фильтры, потом отметьте у каждого объекта, к каким фильтрам он относится. Фильтр без объектов на сайте не показывается.',
      fields: head('cases').concat([
        { k: 'cases.allLabel', type: 'text', label: 'Название фильтра «все»' },
        { k: 'cases.filters', type: 'list', inline: true, label: 'Фильтры', addLabel: 'Добавить фильтр', refresh: true,
          make: function () { return { id: uid(), label: 'Новый фильтр' }; },
          item: [{ k: 'label', type: 'text', label: 'Название фильтра' }] },
        { k: 'cases.items', type: 'list', label: 'Объекты', addLabel: 'Добавить объект',
          title: function (i) { return i.title; },
          make: function () { return { type: '', title: 'Новый объект', desc: '', video: '', poster: '', filters: [], facts: [], visible: true }; },
          item: [
            { k: 'visible', type: 'checkbox', label: 'Показывать на сайте' },
            { k: 'type', type: 'text', label: 'Тип объекта', hint: 'Мелкая строка над названием' },
            { k: 'title', type: 'text', label: 'Название' },
            { k: 'desc', type: 'textarea', rows: 3, label: 'Описание' },
            { k: 'story', type: 'textarea', rows: 3, label: 'Рассказ об объекте (вариант дизайна 5)', hint: 'Два-три живых предложения вместо описания. Пустое поле: выводится описание' },
            { k: 'video', type: 'media', kind: 'video', label: 'Видео', poster: 'poster', hint: 'MP4, лучше до 10 МБ. Превью создастся из кадра автоматически' },
            { k: 'poster', type: 'media', kind: 'image', label: 'Превью', hint: 'Картинка до запуска видео. Без видео объект показывается с этой картинкой' },
            { k: 'filters', type: 'multicheck', label: 'Фильтры', options: function (c) { return (c.cases.filters || []).map(function (f) { return [f.id, plain(f.label)]; }); } },
            { k: 'facts', type: 'list', inline: true, label: 'Параметры', addLabel: 'Добавить параметр', max: 4, item: kv, make: function () { return { k: '', v: '' }; } }
          ] }
      ])
    },
    {
      id: 'included', title: 'Что входит', scroll: 'included', group: 'Блоки',
      fields: head('included').concat([
        { k: 'included.items', type: 'list', label: 'Пункты', addLabel: 'Добавить пункт',
          title: function (i) { return i.title; }, make: function () { return { icon: 'check', title: 'Новый пункт', text: '' }; },
          item: [
            { k: 'icon', type: 'icon', label: 'Иконка', options: icons },
            { k: 'title', type: 'text', label: 'Заголовок' },
            { k: 'text', type: 'textarea', rows: 3, label: 'Текст' }
          ] }
      ])
    },
    {
      id: 'process', title: 'Как работаем', scroll: 'process', group: 'Блоки',
      fields: head('process').concat([
        { k: 'process.letter', type: 'textarea', rows: 10, label: 'Письмо от менеджера (вариант дизайна 5)', hint: 'От первого лица, пустая строка начинает новый абзац. Подпись берётся из контактов. Пустое поле: выводятся этапы ниже' },
        { k: 'process.items', type: 'list', label: 'Этапы', addLabel: 'Добавить этап', hint: 'Номера проставляются сами по порядку',
          title: function (i) { return i.title; }, make: function () { return { title: 'Новый этап', text: '', term: '' }; },
          item: [
            { k: 'title', type: 'text', label: 'Название' },
            { k: 'text', type: 'textarea', rows: 3, label: 'Описание' },
            { k: 'term', type: 'text', label: 'Срок' }
          ] }
      ])
    },
    {
      id: 'calc', title: 'Стоимость и калькулятор', scroll: 'calc', group: 'Блоки',
      intro: 'Ставки за м² и шаг пикселя задаются в разделе «Типы экранов». Здесь тексты и правила расчёта.',
      fields: head('calc').concat([
        { k: 'calc.formTitle', type: 'text', label: 'Заголовок калькулятора' },
        { k: 'calc.formSub', type: 'text', label: 'Подпись калькулятора' },
        { k: 'calc.defaultType', type: 'select', label: 'Тип экрана по умолчанию', options: function (c) {
          return (c.screens.items || []).filter(function (s) { return s.visible !== false && Number(s.rate) > 0; }).map(function (s) { return [s.id, plain(s.shortName || s.name)]; });
        } },
        { k: 'calc.defaultWidth', type: 'number', label: 'Ширина по умолчанию, м', min: 0.5, step: 0.5 },
        { k: 'calc.defaultHeight', type: 'number', label: 'Высота по умолчанию, м', min: 0.5, step: 0.5 },
        { k: 'calc.mountShare', type: 'number', label: 'Монтаж и конструкция, % от стоимости экрана', min: 0, step: 1 },
        { k: 'calc.mountLabel', type: 'text', label: 'Подпись галочки монтажа' },
        { k: 'calc.draftRates', type: 'checkbox', label: 'Ставки условные: подсвечивать оранжевым в таблице' },
        { k: 'calc.excludes', type: 'textarea', rows: 3, label: 'Что не входит в ориентир' },
        { k: 'calc.button', type: 'text', label: 'Кнопка под результатом' }
      ])
    },
    {
      id: 'specs', title: 'Таблица подбора', scroll: 'specs', group: 'Блоки',
      fields: head('specs').concat([
        { k: 'specs.rows', type: 'list', label: 'Строки таблицы', addLabel: 'Добавить строку',
          title: function (i) { return i.px + ' · ' + i.dist; }, make: function () { return { px: '', dist: '', where: '', type: '', bright: '' }; },
          item: [
            { k: 'px', type: 'text', label: 'Шаг пикселя' },
            { k: 'dist', type: 'text', label: 'Минимальное расстояние просмотра' },
            { k: 'where', type: 'text', label: 'Где применяется' },
            { k: 'type', type: 'text', label: 'Тип экрана' },
            { k: 'bright', type: 'text', label: 'Яркость' }
          ] }
      ])
    },
    {
      id: 'about', title: 'О компании', scroll: 'about', group: 'Блоки',
      fields: [
        { k: 'about.eyebrow', type: 'text', label: 'Надзаголовок' },
        { k: 'about.title', type: 'text', label: 'Заголовок' },
        { k: 'about.text', type: 'textarea', rows: 8, label: 'Текст', hint: 'Пустая строка начинает новый абзац' },
        { k: 'about.video', type: 'media', kind: 'video', label: 'Видео', poster: 'about.image', hint: 'MP4 без звука, играет само. Превью создастся из кадра автоматически' },
        { k: 'about.image', type: 'media', kind: 'image', label: 'Превью или фото', hint: 'Картинка до запуска видео. Без видео показывается она' },
        { k: 'about.docs', type: 'list', label: 'Документы и факты', addLabel: 'Добавить пункт',
          title: function (i) { return i.text; }, make: function () { return { icon: 'doc', text: '' }; },
          item: [
            { k: 'icon', type: 'icon', label: 'Иконка', options: icons },
            { k: 'text', type: 'text', label: 'Текст' }
          ] }
      ]
    },
    {
      id: 'reviews', title: 'Отзывы', scroll: 'reviews', group: 'Блоки',
      intro: 'Если ни один отзыв не отмечен «Показывать», блок на сайте скрывается сам.',
      fields: [
        { k: 'reviews.eyebrow', type: 'text', label: 'Надзаголовок' },
        { k: 'reviews.title', type: 'text', label: 'Заголовок' },
        { k: 'reviews.items', type: 'list', label: 'Отзывы', addLabel: 'Добавить отзыв',
          title: function (i) { return i.name; }, make: function () { return { name: 'Новый отзыв', object: '', text: '', stars: 5, visible: true }; },
          item: [
            { k: 'visible', type: 'checkbox', label: 'Показывать на сайте' },
            { k: 'name', type: 'text', label: 'Имя или компания' },
            { k: 'object', type: 'text', label: 'Объект', placeholder: 'Прозрачный экран в витрину, 42 м²' },
            { k: 'text', type: 'textarea', rows: 4, label: 'Текст отзыва' },
            { k: 'stars', type: 'number', label: 'Оценка, звёзд', min: 0, step: 1, max: 5 }
          ] }
      ]
    },
    {
      id: 'cta', title: 'Призыв «Пришлите фото»', scroll: 'cta', group: 'Блоки',
      fields: [
        { k: 'cta.title', type: 'text', label: 'Заголовок' },
        { k: 'cta.text', type: 'textarea', rows: 2, label: 'Текст' },
        { k: 'cta.button', type: 'text', label: 'Текст кнопки' },
        { k: 'cta.showPhone', type: 'checkbox', label: 'Показывать кнопку с телефоном' }
      ]
    },
    {
      id: 'faq', title: 'Вопросы и ответы', scroll: 'faq', group: 'Блоки',
      fields: [
        { k: 'faq.eyebrow', type: 'text', label: 'Надзаголовок' },
        { k: 'faq.title', type: 'text', label: 'Заголовок' },
        { k: 'faq.items', type: 'list', label: 'Вопросы', addLabel: 'Добавить вопрос',
          title: function (i) { return i.q; }, make: function () { return { q: 'Новый вопрос', a: '', open: false }; },
          item: [
            { k: 'q', type: 'text', label: 'Вопрос' },
            { k: 'a', type: 'textarea', rows: 4, label: 'Ответ', hint: 'Пустая строка начинает новый абзац' },
            { k: 'talk', type: 'textarea', rows: 4, label: 'Ответ разговорный (вариант дизайна 5)', hint: 'Пустое поле: выводится обычный ответ' },
            { k: 'open', type: 'checkbox', label: 'Раскрыт при загрузке страницы' }
          ] }
      ]
    },
    {
      id: 'contacts', title: 'Контакты и форма', scroll: 'contacts', group: 'Блоки',
      intro: 'Телефон, email, адрес и мессенджеры берутся из раздела «Контакты и общие данные».',
      fields: head('contacts').concat([
        { k: 'contacts.formTitle', type: 'text', label: 'Заголовок формы' },
        { k: 'contacts.formSub', type: 'text', label: 'Подпись формы' },
        { k: 'contacts.formButton', type: 'text', label: 'Текст кнопки' },
        { k: 'contacts.mapNote', type: 'textarea', rows: 2, label: 'Заглушка карты', hint: 'На этапе разработки здесь будет карта по адресу. Пустое поле убирает блок карты' }
      ])
    },
    {
      id: 'footer', title: 'Подвал', scroll: 'footer', group: 'Блоки',
      fields: [
        { k: 'footer.about', type: 'textarea', rows: 2, label: 'Описание под названием компании' },
        { k: 'footer.legal', type: 'textarea', rows: 2, label: 'Реквизиты' },
        { k: 'footer.note', type: 'textarea', rows: 2, label: 'Примечание' }
      ]
    }
  ];

  window.ADMIN_SCHEMA = { pages: PAGES, blockNames: BLOCK_NAMES, uid: uid, plain: plain };
})();
