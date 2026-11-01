[![SpaceToStudy](https://raw.githubusercontent.com/ita-social-projects/SpaceToStudy-Client/develop/spacetostudy-thumbnail.jpg)](https://lms.softserve.university/)

# Space2Study backend

[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-6.13-880000)](https://mongoosejs.com/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325?logo=jest&logoColor=white)](https://jestjs.io/)

[![Lines](https://img.shields.io/badge/lines-66%25-yellowgreen)](#tests)
[![Statements](https://img.shields.io/badge/statements-66%25-yellowgreen)](#tests)
[![Functions](https://img.shields.io/badge/functions-47%25-orange)](#tests)
[![Branches](https://img.shields.io/badge/branches-36%25-orange)](#tests)

API for Space2Study, a platform where tutors share courses and students find someone to learn from. This repository is the Express and MongoDB backend. It does not contain the web client.

Coverage badges show the latest local Jest run of 29 tests. They are static and need a manual update when coverage changes.

## Stack

- Node.js 24
- Express 4
- MongoDB 6 and Mongoose 6
- Jest and Supertest

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm 10 or newer
- MongoDB 6, either installed locally or started with Docker
- Docker Desktop, only if you want to run the API in containers

## Setup

```shell
npm ci
copy .env.example .env
```

On macOS and Linux use `cp .env.example .env`. Fill in the Gmail OAuth values in `.env` before using signup, password reset, or any other route that sends mail. JWT secrets in `.env.example` are local placeholders. Replace them before deploying.

## Run locally

Use one database, not both at once.

MongoDB installed on this machine listens on `127.0.0.1:27017`. That is the default `MONGODB_URL` in `.env.example`.

To use the database container instead, start only that service and point `.env` at host port 27018:

```shell
docker compose up database
```

```text
MONGODB_URL=mongodb://127.0.0.1:27018/sp_project
```

Port 27018 is the published port. Inside the Compose network MongoDB still listens on 27017, so a local MongoDB installation can keep 27017.

Then start the API on the host:

```shell
npm run dev
```

The API listens on `http://localhost:3000` when `SERVER_PORT` is `3000`. `npm start` runs the same process without Nodemon and is what the Docker image uses.

## Run with Docker

```shell
copy .env.example .env
npm run docker:up
```

Compose starts two services:

- `api` — this application, published on port 3000
- `database` — MongoDB 6, published on host port 27018

`MONGODB_URL` inside the `api` container is `mongodb://database:27017/sp_project`. Compose sets that value itself, so the URL in `.env` does not affect the container. Stop the stack with `npm run docker:down`.

## Tests

Tests need a running MongoDB. Jest reads `.env.test.local` and then `.env`. Any variable that is still empty gets a local test default from `src/test/setEnv.js` (`127.0.0.1:27017`), so the suite does not need GitHub secrets. With only the Docker database running, set `MONGODB_URL` to `mongodb://127.0.0.1:27018/sp_project_test`.

```shell
npm test
```

GitHub Actions starts MongoDB itself and does not need repository secrets. The workflow is `.github/workflows/main.yaml`. It installs Node.js 24, checks formatting, lints the project, runs the test suite, then builds the Docker image.

## API

| Prefix                  | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `/auth`                 | Signup, login, logout, refresh, password reset |
| `/users`                | User profiles and status                       |
| `/offers`               | Tutor offers                                   |
| `/questions`            | Questions                                      |
| `/resources-categories` | Resource categories                            |
| `/admin-invitations`    | Admin invitations                              |
| `/send-email`           | Outbound email                                 |

Authenticated routes expect an `accessToken` cookie.

## Project layout

```text
src/
  app.js            process entry
  configs/          environment mapping
  controllers/      HTTP handlers
  cron-jobs/        scheduled jobs
  emails/           Pug templates
  initialization/   database, env, and server startup
  middlewares/
  models/           Mongoose models
  routes/
  services/         business logic
  test/             Jest unit and integration tests
  validation/
```

Business rules live in `src/services`. Mongoose models live in `src/models`. Route files only wire middleware and controllers.

## Configuration

Runtime configuration comes from environment variables. `.env.example` lists every variable the process reads. `.env`, `.env.local`, and `.env.test.local` are gitignored.

## Contributing

Feature branches merge into `develop`. `main` is for releases. See `CONTRIBUTING.md` and `CONTRIBUTING_UA.md`.

Run `npm test` before pushing. The pre-push hook does this as well, so MongoDB has to be running.

## License

MIT. Copyright 2021 ITA-Social-Projects.
