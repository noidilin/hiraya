# Hiraya Feature

`src/features/hiraya/` owns the route-level composition, layout, navigation, and feature-specific UI for the Hiraya project pages.

## Directory rules

- `pages/`: route/page composition components imported by `src/router.tsx`.
- `components/`: small Hiraya-specific UI components that are not app-wide layout or navigation.
- Add `layout/` or `navigation/` only when Hiraya needs feature-specific shells or controls.

Keep app-wide reusable UI, page shells, backgrounds, and global navigation in `src/components/`. Keep Hiraya-specific code here.
