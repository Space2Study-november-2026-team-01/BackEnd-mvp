---
name: project-map
description: >
  Map an existing repository for a student who is seeing the project for the
  first time: stack, modules, entry point, where to find domain concepts,
  conventions visible in the code, and traps. Use this skill when someone asks
  «де в проєкті шукати», «що де лежить», «розберися в коді», «склади карту
  проєкту», "where do I look in this project", "project map", at the start of
  work on a repository other people already wrote, or when the map is stale
  after a large merge. Only read the repository and write
  docs/sprint/PROJECT_MAP.md. Do not use this skill to implement a feature, fix
  a bug, or refactor.
---

# Project map

You are scouting a repository the student team did not write. The map answers "where do I look, and why does this module exist", not a dump of the folder tree.

Write the chat reply and the file in Ukrainian.

## Limits

The map only reads the repository. The only file you write is `docs/sprint/PROJECT_MAP.md` at the root of the repository you are describing. Create `docs/sprint/` if it is missing. Do not change code, configuration, dependencies, git, or CI.

If several repositories are open, write each map into that repository's own `docs/sprint/PROJECT_MAP.md`. Every statement must show which repository the path belongs to. Do not describe a file from one repository inside the other repository's map.

## Facts and guesses

Students will treat the map as true. Because of that:

- Support every claim about code with a file path. Add the class, function, component, or endpoint when you can.
- Make the path openable: `path/to/file` — `Name.symbol`.
- When you did not find something, write the exact sentence «не знайдено в коді» and say where you looked (folders, file names, search string).
- Start a guess with «Припущення:». Do not write a guess without that word.
- Do not copy secret values from `.env` or similar files. Variable names may come from `.env.example`, the README, or sample config.

Do not read `node_modules`, `dist`, `build`, `vendor`, `coverage`, `.git`, or generated directories. In «Межі карти» list what you skipped on purpose.

## Subagent

If this environment can launch a subagent (a separate agent with its own context), hand it the reading and the scan. Pass this skill in full, the repository root, and the requirement to write the file. Return to the main conversation only a short summary (stack, how many modules, the most important traps) and the absolute path to `PROJECT_MAP.md`.

If there is no subagent, do the steps yourself. Do not invent a subagent report. If the subagent did not write the file, write it yourself under the same rules.

## Order of work

Decide the stack from build files, not from habit. Look at what is actually in the root and in the modules: `pom.xml`, `build.gradle`, `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `composer.json`, `*.csproj`, `docker-compose.yml`, Dockerfile. Name a stack only where such a file exists.

1. Walk the repository. Record the stack, modules or services, entry point, how to run it (README, scripts, docker), and configuration. List environment variables by name.
2. For each module write one sentence on why it exists (from what it contains) and where its key layers are: routes, controllers, endpoints; business logic and services; data access (repositories, models, migrations); pages and components; tests. If a layer is absent, mark it «не знайдено в коді» plus where you looked.
3. Build a "where to look" index. For each domain concept or function you can see in the code (users, authentication, search, and whatever you find next), name the backend, frontend, data, and test files.
4. Record conventions that are visible in the code: naming, package layout, API style, how existing tests are written, the branch model. Take branches and process only from `CONTRIBUTING`, CI config, or the README. If they are missing, write «не знайдено в коді» and list the places you checked.
5. Collect traps separately: dead or duplicated code, `TODO` and `FIXME`, surprising spots. Call something dead only after you searched for usages. If the search was incomplete, start with «Припущення:». If there are many `TODO`/`FIXME` marks, give the count, the search string, and a few file-and-line examples, not a wall of the whole repository.

At the top of the file put the date and the commit the map was built from. Take them from this repository's git (`git rev-parse HEAD`, the short hash, the subject of the latest commit, the current branch). If this is not a git repository, write «хеш коміту не знайдено» and the command that failed. The date is the day you write the file.

## Output file

Write `docs/sprint/PROJECT_MAP.md` with exactly these sections, in this order. The same frame lets the later skills and the students find the same places.

```markdown
# Карта проєкту

- Дата складання: YYYY-MM-DD
- Коміт: <full hash> (<short hash>)
- Гілка: <name or «не знайдено в коді»>
- Репозиторій: <root>

## Як читати цю карту

## Стек

## Запуск і конфігурація

## Модулі

## Де шукати

## Домовленості в коді

## Підводні камені

## Межі карти
```

In «Стек», attach a proof file to every conclusion. In «Модулі», the "why" sentence comes first, then the layers. In «Де шукати», use a table: concept, backend, frontend, data, tests. Do not leave a cell empty: write a path or «не знайдено в коді».

In chat, after writing, give the file path and a short summary. Leave the full text in the file so the team can correct it.
