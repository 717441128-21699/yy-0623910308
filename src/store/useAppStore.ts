import { create } from 'zustand';
import type { WatchItem, Priority, WatchStatus } from '../types';
import { watchItems as initialWatchItems } from '../data/mockData';

const STORAGE_KEY = 'pulse_watch_items';

function loadFromStorage(): WatchItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return initialWatchItems;
}

function saveToStorage(items: WatchItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

interface PrefillData {
  title: string;
  description: string;
  relatedNodeId?: string;
}

interface AppState {
  currentView: 'dashboard' | 'nodes' | 'watchlist';
  selectedNodeId: string | null;
  selectedDate: string;
  watchItems: WatchItem[];
  showWatchModal: boolean;
  editingWatchItem: WatchItem | null;
  prefillData: PrefillData | null;
  watchlistViewMode: 'cards' | 'meeting';

  setCurrentView: (view: 'dashboard' | 'nodes' | 'watchlist') => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;

  addWatchItem: (item: Omit<WatchItem, 'id' | 'createdAt'>) => void;
  updateWatchItem: (id: string, updates: Partial<WatchItem>) => void;
  deleteWatchItem: (id: string) => void;
  setShowWatchModal: (show: boolean) => void;
  setEditingWatchItem: (item: WatchItem | null) => void;
  openWatchModalWithPrefill: (prefill: PrefillData) => void;
  setWatchlistViewMode: (mode: 'cards' | 'meeting') => void;
}

function generateId(): string {
  return 'w-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  selectedNodeId: null,
  selectedDate: getTodayStr(),
  watchItems: loadFromStorage(),
  showWatchModal: false,
  editingWatchItem: null,
  prefillData: null,
  watchlistViewMode: 'cards',

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  addWatchItem: (item) => {
    const newItems = [
      ...get().watchItems,
      { ...item, id: generateId(), createdAt: getTodayStr() },
    ];
    saveToStorage(newItems);
    set({
      watchItems: newItems,
      showWatchModal: false,
      editingWatchItem: null,
      prefillData: null,
    });
  },

  updateWatchItem: (id, updates) => {
    const newItems = get().watchItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    saveToStorage(newItems);
    set({
      watchItems: newItems,
      showWatchModal: false,
      editingWatchItem: null,
      prefillData: null,
    });
  },

  deleteWatchItem: (id) => {
    const newItems = get().watchItems.filter((item) => item.id !== id);
    saveToStorage(newItems);
    set({ watchItems: newItems });
  },

  setShowWatchModal: (show) => set({ showWatchModal: show, editingWatchItem: null, prefillData: null }),

  setEditingWatchItem: (item) => set({ editingWatchItem: item, showWatchModal: item !== null, prefillData: null }),

  openWatchModalWithPrefill: (prefill) => set({
    showWatchModal: true,
    editingWatchItem: null,
    prefillData: prefill,
  }),

  setWatchlistViewMode: (mode) => set({ watchlistViewMode: mode }),
}));
