# Аналіз карток спринта

- Дата: 2026-11-18
- Джерело карток: GitHub Space2Study-november-2026-team-01/Issues, лейбл «sprint 3», лише лейбл Backend (#165, #163, #138, #128)
- Карта проєкту: docs/sprint/PROJECT_MAP.md, коміт 2343e752257705db91305167ccde897712fad675
- Інший репозиторій, якщо на нього є посилання: Client-mvp, карта коміт 557e65829ee56ce1ca65e1dfdd534317a422bb8c

Тексти карток узято командою `gh issue view` 2026-11-18. Лейбли підтверджено: у #165, #163, #138, #128 є `Backend` і `sprint 3`. Шляхи нижче відкриті в цьому розборі. Де карта і код кажуть те саме, це написано прямо. Секрети з `.env` не копіювались.

## Картка: #165 (SP: 2) [Auth] Implement password encryption and decryption

### Суть і критерії приймання

Треба хешувати пароль бібліотекою `bcrypt` і оновити тести. Картка скопійована з `ita-social-projects/Space2Study-node-BackEnd-mvp#67`.

Критерії приймання з картки, дослівно:

- Ensure that the salt rounds (work factor) fall within the recommended range of 10-12

Опис картки також каже: «Implement password encryption and decryption», «Use `bcrypt` library», «Update tests». Окремого чеклиста, крім salt rounds, немає.

### Питання до власника продукту

1. Опис вимагає «encryption and decryption», а єдина названа бібліотека — `bcrypt`. `bcrypt` не повертає початковий пароль. Чи «decryption» означає перевірку пароля при вході через порівняння з хешем, а не відновлення рядка пароля?
2. Зараз пароль у базі лежить тим самим рядком, який надіслав клієнт (див. код нижче). Після переходу на хеш уже створені користувачі і суперадмін не увійдуть звичайним паролем. Картка не каже, що з ними робити: примусове скидання, разове перехешування при першому успішному вході чи інше. Що вважати готовим для вже наявних записів?

### Що вже є в коді

Карта BackEnd-mvp і код збігаються: `bcrypt` є в залежностях і не викликається в `src`.

- BackEnd-mvp `package.json` — залежність `bcrypt` `^6.0.0`.
- Пошук `bcrypt`, `hashSync`, `compareSync`, `genSalt` у BackEnd-mvp `src` — збігів немає.
- BackEnd-mvp `src/services/user.js` — `userService.createUser` передає аргумент `password` у `User.create` без перетворення (рядки запису поля `password`).
- BackEnd-mvp `src/services/auth.js` — `authService.login` перевіряє `password === user.password` (або прапорець `isFromGoogle`). `authService.updatePassword` пише новий пароль через `privateUpdateUser(userId, { password })`. `authService.googleLogin` кладе `randomPassword` у `createUser` і, для непідтвердженої пошти, у `privateUpdateUser` полем `password`.
- BackEnd-mvp `src/services/user.js` — `userService.getUserByEmail` робить `.select('+password ...')`. `userService.privateUpdateUser` записує переданий об’єкт як є.
- BackEnd-mvp `src/models/user.js` — поле `password`: тип `String`, `select: false`, `minLength` 8. Окремого поля для хеша немає.
- BackEnd-mvp `src/seed/seedSuperAdmin.js` — `SeedSuperAdmin.createSuperAdmin` пише `password` з `superAdmin` у `User.create`. Значення береться з `MAIL_PASS` у BackEnd-mvp `src/configs/config.js` — об’єкт `superAdmin`. Саме значення сюди не копіюється.
- BackEnd-mvp `src/routes/auth.js` — `POST /auth/signup` (`authController.signup`), `POST /auth/login` (`authController.login`), `PATCH /auth/reset-password/:token` (`authController.updatePassword`), `POST /auth/google-auth` (`authController.googleLogin`).
- Вхідна перевірка довжини і шаблону пароля лишається на відкритому рядку запиту: BackEnd-mvp `src/validation/schemas/signup.js` і `src/validation/schemas/resetPassword.js` — поле `password`.
- Тести, які ходять у цей пароль: BackEnd-mvp `src/test/integration/services/auth.spec.js` (логін рядком `userData.password`), `src/test/integration/services/user.spec.js` (`getUserByEmail` очікує `password: user.password`), `src/test/integration/controllers/auth.spec.js` (Google-вхід читає `existingUser.password` і очікує інший пароль після оновлення), BackEnd-mvp `src/utils/testUserAuth.js` — `testUserAuthentication` створює користувача через `User.create` з відкритим `password` і одразу кличе `POST /auth/login`.

### Що треба зробити

- База даних: змін схеми не потрібно. Поле `password` у BackEnd-mvp `src/models/user.js` уже рядок, хеш `bcrypt` у нього вміщається. Окремої колекції паролів немає. Уже записані документи містять відкритий рядок; картка не описує міграцію цих документів.
- Бекенд: хешувати пароль із salt rounds у діапазоні 10–12 у всіх місцях запису, які зараз кладуть відкритий рядок: `userService.createUser`, `authService.updatePassword`, гілка пароля в `authService.googleLogin`, `SeedSuperAdmin.createSuperAdmin`. У `authService.login` замінити порівняння рядків на перевірку хеша. Гілка `isFromGoogle` пароль не порівнює; її треба зберегти робочою, бо Google-вхід передає в `login` порожній пароль.
- API: змін шляху не потрібно. Картка не змінює тіло `POST /auth/signup`, `POST /auth/login` і `PATCH /auth/reset-password/:token`: клієнт як і раніше надсилає відкритий пароль, хеш рахує сервер.
- Фронтенд: змін не потрібно. Картка ставить бібліотеку і тести на бекенді. Пошук `bcrypt` у Client-mvp `src` не входить у цю картку як робота; екран логіна в цьому розборі не змінюється.
- Тести: оновити перелічені spec і `testUserAuthentication`, бо вхід і створення користувача зав’язані на відкритий рядок у базі. Картка прямо каже «Update tests».
- Документація: змін не потрібно для контракту corresponding. Приклади пароля в BackEnd-mvp `docs/auth.js` описують тіло запиту, не збережене значення. Картка Swagger не вимагає.

### Складність

Припущення: L. Зміна в одному домені (запис і перевірка пароля) і зразок бібліотеки вже лежить у `package.json`, але помилка ламає вхід наявних користувачів і суперадміна: пароль зараз зберігається відкритим рядком. Без відповіді про старі записи незрозуміло, що вважати готовим для вже створених акаунтів.

### Тип роботи

Індивідуальна. Запис хеша, перевірка при вході і тести чіпають ті самі функції `authService` і `userService`. Окремі люди в цих файлах додадуть узгодження без окремого контракту, який можна віддати паралельно.

### Залежності

Залежностей від інших карток цього спринта немає. Текст #165 не посилається на інші номери. Фронтенд-картки #10, #19 і #16 говорять про країну і місто, не про хеш пароля. Спільного артефакта з #163, #138 і #128 у тексті і в коді немає.

## Картка: #163 (SP: 1) [TinyMCE] Generate token

### Суть і критерії приймання

Треба зареєструвати TinyMCE, згенерувати токен і записати його в `.env`. Картка попереджає реєструватися на пошту проєкту. Картка скопійована з `ita-social-projects/Space2Study-node-BackEnd-mvp#69`.

Чеклиста критеріїв приймання в картці немає. Опис, дослівно за пунктами:

- Register TinyMCE and generate token
- Update the environment configuration (`.env`) with the token
- Use project email for TinyMCE sign up

Ендпоінт, шлях і форма відповіді в картці не названі.

### Питання до власника продукту

1. Чий `.env` оновлювати: BackEnd-mvp чи Client-mvp? У клієнті ключ уже читається з `VITE_APP_TINY_MCE_API_KEY`. У бекенді змінної TinyMCE немає, і картка не описує серверний ендпоінт.
2. Що вважати готовим? Чеклиста немає: достатньо ключа в `.env.example` (порожнє ім’я змінної, без секретного значення в git), чи потрібен ще якийсь код?
3. Хто виконує реєстрацію на пошту проєкту і куди передає токен, якщо значення не комітиться?

### Що вже є в коді

Бекенд. Пошук `TINY`, `tinymce`, `TinyMCE` у BackEnd-mvp за `*.js`, `*.json`, `*.md`, `*.example`, `*.yml` — збігів немає. У BackEnd-mvp `.env.example` назв змінних TinyMCE немає (перелік у файлі: `NODE_ENV`, `SERVER_PORT`, `SERVER_URL`, `CLIENT_URL`, `COOKIE_DOMAIN`, `MONGODB_URL`, JWT-змінні, `MAIL_*`, `GMAIL_*`, `GOOGLE_CLIENT_ID`, `STORAGE_ACCOUNT`, `ACCESS_KEY`, `AZURE_HOST`). Сервісу, контролера і маршруту TinyMCE немає: список BackEnd-mvp `src/services/*.js` — `auth`, `user`, `token`, `googleAuth`, `email`, `offer`, `question`, `resourcesCategory`, `adminInvitation`, `chat`, `message`. У BackEnd-mvp `src/routes/index.js` префіксів TinyMCE немає.

Клієнт, де редактор уже зібраний:

- Client-mvp `package.json` — залежність `@tinymce/tinymce-react`.
- Client-mvp `.env.example` — рядок `VITE_APP_TINY_MCE_API_KEY=` (значення порожнє, у цей файл його не копіюю).
- Client-mvp `src/vite-env.d.ts` — поле `VITE_APP_TINY_MCE_API_KEY`.
- Client-mvp `src/components/file-editor/FileEditor.tsx` — `FileEditor` передає `import.meta.env.VITE_APP_TINY_MCE_API_KEY` у `apiKey` компонента `Editor`.
- Client-mvp `src/pages/create-or-edit-lesson/CreateOrEditLesson.tsx` імпортує `FileEditor`.

Карта Client-mvp називає ту саму змінну і пакет. Розбіжності з картою немає: карта не називає `FileEditor.tsx`, файл у коді є і читає саме цю змінну. Карта BackEnd-mvp TinyMCE не описує, і в бекенд-коді його немає.

Ендпоінт для токена не знайдено в коді. Шукав `tinymce` / `TinyMCE` / `TINY` у BackEnd-mvp і `TINY_MCE` / `tinymce` у Client-mvp `src`.

### Що треба зробити

- База даних: змін не потрібно. Картка не описує збереження токена в MongoDB, моделі TinyMCE в BackEnd-mvp `src/models` немає.
- Бекенд: змін не потрібно, доки власник продукту не скаже, що токен живе на сервері. Зараз жоден файл BackEnd-mvp цей токен не читає.
- API: ендпоінт не вигадую. У картці і в коді його немає.
- Фронтенд: код редактора вже є. Якщо відповідь на питання 1 — клієнтський `.env`, робота картки зводиться до реєстрації і заповнення вже оголошеної `VITE_APP_TINY_MCE_API_KEY`. Новий екран картка не ставить.
- Тести: змін не потрібно за текстом картки. Картка тести не згадує. Spec для `FileEditor` цим розбором не шукався як обсяг роботи.
- Документація: назва змінної вже є в Client-mvp `.env.example` і в карті клієнта. Секрет у репозиторій не класти.

### Складність

Припущення: L. Обсяг виглядає як реєстрація і одна змінна оточення, але без відповіді, чий `.env` і що вважати готовим, картку не можна закрити однозначно. Мітка Backend не збігається з місцем, де редактор живе в коді.

### Тип роботи

Індивідуальна. Ділити реєстрацію акаунта і запис однієї змінної немає сенсу: другої незалежної частини після контракту не видно. Поділ передчасний, доки не названо файл `.env`.

### Залежності

Залежностей від карток цього спринта немає. Текст #163 не посилається на інші номери. Серед переданих фронтенд-карток #10, #19 і #16 згадки TinyMCE немає, тож зв’язок із ними не вигадую. Клієнтський `FileEditor` уже читає змінну — це код Client-mvp, не картка спринта.

## Картка: #138 (SP: 3) Implement stepper Countries location service

### Суть і критерії приймання

Для степера треба сервіс, який віддає країни з зовнішнього API countrystatecity.in. Текст картки: «For issue #96». Картка скопійована з `ita-social-projects/Space2Study-node-BackEnd-mvp#97`.

Критерії з розділу Implement, дослівно як чеклист картки:

- Service
- Controller
- Route
- Unit tests
- Swagger docs

Шлях, метод, тіло відповіді і ключ зовнішнього API в картці не названі.

Факт текстів карток: #138 скопійована з BackEnd-mvp#97. У цьому репозиторії Issues номер #97 — це інша картка, «Guest landing. Welcoming block» (лейбл user story), теж перевірена через `gh issue view 97`. Номер #96 у цьому репозиторії — «Guest landing. What can you do block» (user story), перевірено через `gh issue view 96`. Це не картка степера.

### Питання до власника продукту

1. «For issue #96» у цьому репозиторії вказує на гостьову user story, не на степер. Яка картка є замовником сервісу країн?
2. Який контракт ендпоінта (метод, шлях, поля відповіді)? Контракт ще не зафіксований у картці і не знайдений в коді. Шукав `location`, `country`, `city`, `countrystatecity` (деталі пошуку нижче).
3. Чи потрібен ключ доступу до countrystatecity.in, і яка назва змінної в `.env`? У картці ключ не названий. У BackEnd-mvp `.env.example` такої назви немає.

### Що вже є в коді

Сервісу локацій не знайдено в коді. Шукав:

- файли `*location*` у BackEnd-mvp `src` — 0;
- `countrystatecity`, `locationService`, `countries` у BackEnd-mvp `src` — збігів немає;
- `city` у BackEnd-mvp `src` — лише адреса користувача, не довідник.

Те, що є, стосується збереженої адреси профілю, не списку країн:

- BackEnd-mvp `src/models/user.js` — `address.country` і `address.city`, обидва `String`.
- BackEnd-mvp `src/validation/services/user.js` — `allowedUserFieldsForUpdate.address` дозволяє оновлювати `country` і `city`.
- BackEnd-mvp `docs/users.js` — схема Swagger `UserAddress` з полями `country` і `city`. Це документація профілю, не каталог країн.
- BackEnd-mvp `src/routes/index.js` монтує `/auth`, `/users`, `/send-email`, `/admin-invitations`, `/questions`, `/resources-categories`, `/offers`. Маршруту країн немає.

Зразок шарів, за яким картка просить зібрати новий модуль: маршрут лише з’єднує middleware і контролер (наприклад BackEnd-mvp `src/routes/question.js`), Swagger збирає BackEnd-mvp `docs/swagger.js` з коментарів у `docs/*.js` і `src/routes/*.js`. Юніт-тести лежать у BackEnd-mvp `src/test/unit/` (наприклад `src/test/unit/services/token.spec.js`). Окремого HTTP-клієнта `axios` у `dependencies` BackEnd-mvp `package.json` немає.

Клієнт довідник країн не викликає. Шукав `countrystatecity`, `location`, `countries`, `cities` у Client-mvp `src` і `country|city|location` у Client-mvp `src/constants/request.ts` — збігів шляху API немає. Client-mvp `src/containers/tutor-home-page/general-info-step/GeneralInfoStep.jsx` — `GeneralInfoStep` показує заголовок і кнопки, селектів країни і міста в компоненті немає. Client-mvp `src/components/user-steps-wrapper/constants.ts` — `initialValues` має `country: null` і `city: null`. Client-mvp `src/hooks/use-steps.jsx` — `handleSubmit` кладе `country` і `city` у `address` і шле це в `userService.updateUser`. Це збереження профілю, не запит списку країн.

Карта BackEnd-mvp цей модуль не описує, і в коді його немає. Розбіжності «карта обіцяє файл, якого немає» по країнах немає.

### Що треба зробити

- База даних: змін не потрібно. Картка просить віддавати країни з зовнішнього API. Колекції країн у BackEnd-mvp `src/models` немає, і чеклист моделі не містить.
- Бекенд: новий сервіс, який ходить у countrystatecity.in за списком країн. Зразок сусіднього домену — файли на кшталт `src/services/question.js` плюс контролер і роут. Готового location-файла немає.
- API: новий маршрут і контролер, далі підключення в BackEnd-mvp `src/routes/index.js`. Контракт ще не зафіксований у картці і не знайдений в коді. Шукав `location`, `country`, `city`, `countrystatecity` у BackEnd-mvp `src` і в Client-mvp `src/constants/request.ts`. URL тут не вигадую.
- Фронтенд: змін у цій бекенд-картці не потрібно. Селекти — це фронтенд-картки #10, #19 і #16 (інший файл аналізу). Їх розблокує контракт відповіді, якого ще немає.
- Тести: юніт-тести, як просить чеклист. Каталог для них уже є: BackEnd-mvp `src/test/unit/`.
- Документація: коментарі Swagger за зразком BackEnd-mvp `docs/users.js`, щоб їх підхопив `docs/swagger.js`.

### Складність

Припущення: M. Це новий ендпоінт за вже наявним зразком маршрут → контролер → сервіс, плюс тести і Swagger з чеклиста. Нової колекції в базі картка не просить. Обсяг більший за одну функцію через п’ять пунктів чеклиста і зовнішній API, контракт якого ще не названий.

### Тип роботи

Індивідуальна. Service, controller і route — один новий модуль. Тести і Swagger описують той самий контракт і чіпають ті самі файли. Паралелити їх до появи шляху і форми відповіді означає дві людини в одному модулі.

### Залежності

Від #165, #163 і #128 ця картка не залежить: країни мають з’явитися першими, міста #128 лише розширюють сервіс.

Текст «For issue #96» не зв’язує роботу з гостьовою карткою #96 цього репозиторію. Артефакта «список країн для блоку What can you do» в #96 немає: #96 про блок гостьової і кнопки реєстрації.

Фронтенд цього спринта чекає на список країн, коли з’явиться контракт:

- #10 «Implement stepper location»: селекти Country і City «using BackEnd service». Для країни артефакт — відповідь сервісу країн. Контракт ще не зафіксований у картці і не знайдений в коді.
- #19 «Implement General Info step», критерій: «Country and city have to be pulled from server on input focus». Той самий відсутній контракт списку країн (місто — картка #128).
- #16 «Add validation for General info step» повторює той самий критерій про країну і місто з сервера.

Шлях ендпоінта не називаю.

## Картка: #128 (SP: 2) Implement stepper Cities location service

### Суть і критерії приймання

Розширити location service містами за обраною країною через той самий API countrystatecity.in. Текст: «Blocked by #97». Далі: «Extend location service with cities (according to selected country) for ita-social-projects/Space2Study-Client-mvp#142». Картка скопійована з `ita-social-projects/Space2Study-node-BackEnd-mvp#125`.

Чеклиста критеріїв приймання немає. Окремих пунктів Service / Controller / Route / Unit tests / Swagger, на відміну від #138, у тексті немає.

Факти текстів, перевірені в `gh`:

- #128 пише «Blocked by #97».
- #138 у цьому репозиторії скопійована з `ita-social-projects/Space2Study-node-BackEnd-mvp#97`.
- Issues #97 цього репозиторію — «Guest landing. Welcoming block», не сервіс країн.
- Посилання в #128 веде в репозиторій `ita-social-projects/Space2Study-Client-mvp`, номер 142, не в локальну картку. Локальна Issues #142 — «(SP: 2) Implement "Create quiz" endpoint», лейбл Backend, sprint 6. Це інша картка. Зв’язок #128 із локальною #142 не вигадую.

### Питання до власника продукту

1. Блокер у тексті — #97. У цьому репозиторії #97 не є сервісом країн. Чи готовність #128 настає після #138 (копія upstream #97)?
2. Які артефакти входять у «готово»? Чеклиста немає. Чи потрібні ті самі шари, що в #138 (controller, route, unit tests, swagger), чи лише метод сервісу?
3. Як у запит передається обрана країна і що лежить у відповіді? Контракт ще не зафіксований у картці і не знайдений в коді. Шукав `location`, `country`, `city`, `countrystatecity`.
4. Клієнт у тексті — upstream `Space2Study-Client-mvp#142`. Чи замовники цього спринта — #10, #19 і #16, де в тексті є країна і місто з бекенда?

### Що вже є в коді

Сервісу міст не знайдено в коді. Той самий пошук, що для #138: немає файлів location, немає `countrystatecity`, немає маршруту міст у BackEnd-mvp `src/routes/index.js`.

Поле збереженого міста є лише як адреса профілю: BackEnd-mvp `src/models/user.js` — `address.city`; BackEnd-mvp `src/validation/services/user.js`; BackEnd-mvp `docs/users.js` — `UserAddress.city`. Це не довідник міст за країною.

На клієнті селекта міста немає: Client-mvp `GeneralInfoStep.jsx` (шлях вище) рендерить заголовок. `use-steps.jsx` лише відправляє вже вибрані `country` і `city` в оновлення користувача. У Client-mvp `src/constants/request.ts` шляхів `country` / `city` / `location` пошук не знайшов.

### Що треба зробити

- База даних: змін не потрібно. Картка просить міста з countrystatecity.in за обраною країною. Моделі міста немає, чеклист моделі не заданий.
- Бекенд: розширити location service методом міст. Самого сервісу в коді ще немає (його чеклист стоїть у #138).
- API: маршрут, у який передається обрана країна. Контракт ще не зафіксований у картці і не знайдений в коді. Шукав `location`, `country`, `city`, `countrystatecity` у BackEnd-mvp `src` і Client-mvp `src/constants/request.ts`. URL не вигадую.
- Фронтенд: змін у цій бекенд-картці не потрібно. Селект міста описаний у #10 і в критеріях #19 і #16.
- Тести: картка їх не вимагає. Припущення: юніт-тест доречний, якщо власник підтвердить той самий чеклист, що в #138. До відповіді це не вимога.
- Документація: картка Swagger не вимагає. Припущення: коментар Swagger має сенс лише якщо #138 уже завела сторінку location і власник хоче той самий стандарт. До відповіді це не вимога.

### Складність

Припущення: M. Це новий ендпоінт (міста за країною) за зразком сервісу країн, коли той з’явиться: щонайменше сервіс і маршрут. Нової колекції немає. Якщо власник залишить роботу одним методом у вже створеному сервісі без окремого контракту відповіді, обсяг ближчий до однієї точки розширення; межа «готово» без чеклиста все одно сидить на питанні 2.

### Тип роботи

Індивідуальна. Метод міст, маршрут і тести описують один контракт «країна → список міст» у тому самому модулі, що й країни. Ділити це з людиною, яка робить #138, до зафіксованого шляху означає спільні файли. Окремі підзадачі після контракту не виділяю: друга незалежна частина всередині #128 не видна.

### Залежності

Припущення: #128 залежить від #138. Текст блокує #97, а в цьому репозиторії Issues #97 — гостьова user story, не країни. #138 скопійована з upstream BackEnd-mvp#97 і якраз заводить location service країн. Артефакт, який розблокує #128: зібраний сервіс країн (service, controller, route), до якого додається вибірка міст за країною. Поки контракт країн не названий, паралельний старт #128 у тих самих файлах передчасний.

Від #165 і #163 залежності немає.

Фронтенд, який чекає список міст, коли контракт з’явиться:

- #10 — селекти Country і City через BackEnd service. Місто розблокує відповідь «міста за обраною країною». Контракт ще не зафіксований у картці і не знайдений в коді.
- #19 і #16 — критерій «Country and city have to be pulled from server on input focus». Частина про місто чекає той самий відсутній контракт.

Локальна Issues #142 (квіз) цей контракт не споживає: її текст про `POST /quizzes`, не про міста. Upstream Client-mvp#142 у цьому робочому дереві не відкривався.

## Відкриті питання

1. #165 — Чи «decryption» у описі означає перевірку пароля порівнянням із хешем `bcrypt`, а не відновлення початкового пароля?
2. #165 — Що робити з уже збереженими відкритими паролями користувачів і з паролем суперадміна з `MAIL_PASS`, щоб після хешу вони могли увійти?
3. #163 — Чий `.env` оновлювати: BackEnd-mvp чи Client-mvp, де вже є порожня `VITE_APP_TINY_MCE_API_KEY`?
4. #163 — Що вважати готовим без чеклиста: лише реєстрація і змінна оточення, чи ще код на бекенді?
5. #163 — Хто реєструє TinyMCE на пошту проєкту і як передає токен, якщо секрет не комітиться?
6. #138 — Яка картка є замовником сервісу країн, якщо локальна #96 — це гостьовий блок «What can you do», а не степер?
7. #138 — Який контракт списку країн (метод, шлях, поля) і чи потрібна окрема змінна ключа countrystatecity.in? Контракт ще не зафіксований у картці і не знайдений в коді.
8. #128 — Чи блокером є #138, а не локальна #97 (гостьовий welcoming block)?
9. #128 — Які шари обов’язкові для приймання, якщо чеклиста на кшталт #138 у тексті немає?
10. #128 — Який контракт міст за обраною країною? Контракт ще не зафіксований у картці і не знайдений в коді (пошук `location`, `country`, `city`, `countrystatecity`).
11. #128 — Чи фронтенд-замовники цього спринта — #10, #19 і #16, а посилання на Client-mvp#142 лишається посиланням на upstream, не на локальну картку квіза #142?
