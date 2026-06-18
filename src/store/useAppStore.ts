import { create } from 'zustand';
import type { WatchItem, Priority, WatchStatus, SourceType } from '../types';
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
  relatedControversyId?: string;
  sourceType?: SourceType;
  sourceTitle?: string;
  priority?: Priority;
}

interface BulkAddItem {
  title: string;
  description: string;
  relatedNodeId?: string;
  relatedControversyId?: string;
  sourceType: SourceType;
  sourceTitle: string;
  priority?: Priority;
}

interface AppState {
  currentView: 'dashboard' | 'nodes' | 'watchlist';
  selectedNodeId: string | null;
  selectedDate: string;
  watchItems: WatchItem[];
  showWatchModal: boolean;
  editingWatchItem: WatchItem | null;
  prefillData: PrefillData | null;
  watchlistViewMode: 'cards' | 'meeting' | 'closedloop';
  selectedControversyIds: Set<string>;
  showBulkAddToast: boolean;

  setCurrentView: (view: 'dashboard' | 'nodes' | 'watchlist') => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;

  addWatchItem: (item: Omit<WatchItem, 'id' | 'createdAt'>) => void;
  addWatchItemSafely: (item: BulkAddItem) => { added: boolean; existingId?: string };
  bulkAddWatchItems: (items: BulkAddItem[]) => { added: number; skipped: number };
  updateWatchItem: (id: string, updates: Partial<WatchItem>) => void;
  deleteWatchItem: (id: string) => void;
  setShowWatchModal: (show: boolean) => void;
  setEditingWatchItem: (item: WatchItem | null) => void;
  openWatchModalWithPrefill: (prefill: PrefillData) => void;
  setWatchlistViewMode: (mode: 'cards' | 'meeting' | 'closedloop') => void;

  toggleControversySelection: (id: string) => void;
  clearControversySelection: () => void;
  isControversySelected: (id: string) => boolean;
  setShowBulkAddToast: (show: boolean) => void;
}

function generateId(): string {
  return 'w-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultNextReview(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
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
  selectedControversyIds: new Set(),
  showBulkAddToast: false,

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

  addWatchItemSafely: (item) => {
    const existing = get().watchItems.find((w) =>
      (item.relatedNodeId && w.relatedNodeId === item.relatedNodeId) ||
      (item.relatedControversyId && w.relatedControversyId === item.relatedControversyId)
    );
    if (existing) {
      return { added: false, existingId: existing.id };
    }

    const newItem: WatchItem = {
      id: generateId(),
      createdAt: getTodayStr(),
      title: item.title,
      description: item.description,
      sourceUrl: '',
      priority: item.priority || 'medium',
      status: 'pending',
      assignee: '',
      nextReviewDate: getDefaultNextReview(),
      notes: '',
      relatedNodeId: item.relatedNodeId,
      relatedControversyId: item.relatedControversyId,
      sourceType: item.sourceType,
      sourceTitle: item.sourceTitle,
    };

    const newItems = [...get().watchItems, newItem];
    saveToStorage(newItems);
    set({ watchItems: newItems });
    return { added: true };
  },

  bulkAddWatchItems: (items) => {
    let added = 0;
    let skipped = 0;
    const existing = get().watchItems;
    const newItems: WatchItem[] = [];

    items.forEach((item) => {
      const duplicate = existing.find((w) =>
        (item.relatedNodeId && w.relatedNodeId === item.relatedNodeId) ||
        (item.relatedControversyId && w.relatedControversyId === item.relatedControversyId)
      );
      if (duplicate) {
        skipped++;
        return;
      }

      const alreadyInBatch = newItems.find((w) =>
        (item.relatedNodeId && w.relatedNodeId === item.relatedNodeId) ||
        (item.relatedControversyId && w.relatedControversyId === item.relatedControversyId)
      );
      if (alreadyInBatch) {
        skipped++;
        return;
      }

      newItems.push({
        id: generateId(),
        createdAt: getTodayStr(),
        title: item.title,
        description: item.description,
        sourceUrl: '',
        priority: item.priority || 'medium',
        status: 'pending',
        assignee: '',
        nextReviewDate: getDefaultNextReview(),
        notes: '',
        relatedNodeId: item.relatedNodeId,
        relatedControversyId: item.relatedControversyId,
        sourceType: item.sourceType,
        sourceTitle: item.sourceTitle,
      });
      added++;
    });

    if (newItems.length > 0) {
      const allItems = [...existing, ...newItems];
      saveToStorage(allItems);
      set({ watchItems: allItems, showBulkAddToast: true });
      setTimeout(() => set({ showBulkAddToast: false }), 3000);
    }

    return { added, skipped };
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

  toggleControversySelection: (id) => {
    const set_ = new Set(get().selectedControversyIds);
    if (set_.has(id)) {
      set_.delete(id);
    } else {
      set_.add(id);
    }
    set({ selectedControversyIds: set_ });
  },

  clearControversySelection: () => set({ selectedControversyIds: new Set() }),

  isControversySelected: (id) => get().selectedControversyIds.has(id),

  setShowBulkAddToast: (show) => set({ showBulkAddToast: show }),
}));
