import { create } from 'zustand';

type UiState = {
  density: 'comfortable' | 'compact';
  toggleDensity: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  density: 'comfortable',
  toggleDensity: () =>
    set((state) => ({
      density: state.density === 'comfortable' ? 'compact' : 'comfortable',
    })),
}));
