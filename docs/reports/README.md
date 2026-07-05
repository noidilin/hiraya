# Reports

Permission, SDLC/security, and standards-alignment report data is stored as canonical JSON controls and mapping files, not hand-edited TSV spreadsheets.

## Source of truth

- Permission controls schema: `docs/reports/schema/permission-controls.schema.json`
- Permission controls data: `docs/reports/data/controls/*.json`
- Standards alignment schema: `docs/reports/schema/standards-alignment.schema.json`
- Standards alignment data: `docs/reports/data/standards/*.json`

Each control can appear in multiple generated report views through `reportViews[]`. Standards mapping files reference these canonical controls through `projectControlIds[]`.

Control data files are topical bundles, so `dataset.domains[]` declares every domain allowed in that file while each control keeps its specific `control.domain` classification. Runtime validation enforces that every `control.domain` is listed in the containing file's `dataset.domains[]`.

The JSON schemas define the external data contract for the retained report data. The former generated report CI has been retired; keep these JSON files as the durable source data for future reporting or audit work.

The Standards Alignment Report is evidence-based and intentionally avoids formal compliance claims unless separate audit evidence exists.

