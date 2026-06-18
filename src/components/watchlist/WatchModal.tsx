import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { WatchItem, Priority, WatchStatus } from '@/types';
import { cn } from '@/lib/utils';

interface WatchModalProps {
  isOpen: boolean;
  editingItem?: WatchItem | null;
  onClose: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: 'text-rose-400' },
  { value: 'medium', label: '中', color: 'text-amber-400' },
  { value: 'low', label: '低', color: 'text-emerald-400' },
];

const statuses: { value: WatchStatus; label: string }[] = [
  { value: 'watching', label: '观察中' },
  { value: 'escalated', label: '需升级' },
  { value: 'resolved', label: '已解决' },
];

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultNextReview(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

export function WatchModal() {
  const showWatchModal = useAppStore((state) => state.showWatchModal);
  const editingWatchItem = useAppStore((state) => state.editingWatchItem);
  const setShowWatchModal = useAppStore((state) => state.setShowWatchModal);
  const addWatchItem = useAppStore((state) => state.addWatchItem);
  const updateWatchItem = useAppStore((state) => state.updateWatchItem);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceUrl: '',
    priority: 'medium' as Priority,
    status: 'watching' as WatchStatus,
    assignee: '',
    nextReviewDate: getDefaultNextReview(),
    notes: '',
  });

  useEffect(() => {
    if (editingWatchItem) {
      setFormData({
        title: editingWatchItem.title,
        description: editingWatchItem.description,
        sourceUrl: editingWatchItem.sourceUrl,
        priority: editingWatchItem.priority,
        status: editingWatchItem.status,
        assignee: editingWatchItem.assignee,
        nextReviewDate: editingWatchItem.nextReviewDate,
        notes: editingWatchItem.notes,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        sourceUrl: '',
        priority: 'medium',
        status: 'watching',
        assignee: '',
        nextReviewDate: getDefaultNextReview(),
        notes: '',
      });
    }
  }, [editingWatchItem, showWatchModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingWatchItem) {
      updateWatchItem(editingWatchItem.id, formData);
    } else {
      addWatchItem(formData);
    }
  };

  const handleClose = () => {
    setShowWatchModal(false);
  };

  if (!showWatchModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-modal-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">
            {editingWatchItem ? '编辑观察项' : '新增观察项'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              标题 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="简要描述争议问题"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              详细描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="问题背景、当前影响、观察重点..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                优先级
              </label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.value })}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors',
                      formData.priority === p.value
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <span className={p.color}>●</span> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WatchStatus })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                责任人
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="姓名"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                下次查看时间
              </label>
              <input
                type="date"
                value={formData.nextReviewDate}
                onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              来源链接
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="跟进记录、行动计划..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-700/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {editingWatchItem ? '保存修改' : '添加观察'}
          </button>
        </div>
      </div>
    </div>
  );
}
