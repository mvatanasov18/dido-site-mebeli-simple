# Монтаж Мебели Бургас — статичен сайт

Статичен уебсайт за **сглобяване и монтаж на мебели в Бургас и региона**, подготвен за хостване в GitHub Pages.

## Структура

- `index.html` — начална страница (hero, услуги, цени, мнения, ЧЗВ, контакт). Навигацията води към Услуги, Цени и Контакт като отделни страници.
- `uslugi.html` — подробни услуги
- `ceni.html` — ориентировъчен ценоразпис
- `kontakt.html` — страница за контакт
- `config.js` — **единствено място за телефон и имейл** (всички страници го използват)
- `styles.css` — общи стилове
- `scripts.js` — мобилно меню, smooth scroll, FAQ акордеони и подмяна на контакти от config
- `robots.txt` — указания за търсачки
- `sitemap.xml` — sitemap за по-бързо индексиране

## Как да промените контактите

Редактирайте **само** файла `config.js`. Телефонът и имейлът там се използват на всички страници (връзки, форма за контакт и JSON-LD за търсачки). Линковете към социални мрежи са в `kontakt.html` и се променят там при нужда.

## Google Maps в контакт формата (по избор)

Формата има 2 начина за локация:
- **Текст** (винаги налично)
- **Google Maps** (карта + търсене + избор на точка)

За да работи Google Maps, трябва API ключ:

1. Вземете Google Maps JavaScript API key (и активирайте `Maps JavaScript API` + `Places API`).
2. Отворете `config.js` и попълнете:

   - `googleMapsApiKey: "ВАШИЯТ_КЛЮЧ"`

Ако картата не може да се зареди (липсва ключ, блокиране от разширение, проблем с връзката), сайтът показва предупреждение и можете да използвате текстовото поле.

## Как да промените SEO мета данните

1. Отворете `index.html`.
2. В `<head>` редактирайте:
   - `<title>`
   - `meta name="description"`
   - JSON-LD блока (`application/ld+json`) при нужда.
3. URL адресът вече е зададен за този сайт:
   - `https://mvatanasov18.github.io/dido-site-mebeli-simple/`

Ако копирате проекта в ново GitHub Pages хранилище, тогава заменете URL адреса в:
- `index.html`, `uslugi.html`, `ceni.html`, `kontakt.html`
- `robots.txt`
- `sitemap.xml`

## Локално тестване

Тъй като сайтът е статичен, може просто да отворите `index.html` в браузъра:

1. Двоен клик върху `index.html` или
2. Десен бутон → „Open With“ → избран браузър.

За по-коректно поведение (особено с относителни пътища) може да стартирате прост HTTP сървър (по избор).

## GitHub Pages — публикуване

1. Създайте ново хранилище в GitHub (например `mebel-montaj-burgas`).
2. В локалната папка (тази директория) изпълнете:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```

3. В GitHub:
   - Отидете в **Settings** → **Pages**.
   - Изберете **Source: Deploy from a branch**.
   - Branch: `main`, `/ (root)`.
   - Запазете.

След няколко минути сайтът ще е достъпен на:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/
```

По-късно може да закачите собствен домейн през GitHub Pages настройките.

