// Каталог: чтобы добавить товар, допишите запись в products.
// photo: файл из assets/img; без него карточка покажет «Фото будет добавлено».
// cover: true растягивает снимок на всю карточку; без него фото показано целиком на белом, подходит для снимков на белом фоне.
window.CATALOG = {
  categories: [
    { id: "rescue", name: "Спасательное оборудование" },
    { id: "pyro", name: "Пиротехника" },
    { id: "nav", name: "Связь и навигация" }
  ],
  products: [
    {
      name: "Спасательные плоты",
      category: "rescue",
      text: "Речные плоты любой вместимости. Продажа и переукладка.",
      photo: "assets/img/product-raft-960.webp",
      alt: "Раскрытый спасательный плот и белый контейнер для его хранения",
      keywords: "плот пско"
    },
    {
      name: "Спасательные жилеты",
      category: "rescue",
      text: "Регистровые жилеты для экипажа и пассажиров.",
      photo: "assets/img/stock-life-jackets.webp",
      alt: "Ряд оранжевых спасательных жилетов",
      cover: true,
      keywords: "жилет"
    },
    {
      name: "Спасательные круги",
      category: "rescue",
      text: "Регистровые спасательные круги для судов.",
      photo: "assets/img/product-ring-800.webp",
      alt: "Оранжевый спасательный круг с жёлтыми полосами и линем",
      keywords: "круг"
    },
    {
      name: "Спасательные буи",
      category: "rescue",
      text: "Буи для судового снабжения.",
      keywords: "буй буек"
    },
    {
      name: "Фонари для спасательных жилетов",
      category: "rescue",
      text: "Продаём фонари и меняем их на ваших жилетах.",
      photo: "assets/img/product-vest-light.webp",
      alt: "Фонарь поиска на оранжевом спасательном жилете",
      cover: true,
      keywords: "фонарь огонь жилет"
    },
    {
      name: "Гидротермокостюмы",
      category: "rescue",
      text: "Гидротермокостюмы для экипажа.",
      photo: "assets/img/product-suit.webp",
      alt: "Оранжевый гидротермокостюм со светоотражающими полосами",
      keywords: "гидрокостюм термокостюм костюм"
    },
    {
      name: "Фальшфейеры и пиротехника",
      category: "pyro",
      text: "Фальшфейеры и другая пиротехника для судна.",
      photo: "assets/img/product-flares-800.webp",
      alt: "Два ручных фальшфейера, у одного снята крышка",
      keywords: "фальшвеер фальшфеер сигнал ракета пиротехника"
    },
    {
      name: "Регистровые радиостанции",
      category: "nav",
      text: "Судовые радиостанции с доставкой.",
      photo: "assets/img/stock-radio.webp",
      alt: "Чёрная портативная рация с антенной",
      cover: true,
      keywords: "рация связь радио"
    },
    {
      name: "Эхолоты",
      category: "nav",
      text: "Продажа и установка на судно.",
      keywords: "эхолот локатор"
    },
    {
      name: "Радары",
      category: "nav",
      text: "Продажа и установка на судно.",
      photo: "assets/img/product-radar-800.webp",
      alt: "Антенна судового радара и многофункциональный дисплей",
      keywords: "радар рлс"
    }
  ]
};
