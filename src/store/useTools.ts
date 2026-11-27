import { create } from 'zustand';

export type ToolTab = 'calc' | 'notes';
export type InkColor = 'fg' | 'accent' | 'danger';

export interface Stroke {
  color: InkColor;
  /** Base line width in CSS pixels. */
  width: number;
  /** [x, y, pressure] in CSS pixels relative to the sheet. */
  points: [number, number, number][];
}

export interface Page {
  key: string;
  label: string;
  strokes: Stroke[];
  /** Earlier versions of `strokes`, for undo. */
  undo: Stroke[][];
}

interface ToolsState {
  /** Which tool is open, or null when the tools are closed. Survives moving between screens. */
  open: ToolTab | null;
  /** Phone sheet: half height or almost full screen. */
  full: boolean;
  expr: string;
  ans: number;
  history: { expr: string; value: number }[];
  /** One scratch sheet per question (or lecture section) of the current screen. */
  pages: Page[];
  toggle: (tab: ToolTab) => void;
  show: (tab: ToolTab) => void;
  close: () => void;
  setFull: (full: boolean) => void;
  setExpr: (expr: string) => void;
  pushResult: (expr: string, value: number) => void;
  clearHistory: () => void;
  resetPages: () => void;
  ensurePage: (key: string, label: string) => void;
  setStrokes: (key: string, strokes: Stroke[]) => void;
  undo: (key: string) => void;
}

/** State of the calculator and scratchpad. Kept in memory only: nothing here is saved between visits. */
export const useTools = create<ToolsState>()((set) => ({
  open: null,
  full: false,
  expr: '',
  ans: 0,
  history: [],
  pages: [],
  toggle: (tab) => set((s) => ({ open: s.open === tab ? null : tab })),
  show: (tab) => set({ open: tab }),
  close: () => set({ open: null }),
  setFull: (full) => set({ full }),
  setExpr: (expr) => set({ expr }),
  pushResult: (expr, value) => set((s) => ({ ans: value, history: [{ expr, value }, ...s.history].slice(0, 30) })),
  clearHistory: () => set({ history: [] }),
  resetPages: () => set({ pages: [] }),
  ensurePage: (key, label) =>
    set((s) => (s.pages.some((p) => p.key === key) ? s : { pages: [...s.pages, { key, label, strokes: [], undo: [] }] })),
  setStrokes: (key, strokes) =>
    set((s) => ({ pages: s.pages.map((p) => (p.key === key ? { ...p, strokes, undo: [...p.undo, p.strokes].slice(-60) } : p)) })),
  undo: (key) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.key === key && p.undo.length ? { ...p, strokes: p.undo[p.undo.length - 1], undo: p.undo.slice(0, -1) } : p)),
    })),
}));
