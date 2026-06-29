# Lab Visuals

`src/features/lab/visuals/` is the design-reference and reusable primitive layer for the lab.

Keep this directory for stable visual grammar:

- reusable primitives and reference components
- `flow/flow-node-kit.tsx` as the stable semantic React Flow node grammar for CI/CD maps
- shared visual vocabulary, motion patterns, and component treatments
- helpers that are genuinely useful across topics, not just one deck

Do not add CI/CD slide-specific implementations here. A component that exists only to satisfy a `LabVisualSlotKey` for the CI/CD presentation belongs in `src/features/lab/slides/cicd/`.

This layer must not import from `src/features/lab/slides/`.
