---
version: alpha
name: Pixel Daylight
description: Светлый продающий лендинг поставки и монтажа LED-экранов в Москве и МО. Белые и светло-серые секции чередуются с глубокими тёмно-синими, в которых светятся видео экранов. Один акцент, электрический синий, и LED-градиент только как свечение.
colors:
  primary: "#2F5BFF"
  primary-hover: "#1E46E6"
  on-primary: "#FFFFFF"
  ink: "#0B1220"
  text: "#0B1220"
  text-muted: "#5B6577"
  background: "#FFFFFF"
  surface: "#F4F6FA"
  surface-strong: "#EAEEF5"
  border: "#DDE3EC"
  dark: "#0B1220"
  dark-card: "#141C2E"
  dark-border: "#25304A"
  on-dark: "#FFFFFF"
  on-dark-muted: "#A5B0C6"
  glow-cyan: "#22D3EE"
  glow-magenta: "#FF3D9A"
typography:
  display:
    fontFamily: Onest
    fontSize: 4.5rem
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.035em
  h1:
    fontFamily: Onest
    fontSize: 3.5rem
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: -0.03em
  h2:
    fontFamily: Onest
    fontSize: 2.75rem
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: -0.025em
  h3:
    fontFamily: Onest
    fontSize: 1.375rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  stat:
    fontFamily: Onest
    fontSize: 3.5rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.04em
  body-lg:
    fontFamily: Onest
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Onest
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Onest
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Onest
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.06em
  button:
    fontFamily: Onest
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: 8px
  md: 14px
  lg: 24px
  xl: 32px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  section: 120px
  gutter: 24px
  container: 1280px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 18px 28px
    height: 56px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 18px 28px
    height: 56px
  button-on-dark:
    backgroundColor: "{colors.on-dark}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 18px 28px
    height: 56px
  nav-bar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    height: 64px
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-dark:
    backgroundColor: "{colors.dark-card}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: 24px
  media-tile:
    backgroundColor: "{colors.dark}"
    rounded: "{rounded.xl}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 8px 14px
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px 18px
    height: 56px
  price-display:
    textColor: "{colors.on-dark}"
    typography: "{typography.display}"
  caption:
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
  caption-on-dark:
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.body-sm}"
  table-header:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: 14px 20px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  divider-dark:
    backgroundColor: "{colors.dark-border}"
    height: 1px
  glow-cyan:
    backgroundColor: "{colors.glow-cyan}"
    rounded: "{rounded.full}"
    size: 420px
  glow-magenta:
    backgroundColor: "{colors.glow-magenta}"
    rounded: "{rounded.full}"
    size: 420px
---

## Overview

Лендинг принимает заявки на поставку и монтаж светодиодных экранов в Москве и Московской области. Компания: «Хайнань Хэнпэн Международная Торговля», бренд на сайте ХЭНПЭН. Контакт: Иван Меньшов, +7 906 767-25-66, imenshov@addu.ru. Трафик платный, поэтому каждый экран страницы должен вести к заявке «Получить расчёт».

Характер: светлый, яркий, дорогой, технологичный. Как витрина производителя премиальной техники при дневном свете. Компания продаёт экраны, которые светятся, поэтому сам сайт должен выглядеть так же ярко и аккуратно: если лендинг некрасивый, клиент не поверит, что красивый экран сделают ему.

Три требования заказчика, которые нельзя нарушать:

1. Страница не тёмная. Светлые секции преобладают, тёмные идут ритмом там, где показываем светящиеся экраны.
2. На первом экране сразу видно работающий LED-экран: крупное фото или видео экрана, а не абстрактный фон. Формы на первом экране нет, есть кнопка «Получить расчёт».
3. Всё выровнено. Карточки в одном ряду одной высоты, картинки одного размера, кнопки на одной линии. Никаких «лесенок».

## Colors

Палитра: белый, холодные светло-серые, глубокий чернильный синий и один акцент.

- **Primary (#2F5BFF):** электрический синий. Только действие: главные кнопки, активные пилюли, ссылки, цена в калькуляторе на светлом. Белый текст на нём проходит WCAG AA.
- **Ink (#0B1220):** заголовки, основной текст, фон тёмных секций. Почти чёрный с синевой, мягче чистого чёрного.
- **Text muted (#5B6577):** описания, подписи, характеристики.
- **Background (#FFFFFF) и Surface (#F4F6FA, #EAEEF5):** светлые секции чередуются белой и серой, чтобы страница читалась блоками без тяжёлых разделителей.
- **Dark (#0B1220), Dark card (#141C2E):** тёмные секции и карточки в них. На тёмном фоне видео экранов светится, как вечером на улице.
- **Glow cyan (#22D3EE) и Glow magenta (#FF3D9A):** LED-градиент. Только декоративное свечение: размытый ореол за видео в hero, тонкая полоса прогресса в карусели, точки «пикселей» в фоне. Никогда не для текста и не для кнопок.

## Typography

Один шрифт Onest (Google Fonts, полная кириллица), веса 400–700. Заголовки плотные, с отрицательным трекингом, короткими строками. Крупные цифры (сроки, гарантия, цена, статистика) набираются стилем `stat` или `display`: цифра работает как главный аргумент. Подписи над заголовками (eyebrow) стилем `label` заглавными буквами с разрядкой. Текст абзацев не шире 640px.

## Layout

Контейнер 1280px, поля 24px на мобиле, 40px на планшете, 64px на десктопе. Сетка 12 колонок, отступ между колонками 24px. Вертикальный ритм секций 120px на десктопе, 72px на мобиле.

Порядок и фон секций (светлое и тёмное чередуются):

1. **Шапка** (поверх hero): белая плавающая пилюля с тенью. Логотип ХЭНПЭН, меню (Типы экранов, Объекты, Как работаем, Стоимость, Вопросы, Контакты), телефон, кнопка «Получить расчёт». На мобиле бургер и нижняя шторка.
2. **Hero** (белый с мягким LED-свечением): слева eyebrow «Москва и Московская область, монтаж своими бригадами», h1 «Светодиодные LED-экраны с поставкой и монтажом под ключ», лид, две кнопки «Получить расчёт» и «Смотреть объекты», три факта строкой: «Расчёт за 1 рабочий день», «Поставка от 25 дней», «Гарантия 3 года». Справа большой видео-тайл экрана (интерьерная LED-стена «волна»), скругление 32px, за ним размытый ореол cyan-magenta.
3. **Цифры доверия** (белый): 4 крупные цифры в ряд: 120+ объектов, 4 500 м² за год, с 2015 года, 24 ч реакция сервиса.
4. **Типы экранов** (surface): сетка 3×2 одинаковых карточек. Фото 4:3, название, 2 строки описания, 4 характеристики (ключ слева, значение справа), внизу две кнопки на одной линии.
5. **Реализованные объекты** (dark): карусель. В кадре одна большая плитка и две маленькие друг над другом справа, все с видео, которое играет само. Пилюли-фильтры, круглые стрелки, полоса прогресса. Под каруселью полоса: «Хотите такой же экран? Пришлите фото места, посчитаем за день» и кнопка.
6. **Что входит в поставку и монтаж** (белый): бенто-сетка. Две большие плитки с фото (прозрачная панель, гибкий модуль), плитка «Гарантия 3 года» с огромной цифрой, остальные плитки с иконкой и коротким текстом.
7. **Как мы работаем** (surface): горизонтальная лента из 5 шагов с номерами 01–05 и линией между ними, у каждого шага срок пилюлей.
8. **Сколько стоит** (dark): слева калькулятор (тип экрана, ширина, высота, монтаж), справа огромная цена «от 1 760 000 ₽» и кнопка «Получить точную смету».
9. **Шаг пикселя и расстояние просмотра** (белый): светлая таблица из 5 строк.
10. **О компании** (surface): фото производства и 4 пункта доверия с иконками.
11. **Отзывы** (белый): 3 карточки.
12. **Призыв** (primary, синий во всю ширину): «Пришлите фото места установки» и белая кнопка.
13. **Вопросы и ответы** (белый): аккордеон.
14. **Контакты и подвал** (dark): карточка Ивана Меньшова с телефоном и мессенджерами, форма заявки, подвал.

## Elevation & Depth

Глубина создаётся светом, а не тенями. На светлом фоне карточки плоские, отделены фоном `surface` или тонкой границей `border`. Тень есть только у плавающей шапки и у модального окна: мягкая, широкая, 0 20px 60px rgba(11,18,32,0.12). Видео-тайлы в hero и карусели получают цветной ореол: размытое пятно cyan-magenta за плиткой, 80–120px размытия, 35% прозрачности. Так экран «светится» и на светлом фоне.

## Shapes

Крупные скругления: медиа-плитки 32px, карточки 24px, поля ввода 14px, кнопки, пилюли и шапка полностью круглые. Иконки линейные, толщина 1.75px, в круглых подложках 48px. Фоновый мотив: сетка из мелких точек, как пиксели LED-модуля, очень светлая (#DDE3EC) в светлых секциях и #25304A в тёмных.

## Components

- **Кнопка primary:** синяя пилюля 56px, белый текст, справа белый кружок со стрелкой. На hover фон темнеет, стрелка поворачивается на 45°.
- **Кнопка secondary:** белая пилюля с тонкой границей, тёмный текст.
- **Пилюля-фильтр:** серая, активная тёмная с белым текстом.
- **Карточка типа экрана:** белая, 24px, фото 4:3 сверху с отступом 8px и скруглением 18px, характеристики списком с разделителями, две кнопки внизу. Все карточки в ряду строго одной высоты.
- **Видео-плитка объекта:** тёмная, 32px, видео во всю плитку, снизу градиент и текст: тип объекта, название, факты «Площадь 180 м² · Шаг P8». Кнопка «Смотреть объект» в левом нижнем углу.
- **Шаг процесса:** номер 01–05 крупно, название, 2 строки текста, срок пилюлей.
- **Плитка бенто:** белая или surface, иконка в круге, заголовок h3, текст body-sm. Плитка гарантии: цифра «3» стилем display, подпись «года гарантии».
- **Калькулятор:** поля на тёмных карточках, цена стилем display белым, подпись мелко серым.
- **Модальная форма «Получить расчёт»:** белое окно 24px, поля тип экрана, ширина, высота, телефон, согласие, кнопка primary во всю ширину.
- **Липкая мобильная панель:** на мобиле внизу экрана кнопки «Позвонить» и «Получить расчёт».

## Do's and Don'ts

- Do: чередовать светлые и тёмные секции, светлых больше.
- Do: показывать настоящие экраны клиента (видео и фото объектов) крупно, начиная с первого экрана.
- Do: выравнивать карточки по высоте, а кнопки по нижней линии.
- Do: в каждой секции давать путь к заявке: кнопка, полоса-призыв или ссылка «рассчитать».
- Do: крупные цифры для сроков, гарантии и цены.
- Don't: делать страницу целиком тёмной.
- Don't: ставить форму на первый экран вместо изображения экрана.
- Don't: использовать LED-градиент для текста, кнопок и больших заливок.
- Don't: выделять отдельные слова жёлтыми плашками и маркерами.
- Don't: использовать стоковые фото людей и абстрактные 3D-фигуры вместо реальных экранов.
