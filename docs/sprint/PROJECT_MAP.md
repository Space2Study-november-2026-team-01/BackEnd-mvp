# Карта проєкту

- Дата складання: 2026-11-18
- Коміт: 2343e752257705db91305167ccde897712fad675 (2343e75)
- Гілка: develop
- Репозиторій: C:\Users\oshuty\Desktop\BackEnd-mvp

Тема останнього коміту (`git log -1 --format=%s`): Merge pull request #18 from Space2Study-november-2026-team-01/feature/171-auth-service-integration-tests.

## Як читати цю карту

Це один HTTP API, не набір окремих сервісів. Код розкладений шарами (`routes`, `controllers`, `services`, `models`), а доменні файли всередині шару названі за сутністю (`user`, `offer`, `question`).

Шлях записується так, щоб його можна було відкрити: `шлях/до/файлу` — `Назва.символ`. Твердження без шляху тут немає. Якщо чогось немає, стоїть дослівне «не знайдено в коді» і місце пошуку. Речення зі словом «Припущення:» — це висновок понад те, що прямо написано у файлі.

Секретні значення з `.env.example` у карту не скопійовані. Нижче лише назви змінних.

Фронтенд цього репозиторію не містить. `README.md` прямо каже, що вебклієнта тут немає. Інший репозиторій у карті не використовується.

## Стек

У корені є `package.json`, `Dockerfile`, `docker-compose.yml`. Файлів `pom.xml`, `build.gradle`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `composer.json`, `*.csproj` у лістингу кореня немає.

- Мова і рантайм: Node.js. `package.json` — поле `engines.node` значення `>=24`. `.nvmrc` містить `24`. `Dockerfile` — рядок `FROM node:24-bookworm-slim`.
- HTTP: Express. `package.json` — залежність `express` `^4.21.2`. Точка входу `package.json` — поле `main` значення `src/app.js`. `src/app.js` створює `express()` і викликає `serverSetup`.
- База: MongoDB і Mongoose. `package.json` — залежність `mongoose` `^6.13.8`. `docker-compose.yml` — сервіс `database`, образ `mongo:6`. Підключення: `src/initialization/database.js` — `databaseInitialization` викликає `mongoose.connect`.
- Тести: Jest і Supertest. `package.json` — `jest` `^29.7.0`, `supertest` `^7.1.4`, скрипт `test` запускає `jest --maxWorkers=1`. Конфіг: `jest.config.js`.
- Інші бібліотеки з `package.json`, які видно в коді: `jsonwebtoken` (`src/services/token.js` — `tokenService`), `google-auth-library` (`src/services/googleAuth.js` — `verifyGoogleToken`), `mongoose` моделі в `src/models/`, `nodemailer` через `src/utils/mailer.js` (його підключає `src/services/email.js` — `emailService.sendEmail`), `pug` і `email-templates` (`src/services/email.js`), `cron` (`src/cron-jobs/scheduledCronJobs.js`), `swagger-jsdoc` і `swagger-ui-express` (`docs/swagger.js`, `src/initialization/initialization.js`), `winston` і `winston-mongodb` (`src/logger/logger.js`), `multer` (`src/middlewares/multer.js`), `bcrypt` лише в `package.json` — у `src/**/*.js` рядок `bcrypt` пошуком не знайдено.
- Модулі CommonJS: `require` / `module.exports`. Аліас `~` на каталог `src` задає `module-aliases.js`. Його підключає `src/app.js`.
- Контейнери: `Dockerfile` збирає образ і запускає `node src/app.js`. `docker-compose.yml` піднімає сервіси `api` і `database`.

## Запуск і конфігурація

Точка входу процесу: `src/app.js` — функція `start` викликає `serverSetup`. Далі `src/initialization/serverSetup.js` — `serverSetup`: з’єднує базу (`databaseInitialization`), сіє суперадміна (`checkUserExistence`), вішає HTTP (`initialization`), слухає порт і поза тестами запускає `scheduledCronJobs`.

Команди з `package.json` і `README.md`:

- `npm ci` — встановлення залежностей (`README.md`, розділ Setup).
- `npm run dev` — `nodemon src/app.js --legacy-watch`.
- `npm start` — `node src/app.js`. Той самий запуск у `Dockerfile` — інструкція `CMD`.
- `npm test` — Jest.
- `npm run docker:up` — `docker compose up --build`. `npm run docker:down` зупиняє стек.

`README.md` описує два способи бази, не одночасно: локальний MongoDB на `127.0.0.1:27017` (типовий `MONGODB_URL` у `.env.example`) або лише сервіс `database` з Compose (`docker compose up database`) і URL на хост-порт `27018`. Усередині Compose `docker-compose.yml` сам ставить контейнеру `api` адресу `mongodb://database:27017/sp_project`.

Змінні, назви з `.env.example` (значення не наведені): `NODE_ENV`, `SERVER_PORT`, `SERVER_URL`, `CLIENT_URL`, `COOKIE_DOMAIN`, `MONGODB_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `JWT_RESET_SECRET`, `JWT_RESET_EXPIRES_IN`, `JWT_CONFIRM_SECRET`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FIRSTNAME`, `MAIL_LASTNAME`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_REDIRECT_URI`, `GOOGLE_CLIENT_ID`, `STORAGE_ACCOUNT`, `ACCESS_KEY`, `AZURE_HOST`.

`JWT_CONFIRM_EXPIRES_IN` у `.env.example` немає. Її читають `src/configs/config.js` (об’єкт `config`) і `src/services/token.js` — `tokenService.generateConfirmToken`. Для тестів її задає `src/test/setEnv.js`, для GitHub Actions — `.github/workflows/main.yaml`.

Завантаження env: `src/initialization/envSetup.js` спочатку читає `.env.test.local` якщо `NODE_ENV` дорівнює `test`, інакше `.env.local`, потім `.env`. `src/test/setEnv.js` читає `.env.test.local`, потім `.env`, і підставляє локальні тестові значення лише для порожніх ключів.

Зіставлення змінних із кодом: `src/configs/config.js` експортує `config`, `gmailCredentials`, `superAdmin`, `azureAccess`. `README.md` каже, що `.env`, `.env.local` і `.env.test.local` у gitignore.

HTTP збирається в `src/initialization/initialization.js` — `initialization`: JSON до 10mb, cookies, CORS (`CLIENT_URL`, у `development` origin `true`), Swagger на `/api-docs`, маршрути з `src/routes/index.js` на корені `/`, далі обробник 404 і `errorMiddleware`.

Порт: `src/initialization/serverSetup.js` бере `SERVER_PORT`, а в `NODE_ENV=test` слухає порт `0`. `README.md` каже, що за `SERVER_PORT=3000` API на `http://localhost:3000`.

## Модулі

Один процес. Нижче — доменні зрізи цього процесу.

### Процес сервера

Навіщо: підняти процес, базу, суперадміна, HTTP і щоденні задачі.

- Маршрути: збірка в `src/initialization/initialization.js` — `initialization`. Префікси в `src/routes/index.js`: `/auth`, `/users`, `/send-email`, `/admin-invitations`, `/questions`, `/resources-categories`, `/offers`. Swagger: `GET` документації на `/api-docs` через `swaggerUi`.
- Бізнес-логіка: `src/initialization/serverSetup.js` — `serverSetup`; `src/logger/logger.js` пише в консоль і, поза тестами, помилки в MongoDB.
- Дані: `src/initialization/database.js` — `databaseInitialization`. Міграцій немає: пошук `**/*migrat*` у репозиторії дав 0 файлів.
- Сторінки і компоненти: не знайдено в коді. Шукав `src/**/*.{jsx,tsx,vue,html}` — 0 файлів. Папок `pages` і `components` у лістингу кореня немає.
- Тести: окремого spec для `serverSetup` не знайдено в `src/test`. Шукав `src/test/**/*.spec.js`.

### Авторизація

Навіщо: реєстрація, вхід, вихід, оновлення access-токена, скидання пароля, підтвердження пошти і вхід через Google.

- Маршрути: `src/routes/auth.js`. Ендпоінти: `POST /auth/signup` — `authController.signup`; `POST /auth/login` — `authController.login`; `POST /auth/google-auth` — `authController.googleLogin`; `POST /auth/logout` — `authController.logout`; `GET /auth/refresh` — `authController.refreshAccessToken`; `POST /auth/forgot-password` — `authController.sendResetPasswordEmail`; `PATCH /auth/reset-password/:token` — `authController.updatePassword`; `POST /auth/confirm-email` — `authController.confirmEmail`.
- Контролер: `src/controllers/auth.js`. Сервіси: `src/services/auth.js` — `authService` (`signup`, `confirmEmail`, `login`, `googleLogin`, `logout`, `refreshAccessToken`, `sendResetPasswordEmail`, `updatePassword`); `src/services/token.js` — `tokenService`; `src/services/googleAuth.js` — `verifyGoogleToken`. Перевірка cookie: `src/middlewares/auth.js` — `authMiddleware`, `restrictTo`; розбір JWT: `src/utils/tokenValidation.js` — `tokenValidation`.
- Дані: `src/models/token.js` — модель `Token` (поля `user`, `refreshToken`, `resetToken`, `confirmToken`). Користувача створює `src/services/user.js` — `userService.createUser`. Схем Joi-стилю в окремих файлах: `src/validation/schemas/signup.js`, `login.js`, `googleAuth.js`, `forgotPassword.js`, `resetPassword.js`, `confirmEmail.js`.
- Сторінки і компоненти: не знайдено в коді (той самий пошук `jsx`/`tsx`/`vue`/`html` у `src`).
- Тести: `src/test/integration/controllers/auth.spec.js`, `src/test/integration/services/auth.spec.js`, `src/test/unit/services/googleAuth.spec.js`, `src/test/unit/services/token.spec.js`, `src/test/unit/middlewares/auth.spec.js`.

`authService.login` кладе в JWT `id`, `role` (це `lastLoginAs`) і `isFirstLogin`. Імена cookie: `src/consts/auth.js` — `tokenNames` (`accessToken`, `refreshToken`, `resetToken`, `confirmToken`).

### Користувачі

Навіщо: список профілів, перегляд, оновлення свого профілю, зміна статусу і видалення.

- Маршрути: `src/routes/user.js`. Усі маршрути після `authMiddleware`. `GET /users` — `userController.getUsers`; `GET /users/:id` — `userController.getUserById`; `PATCH /users/:id` — `userController.updateUser`. Далі `restrictTo(ADMIN)`: `PATCH /users/:id/change-status` — `userController.updateStatus`; `DELETE /users/:id` — `userController.deleteUser`.
- Сервіс: `src/services/user.js` — `userService` (`getUsers`, `getUserById`, `getUserByEmail`, `createUser`, `privateUpdateUser`, `updateUser`, `updateStatus`, `deleteUser`). Ролі: `src/consts/auth.js` — `roles` (`student`, `tutor`, `admin`, `superadmin`). Збірка фільтра списку: `src/utils/users/createAggregateOptions.js`.
- Дані: `src/models/user.js` — модель `User`. Поля, які видно в схемі: `role` (масив рядків), `firstName`, `lastName`, `email`, `password` (`select: false`), `address`, `photo`, `professionalSummary`, `mainSubjects` з `ref: Subject`, `totalReviews`, `averageRating`, `nativeLanguage`, `isEmailConfirmed`, `isFirstLogin`, `lastLogin`, `appLanguage`, `status` для student/tutor/admin, `lastLoginAs`, `bookmarkedOffers`, `FAQ`. Окремої моделі `Subject` немає: у `src/models` є лише `user.js`, `token.js`, `offer.js`, `question.js`, `resourcesCategory.js`, `adminInvitation.js`.
- Сторінки і компоненти: не знайдено в коді (пошук інтерфейсних розширень у `src`).
- Тести: `src/test/integration/services/user.spec.js`. Spec контролера користувачів не знайдено: шукав `src/test/**/*user*`.

`userController.updateUser` кидає заборону, якщо `id` у шляху не дорівнює `req.user.id`.

### Пропозиції

Навіщо: оголошення репетитора або студента (ціна, рівень, мови, статус, FAQ) і їхній список із пошуком.

- Маршрути: `src/routes/offer.js`, префікс `/offers`, усі після `authMiddleware`. `GET /offers` — `offerController.getOffers`; `POST /offers` — `offerController.createOffer`; `GET /offers/:id` — `offerController.getOfferById`; `PATCH /offers/:id` — `offerController.updateOffer`; `DELETE /offers/:id` — `offerController.deleteOffer`.
- Сервіс: `src/services/offer.js` — `offerService`. Агрегація списку: `src/utils/offers/offerAggregateOptions.js` — `offerAggregateOptions` (параметр запиту `search` і фільтри ціни, рівня, мови, статусу). Дозволені поля оновлення: `src/validation/services/offer.js`.
- Дані: `src/models/offer.js` — модель `Offer`. Поля схеми: `price`, `proficiencyLevel`, `title`, `description`, `languages`, `authorRole`, `author`, `status`, `FAQ`. Статуси: `src/consts/validation.js` — `OFFER_STATUS_ENUM` (`active`, `draft`, `closed`).
- Сторінки і компоненти: не знайдено в коді.
- Тести: spec для offer не знайдено. Шукав `src/test/**/*offer*`.

### Питання

Навіщо: питання навчальних ресурсів (текст, варіанти відповіді, тип, категорія).

- Маршрути: `src/routes/question.js`. Після `authMiddleware`: `GET /questions` — `questionController.getQuestions`; `GET /questions/:questionId` — `questionController.getQuestionById`. Після `restrictTo(TUTOR)`: `POST /questions` — `questionController.createQuestion`; `DELETE /questions/:id` — `questionController.deleteQuestion`; `PATCH /questions/:id` — `questionController.updateQuestion`.
- Сервіс: `src/services/question.js` — `questionService`. Контролер збирає фільтри в `src/controllers/question.js` — `getQuestions`.
- Дані: `src/models/question.js` — модель `Question` (`title`, `text`, `answers`, `type`, `category`, `author`, `resourceType`). Типи: `QUESTION_TYPE_ENUM` у `src/consts/validation.js`.
- Сторінки і компоненти: не знайдено в коді.
- Тести: `src/test/integration/services/question.spec.js`, `src/test/integration/controllers/question.spec.js`.

### Категорії ресурсів

Навіщо: іменовані категорії, до яких репетитор чіпляє питання.

- Маршрути: `src/routes/resourcesCategory.js`. Увесь роутер після `authMiddleware` і `restrictTo(TUTOR)`. `GET /resources-categories` — `resourcesCategoryController.getResourcesCategories`; `GET /resources-categories/names` — `resourcesCategoryController.getResourcesCategoriesNames`; `POST /resources-categories` — `resourcesCategoryController.createResourcesCategory`; `PATCH /resources-categories/:id` — `resourcesCategoryController.updateResourceCategory`; `DELETE /resources-categories/:id` — `resourcesCategoryController.deleteResourceCategory`.
- Сервіс: `src/services/resourcesCategory.js` — `resourcesCategoryService`.
- Дані: `src/models/resourcesCategory.js` — модель `ResourcesCategory` (`name`, `author`).
- Сторінки і компоненти: не знайдено в коді.
- Тести: `src/test/integration/controllers/resourcesCategory.spec.js`. Spec сервісу не знайдено: шукав `src/test/**/*resourcesCategory*` і `src/test/**/*categor*`.

### Запрошення адміністраторів

Навіщо: зберегти email запрошення і надіслати лист `invite-admin`.

- Маршрути: `src/routes/adminInvitation.js`. `POST /admin-invitations` — `adminInvitationController.sendAdminInvitations`; `GET /admin-invitations` — `adminInvitationController.getAdminInvitations`. Виклику `authMiddleware` у цьому файлі немає.
- Сервіс: `src/services/adminInvitation.js` — `adminInvitationService.sendAdminInvitations`, `getAdminInvitations`.
- Дані: `src/models/adminInvitation.js` — модель `AdminInvitation` (`email`, `dateOfInvitation`).
- Сторінки і компоненти: не знайдено в коді.
- Тести: не знайдено в коді. Шукав `src/test/**/*admin*` і `src/test/**/*invit*`.

### Листи

Навіщо: зібрати HTML з Pug-шаблонів і відправити пошту (підтвердження, скидання пароля, давня неактивність, запрошення адміна), плюс окремий HTTP-вхід «надіслати лист».

- Маршрути: `src/routes/email.js` — `POST /send-email`, `emailController.sendEmail`. `authMiddleware` у файлі немає.
- Сервіс: `src/services/email.js` — `emailService.sendEmail`. Відправка: `src/utils/mailer.js` — `sendMail` (файл підключений із сервісу; тіло `mailer.js` у цій карті не розбиралось). Теми: `src/consts/emailSubject.js`. Список шаблонів: `src/emails/index.js` — `templateList`. Файли шаблонів: `src/emails/en/` і `src/emails/ua/` (`confirm-email.pug`, `reset-password.pug`, `sucessful-password-reset.pug`, `long-time-without-login.pug`, `invite-admin.pug`).
- Дані: окремої моделі листа немає. Шукав `src/models` — файлу email-моделі немає.
- Сторінки і компоненти: Pug-шаблони листів, не сторінки застосунку. React/Vue-сторінок не знайдено в коді.
- Тести: spec для email не знайдено. Шукав `src/test/**/*email*` і `src/test/**/*mail*`.

### Чати і повідомлення

Навіщо: у файлах описані створення чату між двома учасниками і текст повідомлень. У зібраний роутер цей код не входить.

- Маршрути: `src/routes/message.js` оголошує `GET/POST/DELETE/PATCH /` на `messageController.getMessages`, `sendMessage`, `deleteMessages`, `clearHistory`. `src/routes/index.js` цей роутер не підключає. Файлу `src/routes/chat.js` у `src/routes` немає.
- Сервіси: `src/services/message.js` — `messageService` (`sendMessage`, `getMessages`, `deleteMessages`, `clearHistory`); `src/services/chat.js` — `chatService` (`createChat`, `getChats`, `deleteChat`, `markAsDeletedForCurrentUser`). Інші файли `src` їх не імпортують: пошук `services/chat` і `services/message` знайшов лише ці самі файли.
- Дані: не знайдено в коді. `message.js` і `chat.js` роблять `require('~/models/message')` і `require('~/models/chat')`, `src/routes/message.js` ще й `require('~/controllers/message')`. Файлів `src/models/message.js`, `src/models/chat.js`, `src/controllers/message.js` у списку `src/**/*.js` немає. Імена `Message` і `Chat` лише як рядки в `src/consts/models.js`.
- Сторінки і компоненти: не знайдено в коді.
- Тести: не знайдено в коді. Шукав `src/test/**/*message*` і `src/test/**/*chat*`.

### Планувальник

Навіщо: раз на добу прибрати користувачів із простроченим листом підтвердження і попередити або видалити тих, хто довго не входив.

- Маршрутів немає. Запуск: `src/cron-jobs/scheduledCronJobs.js` — `scheduledCronJobs` викликає `checkUsersForLastLogin.start()` і `removeUnverifiedUsers.start()`. `serverSetup` викликає це лише коли `NODE_ENV` не `test`.
- Логіка: `src/cron-jobs/checkForLastLogin.js` — `checkLastLogin` (розклад `00 00 03 * * *`, UTC; лист на 173-й день, видалення з 180-го); `src/cron-jobs/removeUnverifiedUsers.js` — `removeUsersWithUnconfirmedEmail` (розклад `0 0 * * *`).
- Дані: ті самі `User` і `Token`. Окремої колекції задач немає.
- Сторінки і компоненти: не знайдено в коді.
- Тести: `src/test/unit/cron-jobs/scheduledCronJobs.spec.js`, `checkForLastLogin.spec.js`, `removeUnverifiedUsers.spec.js`.

### OpenAPI

Навіщо: опис частини API для Swagger UI.

- Збірка: `docs/swagger.js`. Коментарі `@swagger` є в `docs/auth.js`, `docs/users.js`, `docs/offers.js`, `docs/questions.js`. Для категорій, запрошень і `/send-email` коментарів `@swagger` пошук по репозиторію не знайшов (рядок `@swagger`).
- Сторінка UI — це Swagger, не сторінка продукту: маршрут `/api-docs` у `src/initialization/initialization.js`.

## Де шукати

Фронтенд у кожній клітинці: не знайдено в коді. Шукав у цьому репозиторії `src/**/*.{jsx,tsx,vue,html}` (0 файлів) і папки `pages` / `components` у корені (їх немає в лістингу). `README.md` пише, що вебклієнта в репозиторії немає.

| Сутність                                         | Бекенд                                                                                                                                                                                                                                                           | Фронтенд                                                              | Дані                                                                                                                                                   | Тести                                                                                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Користувачі                                      | `src/routes/user.js`; `src/controllers/user.js` — `getUsers`, `getUserById`, `updateUser`, `updateStatus`, `deleteUser`; `src/services/user.js` — `userService`                                                                                                  | не знайдено в коді (пошук вище)                                       | `src/models/user.js` — модель `User`                                                                                                                   | `src/test/integration/services/user.spec.js`. Контролер: не знайдено в коді, шукав `src/test/**/*user*`                                                                         |
| Авторизація, токени, пароль, підтвердження пошти | `src/routes/auth.js`; `src/controllers/auth.js`; `src/services/auth.js` — `authService`; `src/services/token.js` — `tokenService`; `src/middlewares/auth.js` — `authMiddleware`                                                                                  | не знайдено в коді (пошук вище)                                       | `src/models/token.js` — модель `Token`; користувач у `src/models/user.js`                                                                              | `src/test/integration/controllers/auth.spec.js`; `src/test/integration/services/auth.spec.js`; `src/test/unit/services/token.spec.js`; `src/test/unit/middlewares/auth.spec.js` |
| Вхід через Google                                | `POST /auth/google-auth` у `src/routes/auth.js` — `authController.googleLogin`; `src/services/googleAuth.js` — `verifyGoogleToken`; схема `src/validation/schemas/googleAuth.js`                                                                                 | не знайдено в коді (пошук вище)                                       | той самий `User` і `Token`; окремої колекції Google немає                                                                                              | `src/test/unit/services/googleAuth.spec.js`                                                                                                                                     |
| Пропозиції                                       | `src/routes/offer.js`; `src/controllers/offer.js`; `src/services/offer.js` — `offerService`; пошук списку `src/utils/offers/offerAggregateOptions.js` — `offerAggregateOptions`                                                                                  | не знайдено в коді (пошук вище)                                       | `src/models/offer.js` — модель `Offer`                                                                                                                 | не знайдено в коді; шукав `src/test/**/*offer*`                                                                                                                                 |
| Питання                                          | `src/routes/question.js`; `src/controllers/question.js`; `src/services/question.js` — `questionService`                                                                                                                                                          | не знайдено в коді (пошук вище)                                       | `src/models/question.js` — модель `Question`                                                                                                           | `src/test/integration/controllers/question.spec.js`; `src/test/integration/services/question.spec.js`                                                                           |
| Категорії ресурсів                               | `src/routes/resourcesCategory.js`; `src/controllers/resourcesCategory.js`; `src/services/resourcesCategory.js` — `resourcesCategoryService`                                                                                                                      | не знайдено в коді (пошук вище)                                       | `src/models/resourcesCategory.js` — модель `ResourcesCategory`                                                                                         | `src/test/integration/controllers/resourcesCategory.spec.js`. Сервіс: не знайдено в коді, шукав `src/test/**/*categor*`                                                         |
| Запрошення адміністратора                        | `src/routes/adminInvitation.js`; `src/controllers/adminInvitation.js`; `src/services/adminInvitation.js` — `adminInvitationService`                                                                                                                              | не знайдено в коді (пошук вище)                                       | `src/models/adminInvitation.js` — модель `AdminInvitation`                                                                                             | не знайдено в коді; шукав `src/test/**/*invit*` і `src/test/**/*admin*`                                                                                                         |
| Листи                                            | `POST /send-email` у `src/routes/email.js` — `emailController.sendEmail`; `src/services/email.js` — `emailService.sendEmail`; шаблони `src/emails/index.js` — `templateList`                                                                                     | не знайдено в коді (пошук вище). Pug у `src/emails/` — це тіла листів | не знайдено в коді; шукав модель у `src/models`                                                                                                        | не знайдено в коді; шукав `src/test/**/*email*` і `src/test/**/*mail*`                                                                                                          |
| Чати і повідомлення                              | `src/routes/message.js` (не підключений у `src/routes/index.js`); `src/services/message.js` — `messageService`; `src/services/chat.js` — `chatService`. Контролер `src/controllers/message.js` не знайдено в коді                                                | не знайдено в коді (пошук вище)                                       | `src/models/chat.js` і `src/models/message.js` не знайдено в коді. Імена є лише в `src/consts/models.js`                                               | не знайдено в коді; шукав `src/test/**/*chat*` і `src/test/**/*message*`                                                                                                        |
| Суперадмін при старті                            | `src/seed/checkUserExistence.js` — `checkUserExistence`; `src/seed/seedSuperAdmin.js` — `SeedSuperAdmin.createSuperAdmin`. Виклик із `src/initialization/serverSetup.js`                                                                                         | не знайдено в коді (пошук вище)                                       | запис у модель `User`; пошта і пароль беруться з `superAdmin` у `src/configs/config.js` (`MAIL_USER`, `MAIL_PASS`, `MAIL_FIRSTNAME`, `MAIL_LASTNAME`)  | не знайдено в коді; шукав `src/test/**/*seed*`                                                                                                                                  |
| Неактивні та непідтверджені користувачі          | `src/cron-jobs/checkForLastLogin.js` — `checkLastLogin`; `src/cron-jobs/removeUnverifiedUsers.js` — `removeUsersWithUnconfirmedEmail`                                                                                                                            | не знайдено в коді (пошук вище)                                       | `User` і `Token`                                                                                                                                       | `src/test/unit/cron-jobs/checkForLastLogin.spec.js`; `src/test/unit/cron-jobs/removeUnverifiedUsers.spec.js`; `src/test/unit/cron-jobs/scheduledCronJobs.spec.js`               |
| Предмети, уроки, квізи, вкладення                | не знайдено в коді як маршрути. Шукав `src/routes` і `src/models`. Рядки `Subject`, `Lesson`, `Quiz`, `Attachment` є в `src/consts/models.js`. `User.mainSubjects` має `ref: Subject` у `src/models/user.js`. `QUIZ_VIEW_ENUM` лише в `src/consts/validation.js` | не знайдено в коді (пошук вище)                                       | файлів моделей subject/lesson/quiz/attachment у `src/models` немає                                                                                     | не знайдено в коді; шукав `src/test/**/*subject*`, `src/test/**/*lesson*`, `src/test/**/*quiz*`                                                                                 |
| Пошук і сортування списків                       | `src/utils/getRegex.js`, `src/utils/getMatchOptions.js`, `src/utils/getSortOptions.js`, `src/utils/users/createAggregateOptions.js`, `src/utils/offers/offerAggregateOptions.js`, `src/utils/categories/categoriesAggregateOptions.js`                           | не знайдено в коді (пошук вище)                                       | окремої колекції пошуку немає; запити йдуть у `User`, `Offer`, `Question`, `ResourcesCategory`                                                         | `src/test/unit/utils/getSortOptions.spec.js`; `src/test/unit/utils/getCategoriesOption.spec.js`. Для `offerAggregateOptions` spec не знайдено                                   |
| Завантаження файлів                              | `src/middlewares/multer.js` експортує `upload`. Жоден інший файл його не підключає: пошук `middlewares/multer` у `src/**/*.js` знайшов лише цей файл. `src/consts/upload.js` теж ніхто не імпортує (пошук `consts/upload`)                                       | не знайдено в коді (пошук вище)                                       | Azure-імена `STORAGE_ACCOUNT`, `ACCESS_KEY`, `AZURE_HOST` зібрані в `azureAccess` у `src/configs/config.js`. Пошук `azureAccess` знайшов лише цей файл | не знайдено в коді; шукав `src/test/**/*upload*` і `src/test/**/*multer*`                                                                                                       |

## Домовленості в коді

- Імена файлів у `src` — camelCase за доменом (`resourcesCategory.js`, `adminInvitation.js`). URL із кількох слів — через дефіс: `/resources-categories`, `/admin-invitations`, `/send-email`, `/google-auth`, `/forgot-password` (`src/routes/index.js`, `src/routes/auth.js`).
- Імпорт із `src` через аліас `~/` (`module-aliases.js`). Відносні шляхи теж трапляються, наприклад `src/middlewares/auth.js` тягне `../utils/tokenValidation`.
- Шар: маршрут лише з’єднує middleware і контролер (`README.md`, розділ Project layout). Контролер читає `req` і кличе сервіс. Сервіс — об’єкт методів, не клас. Модель — `mongoose.model` у `src/models`.
- Відповіді: списки йдуть JSON зі статусом 200 (`userController.getUsers`), створення пропозиції — 201 (`offerController.createOffer`), оновлення і видалення користувача — 204 без тіла (`userController.updateUser`, `deleteUser`). Помилки збирає `src/middlewares/error.js`.
- Доступ: захищені маршрути викликають `authMiddleware`. Роль із JWT перевіряє `restrictTo` (`src/middlewares/auth.js`). Користувачі: зміна статусу і видалення лише для `admin` (`src/routes/user.js`). Питання: читання після входу, запис лише `tutor` (`src/routes/question.js`). Категорії: усі методи лише `tutor`.
- Стиль: CommonJS, без крапки з комою, одинарні лапки, ширина 120 — `.prettierrc`. ESLint: `eslint.config.js` (рекомендовані правила JS, `eslint-plugin-n`, для тестів `eslint-plugin-jest`). Правило `n/no-missing-require` вимкнене.
- Тести: Jest, файли `*.spec.js` у `src/test/unit` і `src/test/integration` (`jest.config.js` — `testMatch`). Середовище `node`, один воркер (`package.json` — скрипт `test`). Перед тестами `src/test/setEnv.js`. Інтеграційні тести ходять у MongoDB: `README.md` і `src/initialization/database.js` (у `test` колекції з’єднання скидаються). Покриття пишеться в `src/test/coverage`. Поріг у `jest.config.js`: branches 34, functions 45, lines 64, statements 63.
- Гілки і процес. `README.md`: гілки фіч зливаються в `develop`, `main` для релізів. `CONTRIBUTING.md` і `CONTRIBUTING_UA.md`: старт із `develop`, нова гілка `your_branch_name`, pull request у `develop`, один коміт на PR. `.github/workflows/main.yaml`: push і pull request на `main`, `develop`, `devops`; кроки — `npm ci`, `format:check`, `lint`, `npm test`, потім збірка Docker-образу. `azure-pipeline.yaml`: гілки `main` і `develop`, кроки Node 24, `npm ci`, збірка образу. Хуки: `.husky/pre-commit` запускає `npm run pre-commit` (у `package.json` це `lint-staged`), `.husky/pre-push` запускає `npm test`.

## Підводні камені

- Пароль зберігається і перевіряється як переданий рядок. `src/services/user.js` — `userService.createUser` записує поле `password` без перетворення. `src/services/auth.js` — `authService.login` порівнює `password === user.password`. Пошук `bcrypt` у `src/**/*.js` нічого не дав, хоча пакет є в `package.json`. `userService.getUserByEmail` навмисно робить `.select('+password')`.
- `POST /send-email` і обидва методи `/admin-invitations` не викликають `authMiddleware` (`src/routes/email.js`, `src/routes/adminInvitation.js`). `emailController.sendEmail` бере з тіла `email`, `subject`, `text` і кличе `emailService.sendEmail`.
- Чати не зібрані. `src/routes/index.js` не підключає `src/routes/message.js`. Цей файл, `src/services/message.js` і `src/services/chat.js` вимагають відсутні `~/controllers/message`, `~/models/chat`, `~/models/message`. Пошук імпортів сервісів чату і повідомлень поза цими файлами — порожній, тож з `src/app.js` вони не викликаються. `eslint.config.js` вимикає `n/no-missing-require`, тому лінт цей обірваний `require` не ловить.
- Пропозиція розходиться сама з собою. Схема `src/models/offer.js` не містить `subject` і `category`. `offerService.createOffer` все одно передає їх у `Offer.create`, а `offerService.getOfferById` робить `populate` шляхів `subject` і `category`. `src/routes/offer.js` на `POST /offers` перевіряє тіло через `isEntityValid` з `idName` `categoryId` і `subjectId` і моделлю `Offer`, тобто шукає документ `Offer` за цими id (`src/middlewares/entityValidation.js`). Сервіс читає поля `subject` і `category`, не `categoryId` і `subjectId`. `offerService.updateOffer` приймає `currentUserId` і в тілі функції його не читає; `deleteOffer` автора не перевіряє.
- `offerAggregateOptions` бере автора з `params.id` (`src/utils/offers/offerAggregateOptions.js`). Роутер оферів змонтований як `/offers` без батьківського параметра (`src/routes/index.js`). Гілка пошуку по `subject.name` виконується лише коли цей `authorId` є.
- Тестовий старт стирає колекції поточної бази. `src/initialization/database.js` — `checkForLocalDB`: якщо `NODE_ENV === 'test'`, викликається `dropAllCollections` на тому `MONGODB_URL`, до якого щойно підключились. `README.md` просить для тестів окремий URL `sp_project_test`.
- Крон неактивності кличе не той контракт. `checkLastLogin` передає в `userService.getUsers` об’єкт `defaultFilter` з ключами `name`, `email`, `status`, `lastLogin`, `createdAt` (`src/cron-jobs/checkForLastLogin.js`). `userService.getUsers` читає `match`, `sort`, `skip`, `limit` (`src/services/user.js`). Далі код бере `users.items` і поле `language`, тоді як у схемі користувача мова застосунку — `appLanguage` зі `select: false` (`src/models/user.js`).
- `authMiddleware` бере `req.cookies.accessToken`, а якщо його немає — сирий рядок `req.headers.cookie` (`src/middlewares/auth.js`). Далі `tokenValidation` перевіряє цей рядок як access JWT.
- `restrictTo` порівнює `req.user.role` з одним рядком ролі. У токен цей `role` кладе `authService.login` з поля `lastLoginAs`, тоді як `User.role` у схемі — масив. Сід суперадміна пише `role: SUPERADMIN` рядком (`src/seed/seedSuperAdmin.js`), схема чекає масив (`src/models/user.js`).
- `JWT_CONFIRM_EXPIRES_IN` потрібна `tokenService.generateConfirmToken`, але в `.env.example` цієї назви немає. `docker-compose.yml` підкладає в контейнер `env_file` `.env.example`. Значення з прикладу в карту не копіювались. `README.md` називає JWT-секрети в прикладі локальними заглушками.
- `azureAccess` і `src/middlewares/multer.js` ніхто не імпортує (пошук по `src/**/*.js`). `QUIZ_VIEW_ENUM` ніде, крім оголошення в `src/consts/validation.js`, не зустрічається. Ключі `LESSON`, `FINISHED_LESSON`, `QUIZ`, `FINISHED_QUIZ`, `ATTACHMENT`, `MESSAGE`, `CHAT` у `src/consts/models.js` не використовуються іншими файлами `src` (пошук цих ідентифікаторів).
- Шаблон листа про зміну пароля називається з друкарською помилкою, і посилання збігається з ім’ям файлу: `src/emails/index.js` — шлях `en/sucessful-password-reset` і `ua/sucessful-password-reset`. Файли `src/emails/en/sucessful-password-reset.pug` і `src/emails/ua/sucessful-password-reset.pug` у дереві є.
- `TODO` і `FIXME` не знайдено в коді. Шукав `TODO|FIXME|XXX|HACK` у `src/**/*.js` — збігів немає.

## Межі карти

Навмисно не читались `node_modules`, `.git`, `src/test/coverage`, `dist`, `build`, `vendor`. Файл `test-report.xml` у корені є; його вміст не відкривався. `package-lock.json` не розбирався. Тіла всіх `*.spec.js` і всіх Pug-шаблонів не перечитувались: тести і шаблони вказані за шляхами і за тими файлами, які відкриті (`jest.config.js`, `src/test/setEnv.js`, `src/emails/index.js`). Тіло `src/utils/mailer.js` не відкривалось, лише факт підключення з `src/services/email.js`.

Карта зібрана з коміту `2343e752257705db91305167ccde897712fad675` на гілці `develop`.
