# CI/CD Slide Visuals

`src/features/lab/slides/cicd/` owns the CI/CD presentation's slide-specific visual implementations.

Rules:

- use one numbered file per CI/CD slide visual slot, such as `01-delivery-loop-comparison.tsx`
- export each slide visual from `index.ts`
- keep slide-specific data, state, and render bodies in the numbered slide file
- put only implementation helpers shared by multiple CI/CD slide visuals in `shared/`
- import reusable design primitives from `src/features/lab/visuals/`

The reusable primitive layer remains in `src/features/lab/visuals/`. New topic decks should get their own namespace under `src/features/lab/slides/{topic}/`.
