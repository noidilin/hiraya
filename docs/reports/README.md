# Reports

Permission, SDLC/security, and standards-alignment report data is stored as canonical JSON controls and mapping files, not hand-edited TSV spreadsheets.

## Source of truth

- Permission controls schema: `docs/reports/schema/permission-controls.schema.json`
- Permission controls data: `docs/reports/data/controls/*.json`
- Standards alignment schema: `docs/reports/schema/standards-alignment.schema.json`
- Standards alignment data: `docs/reports/data/standards/*.json`

Each control can appear in multiple generated report views through `reportViews[]`. Standards mapping files reference these canonical controls through `projectControlIds[]`.

Control data files are topical bundles, so `dataset.domains[]` declares every domain allowed in that file while each control keeps its specific `control.domain` classification. Runtime validation enforces that every `control.domain` is listed in the containing file's `dataset.domains[]`.

The JSON schemas define the external data contract. The TypeScript report generator keeps zero-dependency runtime validators for schema-shaped checks plus repository-specific semantic checks such as evidence path existence, duplicate report sort keys, expected report row counts, and standards mappings to known controls.

## Local commands

Run report commands from the repository root:

```sh
pnpm run reports:permissions:validate
pnpm run reports:permissions
```

Generated files are written to `docs/reports/build/` and are ignored by Git because CI uploads them as artifacts:

- `permission-report.md`
- `permission-analysis.json`
- `standards-alignment.md`
- `standards-alignment.json`

The Standards Alignment Report is evidence-based and intentionally avoids formal compliance claims unless separate audit evidence exists.

## CI

`permission-report-ci` validates the JSON controls plus standards mappings and uploads Markdown + JSON report artifacts on main and on the weekly schedule.

`weekly-permission-audit.md` is the GitHub Agentic Workflow source for the rolling weekly audit issue. From the repository root, recompile it after edits:

```sh
gh aw compile .github/workflows/weekly-permission-audit.md
```
