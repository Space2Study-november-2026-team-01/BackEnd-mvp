---
name: sprint-plan
description: >
  Plan a student sprint from cards that are already analyzed: dependency graph,
  critical path, assignment across people, stages, how to avoid idle waiting,
  and risks. Use this skill when someone asks «склади план на спринт»,
  «розподіли задачі», «хто кого блокує», «критичний шлях», «розклади спринт по
  людях», "plan the sprint", or "who blocks whom". It reads
  docs/sprint/SPRINT_ANALYSIS.md and writes docs/sprint/SPRINT_PLAN.md. It does
  not change code. If they ask for the card analysis itself rather than a plan
  of people, the sprint-cards-analysis skill comes first.
---

# Sprint plan

You lay out cards that are already analyzed, across people and across time, so blocking work starts first and parallel streams do not land in the same files.

Write the chat reply and the file in Ukrainian.

## Limits

Do not change code and do not create branches, pull requests, or tickets. The only file you write is `docs/sprint/SPRINT_PLAN.md`.

The input is `docs/sprint/SPRINT_ANALYSIS.md` in this repository. If the file is missing, run `sprint-cards-analysis` first (it will run `project-map` if needed) and only then plan. Before planning, re-read the analysis from disk: the team may have edited the file after the previous step. The edited file wins over the chat summary.

## Team

Ask how many people are on the team, their names, and, optionally, strengths: backend, frontend, testing. If there is no answer, plan as «Учасник 1», «Учасник 2», «Учасник 3» and say the names are placeholders.

A strength is a preference, not a ban. If the critical path needs a frontend-leaning person on a small blocking backend change, assign it and explain why. Do not invent skills the user did not name.

If there is one person, do not invent a parallel team. Keep the sequence and the dependencies.

## What to do

1. Build a dependency graph of the cards and subtasks from the analysis. On each edge write what must exist to unblock the next item, for example a table migration or `POST /path` with named fields. Take dependencies from the analysis. Add a new dependency only when the code or the cards share an artifact, and mark it «Припущення:».
2. Find the critical path: the longest chain whose delay moves the end of the sprint. Weight it with the S/M/L estimates from the analysis (S = 1, M = 2, L = 3). This compares chains; it is not a forecast in hours. If two chains are equal, name both.
3. Assign work so blocking items start in the first stage, people in parallel do not edit the same files in the same stage, and the S/M/L sums are close. List files with a merge-conflict risk by path. If the analysis did not name a file with confidence, mark the line «Припущення:».
4. Lay the work out as «Етап 1», «Етап 2», and so on. In each stage, for each person, write what they do and whom they wait for. A stage is a slice after which an artifact appears for someone else, not a calendar day.
5. For each pair "blocks → blocked", suggest how to shorten the wait: an API mock or stub, a written contract, a feature flag, test data. Tie the suggestion to that pair and to the contract from the analysis. Do not dump one generic list of techniques for the whole sprint.
6. Collect risks and open questions that must be closed at the start of the sprint. Take the questions from «Відкриті питання» in the analysis. Do not drop them while planning: a plan with a vague acceptance criterion has to show that.

Do not rewrite code. When you cite a file, take the path from the analysis or the map. Mark something missing as «не знайдено в коді» and say where you looked. Mark a guess with «Припущення:».

If there are more people than independent streams, do not invent tasks to fill them. Suggest a pair on the critical path and explain that these cards have no separate parallel stream.

## Output file

`docs/sprint/SPRINT_PLAN.md`:

```markdown
# План роботи на спринт

- Дата: YYYY-MM-DD
- Аналіз: docs/sprint/SPRINT_ANALYSIS.md
- Команда: <names or «Учасник N»; strengths if they were named>

## Граф залежностей

## Критичний шлях

## Розподіл

## Файли з ризиком конфлікту злиття

## Етапи

## Як зменшити очікування

## Ризики і питання на старті

## Підсумок для учасників
```

In «Граф залежностей», after a short explanation, add a Mermaid `graph TD` diagram. Node ids are Latin letters without spaces; labels may be Ukrainian inside quotes. Label each edge with the artifact that unblocks the work.

In «Розподіл», show a table: person, tasks, S/M/L sum. If the sums diverge, explain which chain forced that.

In «Підсумок для учасників», give each person a short block in the second person: their tasks, whom they depend on, whom they block. A student should be able to read only their block and see their place in the sprint.

In chat, show the file path, the critical path, and the per-person summaries. Leave the full diagram in the file.
