import { create } from 'zustand'

type LabState = {
  runCount: number
  selectedStage: string
  activeStatus: 'idle' | 'running' | 'failed' | 'passed'
  incrementRun: () => void
  resetRuns: () => void
  setSelectedStage: (selectedStage: string) => void
  setActiveStatus: (activeStatus: LabState['activeStatus']) => void
}

export const useLabStore = create<LabState>((set) => ({
  runCount: 0,
  selectedStage: 'BLD',
  activeStatus: 'running',
  incrementRun: () => set((state) => ({ runCount: state.runCount + 1 })),
  resetRuns: () => set({ runCount: 0, activeStatus: 'idle' }),
  setSelectedStage: (selectedStage) => set({ selectedStage }),
  setActiveStatus: (activeStatus) => set({ activeStatus }),
}))
