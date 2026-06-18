import { create } from 'zustand';
import type { WatchItem, Priority, WatchStatus } from '../types';
import { watchItems as initialWatchItems } from '../data/mockData';

interface AppState {
  currentView: 'dashboard' | 'nodes' | 'watchlist';
  selectedNodeId: string | null;
  selectedDate: string;
  watchItems: WatchItem[];
  showWatchModal: boolean;
  editingWatchItem: WatchItem | null;

  setCurrentView: (view: 'dashboard' | 'nodes' | 'watchlist') => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;

  addWatchItem: (item: Omit<WatchItem, 'id' | 'createdAt'>) => void;
  updateWatchItem: (id: string, updates: Partial<WatchItem>) => void;
  deleteWatchItem: (id: string) => void;
  setShowWatchModal: (show: boolean) => void;
  setEditingWatchItem: (item: WatchItem | null) => void;
}

function generateId(): string {
  return 'w-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  selectedNodeId: null,
  selectedDate: getTodayStr(),
  watchItems: initialWatchItems,
  showWatchModal: false,
  editingWatchItem: null,

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  addWatchItem: (item) =>
    set((state) => ({
      watchItems: [
        ...state.watchItems,
        {
          ...item,
          id: generateId(),
          createdAt: getTodayStr(),
        },
      ],
      showWatchModal: false,
      editingWatchItem: null,
    })),

  updateWatchItem: (id, updates) =>
    set((state) => ({
      watchItems: state.watchItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
      showWatchModal: false,
      editingWatchItem: null,
    })),

  deleteWatchItem: (id) =>
    set((state) => ({
      watchItems: state.watchItems.filter((item) => item.id !== id),
    })),

  setShowWatchModal: (show) => set({ showWatchModal: show, editingWatchItem: null }),
  setEditingWatchItem: (item) => set({ editingWatchItem: item, showWatchModal: item !== null }),
}));
