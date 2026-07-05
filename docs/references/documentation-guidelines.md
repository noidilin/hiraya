# Documentation Guidelines

Use these rules to keep Hiraya documentation easy for agents and humans to discover.

## Core rule

> READMEs route, architecture explains, runbooks operate, ADRs justify, references enumerate.

## Document roles

| Type | Owns | Avoids |
|---|---|---|
| `AGENTS.md` | Agent runtime rules, active project goal, caution zones | Full project explanation, command catalogs |
| Root/boundary `README.md` | Short orientation and links to the right canonical docs | Long runbooks, duplicated architecture essays |
| `docs/INDEX.md` | Task routing: what to read for each kind of work | Becoming a second command reference |
| `CONTEXT.md` | Canonical Hiraya terms and naming guidance | Procedures or implementation notes |
| `docs/architecture/` | Current system structure, ownership, and flows | Exact deploy/destroy steps |
| `docs/runbooks/` | Preconditions, commands, validation, recovery, evidence | Historical rationale or broad architecture tutorials |
| `docs/adr/` | Decision context, chosen option, consequences | Living operational procedures |
| `docs/references/` | Stable tables: commands, paths, workflows, env vars | Narrative explanations or task procedures |

## Source-of-truth policy

Each durable fact should have one owner.

- Domain language: `CONTEXT.md`
- Task routing: `docs/INDEX.md`
- Common commands: `docs/references/commands.md`
- Repo paths: `docs/references/repo-map.md`
- Workflow map: `docs/references/workflows.md`
- Environment variables: `docs/references/env-vars.md`
- Current architecture: `docs/architecture/`
- Operational steps: `docs/runbooks/`
- Rationale: `docs/adr/`

Other docs may summarize a fact in one or two lines, then link to the owner.

## Command policy

- Put reusable command catalogs in `docs/references/commands.md`.
- Put exact operational commands inside the relevant runbook step.
- Avoid command blocks in architecture docs unless the command is essential to explain a flow.
- Boundary READMEs may name the validation commands, but should link to the command reference for details.

## Runbook policy

A runbook should include:

1. When to use it.
2. When not to use it.
3. Safety boundary.
4. Prerequisites.
5. Procedure.
6. Validation.
7. Evidence to capture.
8. Recovery.

If a runbook needs background, link to architecture docs instead of embedding the full architecture model.

## ADR policy

ADRs are historical records. Do not rewrite them as living docs unless correcting an error. Prefer adding a short status note or creating a superseding ADR.

## Refactor checklist

When moving or trimming docs:

1. Identify the owner of each fact before deleting duplicates.
2. Replace removed duplicate text with a link to the owner.
3. Check relative links from edited files.
4. Keep generated, archived, or plan documents out of the main discovery path unless they are still active.
