import { create } from 'zustand';
import type { WatchItem, Priority, WatchStatus, SourceType, ActionRecord } from '../types';
import { watchItems as initialWatchItems } from '../data/mockData';

const STORAGE_KEY = 'pulse_watch_items';

function migrateItem(item: any): WatchItem {
  return {
    id: item.id || '',
    title: item.title || '',
    description: item.description || '',
    sourceUrl: item.sourceUrl || '',
    priority: item.priority || 'medium',
    status: item.status || 'pending',
    assignee: item.assignee || '',
    nextReviewDate: item.nextReviewDate || getDefaultNextReview(),
    createdAt: item.createdAt || getTodayStr(),
    notes: item.notes || '',
    relatedNodeId: item.relatedNodeId || undefined,
    relatedControversyId: item.relatedControversyId || undefined,
    sourceType: item.sourceType || (item.relatedNodeId ? 'node' : item.relatedControversyId ? 'controversy' : 'manual'),
    sourceTitle: item.sourceTitle || item.title || '手动录入',
    lastAction: item.lastAction || undefined,
    lastActionDate: item.lastActionDate || undefined,
    nextStep: item.nextStep || undefined,
    actionTimeline: item.actionTimeline || buildInitialTimeline(item),
  };
}

function buildInitialTimeline(item: any): ActionRecord[] {
  const timeline: ActionRecord[] = [];
  if (item.createdAt) {
    timeline.push({ date: item.createdAt, action: '创建观察项', status: item.status || 'pending' });
  }
  if (item.lastAction && item.lastActionDate) {
    timeline.push({ date: item.lastActionDate, action: item.lastAction, status: item.status || 'watching' });
  }
  return timeline;
}

function loadFromStorage(): WatchItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const migrated = parsed.map(migrateItem);
        const needsSave = JSON.stringify(parsed) !== JSON.stringify(migrated);
        if (needsSave) {
          saveToStorage(migrated);
        }
        return migrated;
      }
    }
  } catch {
    // ignore parse errors
  }
  return initialWatchItems.map(migrateItem);
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

interface SourceWatchItem {
  id: string;
  title: string;
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
  sourceWatchItem: SourceWatchItem | null;

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

  setSourceWatchItem: (item: SourceWatchItem | null) => void;
  navigateToNodeFromWatch: (nodeId: string, watchItemId: string, watchItemTitle: string) => void;
  selectNodeManually: (id: string | null) => void;

  bulkUpdateWatchItems: (ids: string[], updates: { status?: WatchStatus; assignee?: string; lastAction?: string }) => number;
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
  sourceWatchItem: null,

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  addWatchItem: (item) => {
    const today = getTodayStr();
    const timeline: ActionRecord[] = [
      { date: today, action: '创建观察项', status: item.status },
    ];
    const newItems = [
      ...get().watchItems,
      { ...item, id: generateId(), createdAt: today, actionTimeline: timeline },
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

    const today = getTodayStr();
    const newItem: WatchItem = {
      id: generateId(),
      createdAt: today,
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
      actionTimeline: [{ date: today, action: '创建观察项', status: 'pending' }],
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
    const today = getTodayStr();

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
        createdAt: today,
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
        actionTimeline: [{ date: today, action: '创建观察项', status: 'pending' }],
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
    const newItems = get().watchItems.map((item) => {
      if (item.id !== id) return item;

      const updated = { ...item, ...updates };

      if (updates.lastAction !== undefined && updates.lastAction !== item.lastAction) {
        const newRecord: ActionRecord = {
          date: updates.lastActionDate || getTodayStr(),
          action: updates.lastAction,
          status: updates.status || item.status,
        };
        updated.actionTimeline = [...(item.actionTimeline || []), newRecord];
      } else if (updates.status && updates.status !== item.status && !updates.lastAction) {
        const statusLabels: Record<WatchStatus, string> = {
          pending: '标记为待处理',
          watching: '开始跟进',
          escalated: '升级处理',
          resolved: '标记为已解决',
        };
        const newRecord: ActionRecord = {
          date: getTodayStr(),
          action: statusLabels[updates.status],
          status: updates.status,
        };
        updated.actionTimeline = [...(item.actionTimeline || []), newRecord];
      }

      return updated;
    });
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

  setSourceWatchItem: (item) => set({ sourceWatchItem: item }),

  navigateToNodeFromWatch: (nodeId, watchItemId, watchItemTitle) => {
    set({
      selectedNodeId: nodeId,
      currentView: 'nodes',
      sourceWatchItem: { id: watchItemId, title: watchItemTitle },
    });
  },

  selectNodeManually: (id) => {
    set({ selectedNodeId: id, sourceWatchItem: null });
  },

  bulkUpdateWatchItems: (ids, updates) => {
    if (ids.length === 0) return 0;
    const today = getTodayStr();
    const statusLabels: Record<WatchStatus, string> = {
      pending: '标记为待处理',
      watching: '开始跟进',
      escalated: '升级处理',
      resolved: '标记为已解决',
    };

    let updatedCount = 0;
    const newItems = get().watchItems.map((item) => {
      if (!ids.includes(item.id)) return item;

      const updated: WatchItem = { ...item, ...updates };
      const newRecords: ActionRecord[] = [];

      if (updates.lastAction) {
        newRecords.push({
          date: today,
          action: updates.lastAction,
          status: updates.status || item.status,
        });
      }

      if (updates.status && updates.status !== item.status) {
        const existingFromStatus = newRecords.find((r) => r.action === statusLabels[updates.status!]);
        if (!existingFromStatus && !updates.lastAction) {
          newRecords.push({
            date: today,
            action: statusLabels[updates.status],
            status: updates.status,
          });
        }
      }

      if (newRecords.length > 0) {
        updated.actionTimeline = [...(item.actionTimeline || []), ...newRecords];
        updatedCount++;
      }

      return updated;
    });

    if (updatedCount > 0) {
      saveToStorage(newItems);
      set({ watchItems: newItems });
    }
    return updatedCount;
  },
}));
