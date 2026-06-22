# Reports

Permission and SDLC/security report data is stored as canonical JSON controls, not hand-edited TSV spreadsheets.

## Source of truth

- Schema: `docs/reports/schema/permission-controls.schema.json`
- Data: `docs/reports/data/controls/*.json`

Each control can appear in multiple generated report views through `reportViews[]`.

## Local commands

Run from `app/microservices/`:

```sh
pnpm run reports:permissions:validate
pnpm run reports:permissions
```

Generated files are written to `docs/reports/build/` and are ignored by Git because CI uploads them as artifacts.

## CI

`permission-report-ci` validates the JSON controls and uploads Markdown + JSON report artifacts on main and on the weekly schedule.

`weekly-permission-audit.md` is the GitHub Agentic Workflow source for the rolling weekly audit issue. Recompile it after edits:

```sh
gh aw compile .github/workflows/weekly-permission-audit.md
```
