import { expect } from 'vitest'

export function stableListShape<TItem, TStableShape>(
  items: readonly TItem[],
  getStableShape: (item: TItem) => TStableShape,
): TStableShape[] {
  return items.map(getStableShape)
}

export function expectStableListParity<TItem, TStableShape>(
  localizedItems: readonly TItem[],
  referenceItems: readonly TItem[],
  getStableShape: (item: TItem) => TStableShape,
): void {
  expect(stableListShape(localizedItems, getStableShape)).toEqual(stableListShape(referenceItems, getStableShape))
}
