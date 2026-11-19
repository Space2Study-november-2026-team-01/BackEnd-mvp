---
name: sprint-cards-analysis
description: >
  Read sprint cards against a repository that already has code: the point of
  the card, acceptance criteria, what already exists, changes by layer, S/M/L
  size, whether to split the work, and who depends on whom. Use this skill
  when a student writes «проаналізуй картки спринта», «розбери задачі
  спринта», «що вже зроблено по цих тікетах», «оціни складність карток»,
  "analyze the sprint cards", or pastes a Jira, Trello, or CSV export, or a
  list of GitHub Issues for the sprint. Only read the code and write
  docs/sprint/SPRINT_ANALYSIS.md. Hand planning of people and «хто кого
  блокує» to the sprint-plan skill.
---

# Sprint card analysis

You help a student team understand sprint cards against code other developers wrote. The team should see what already exists, what they will have to change, and where splitting a card helps rather than adding coordination.

Write the chat reply and the file in Ukrainian.

## Limits

Do not change code. The only file you write is `docs/sprint/SPRINT_ANALYSIS.md` at the root of the repository the cards belong to. Create `docs/sprint/` if it is missing.

Before the analysis, read `docs/sprint/PROJECT_MAP.md` in that same repository. If the file is missing, run the `project-map` skill first and only then return here. If the map exists, rely on it and still open the files you cite: the map can be behind the commit. If the map and the code disagree, say so, with both paths.

If several repositories are open, every path must name which root it belongs to.

## Where the cards come from

Accept the format the user gave you:

- text pasted into the chat;
- a markdown or CSV file (a Jira, Trello, or similar export);
- GitHub Issues, if `gh` is available: ask for the milestone name or the sprint label and take the tasks from there.

If the format is unclear or the message has no cards, ask and stop. Do not invent cards from old files and do not substitute "typical" student-project tasks.

In the analysis header, say where the cards came from (chat, file path, milestone, or label).

## Subagent

If the environment can launch a subagent, hand it the map and the code scan for these cards. Pass the card text, the path to `PROJECT_MAP.md`, and the requirement to write `SPRINT_ANALYSIS.md`. Return to the main conversation a short summary (per card: size, kind of work, dependencies) and the absolute path of the file.

If there is no subagent, do the analysis yourself. Do not invent a report you did not write.

## What to decide for each card

1. The point in one or two sentences, and the acceptance criteria. Take the criteria from the card. If they are missing or vague, do not invent them as a requirement. Write questions for the product owner.
2. What already exists in the code: concrete files that already partly do this behavior or that will have to change. Path plus the class, function, or endpoint where that is visible.
3. What to do, by layer: database, backend, API, frontend, tests, documentation. If a layer does not need a change, write «змін не потрібно» and why that follows from the code or from the card text.
4. Size S, M, or L, with a short reason. Look at how many layers change, whether a new entity appears, and the risks (authentication, data, an unclear card, a place without tests). This is a guide for splitting work, not a promise in hours. Start the estimate with «Припущення:».
5. Kind of work.
   - «Індивідуальна» — the change is local, in one layer or module, and splitting it would add more coordination than benefit. Say so.
   - «Можна розбити» — there are parts that can proceed in parallel after a shared contract. A typical case is an endpoint and a screen, once the request and response are agreed. For each subtask write what it includes and the contract the people fix before they start (fields, endpoint path, event, schema).
   - If the card is vague and you are unsure, choose «Індивідуальна» and explain that splitting is premature. Two people in the same files usually costs more than the change itself.
6. Dependencies on other cards in this sprint: what must be ready earlier, and which artifact unblocks the next card (a migration, an endpoint, a shared type). Do not link cards only because the titles sound alike. If the card text and the code show no link, say that plainly.

Support every claim about code with a path. If you searched and did not find it, write «не знайдено в коді» and where you looked. Mark a guess with «Припущення:».

Size guide, which you may change when the code says otherwise:

- S — one layer, a sample of this kind of change already exists, no new entity.
- M — two layers, or a new endpoint or field following an existing sample.
- L — a new entity across several layers, or the card touches authentication or data so that a mistake breaks existing users, or it is unclear what "done" means until the product owner answers.

## Output file

`docs/sprint/SPRINT_ANALYSIS.md`:

```markdown
# Аналіз карток спринта

- Дата: YYYY-MM-DD
- Джерело карток: <chat | file path | milestone or label>
- Карта проєкту: docs/sprint/PROJECT_MAP.md, коміт <hash from the map>

## Картка: <id> <title>

### Суть і критерії приймання

### Питання до власника продукту

### Що вже є в коді

### Що треба зробити

### Складність

### Тип роботи

### Залежності

## Відкриті питання
```

If a card has no questions for the product owner, write «немає» in that subsection. In the final «Відкриті питання» list, gather every question from the cards, number them, and keep the card id next to each one. The team needs this list at the start of the sprint so they do not begin with vague acceptance criteria.

In chat, show the file path and a short summary per card. Leave the full analysis in the file.
