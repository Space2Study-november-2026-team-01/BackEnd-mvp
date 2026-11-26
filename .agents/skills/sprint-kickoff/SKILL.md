---
name: sprint-kickoff
description: >
  Run a student sprint start on a repository other people wrote, in order:
  project map, card analysis, plan across people. Stop between steps and show
  the intermediate file so the team can correct it. Use this skill when someone
  asks «старт спринта», «kickoff», «пройди весь розбір спринта», «спочатку
  розберися в проєкті, потім картки, потім план», «підготуй нас до спринта»,
  or "start the sprint". If they ask for only one of these («де шукати»,
  «проаналізуй картки», «хто кого блокує»), use that single skill, not the
  whole chain.
---

# Sprint start

You walk the team through three existing skills, in order. Do not shorten the steps or replace them with your own retelling: before each step, read its `SKILL.md` and do what it says.

- Map: `.agents/skills/project-map/SKILL.md` → `docs/sprint/PROJECT_MAP.md`
- Cards: `.agents/skills/sprint-cards-analysis/SKILL.md` → `docs/sprint/SPRINT_ANALYSIS.md`
- Plan: `.agents/skills/sprint-plan/SKILL.md` → `docs/sprint/SPRINT_PLAN.md`

The conversation is in Ukrainian. Do not change code at any step.

Keep the whole kickoff in the main conversation. The pause and the shown result have to happen here, otherwise the team cannot correct the file before the next step. A subagent is allowed only inside `project-map` and `sprint-cards-analysis`, as those skills describe.

If several repositories are open, ask which ones are in this sprint when the cards do not make that obvious. Each repository's files stay in its own `docs/sprint/`.

## Step 1. Map

Read `docs/sprint/PROJECT_MAP.md` if it exists.

- The file is missing — run `project-map`, show the summary and the path, and stop.
- The file exists — compare the hash in its header with the current `git rev-parse HEAD` of this repository. If the hashes match, say the map is current and stop before the analysis so the team can ask for corrections.
- The hashes differ — write both hashes and the date from the file. Ask whether to rebuild the map or continue with the old one. A large merge, or the phrase «карта застаріла», means rebuild. Silence is not agreement: do not continue without an answer.
- After a rebuild, show the summary again and stop.

The stop matters because the analysis rests on the map. A mistake in the map spreads into the cards and the plan.

## Step 2. Cards

Start only after the team answers the pause in step 1.

If the cards are not here yet, ask for the format and stop: text in the chat, a markdown or CSV file, or a GitHub Issues milestone or label. Do not invent cards.

Then run `sprint-cards-analysis`. Before that, read the map from disk again, including the team's edits.

After `SPRINT_ANALYSIS.md` is written, show the path, the size and kind of work for each card, and the open questions. Stop. The next step changes how people are assigned, so the team needs time to correct the point of the cards and the dependencies.

## Step 3. Plan

Start only after the team answers the pause in step 2. Re-read `SPRINT_ANALYSIS.md` from disk.

Ask for the team the way `sprint-plan` requires: count, names, and optionally strengths. If the person explicitly says there are no names, use «Учасник 1, 2, 3…». If they have not answered about the team, ask and stop.

Then run `sprint-plan`. At the end, show the path to `SPRINT_PLAN.md`, the critical path, and the "your tasks" block for each person.

## When the team comes back with corrections

A map correction — update only the map and stop again. Do not rewrite the analysis and the plan until they ask, because those files may already contain hand edits.

An analysis correction — re-read the file and ask whether to rebuild the plan.

A plan correction — edit `SPRINT_PLAN.md` under that same skill, without touching code.
