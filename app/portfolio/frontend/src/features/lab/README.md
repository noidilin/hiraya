# Lab Feature

`src/features/lab/` owns the route-level composition, navigation, presentation runtime, reusable visual grammar, and deck-specific slide visuals for the lab experience.

## Directory rules

- `pages/`: route/page composition components imported by `src/router.tsx` or top-level app entry points.
- `navigation/`: lab-specific route and lesson navigation controls.
- `components/`: small lab-specific UI components that are not app-wide layout, navigation, presentation runtime, or visuals.
- `presentation/`: topic presentation runtime, content renderer, placeholders, and visual-slot loading.
- `visuals/`: reusable lab visual grammar and reference components shared across decks/topics.
- `slides/{topic}/`: deck/topic-specific slide visual implementations.

Keep app-wide reusable UI, page shells, backgrounds, and global navigation in `src/components/`. Keep lab-specific code here.
