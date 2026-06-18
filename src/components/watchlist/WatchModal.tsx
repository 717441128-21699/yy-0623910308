import { useState, useEffect } from 'react';
import { X, ExternalLink, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { WatchItem, Priority, WatchStatus, SourceType } from '@/types';
import { getNodeById } from '@/data/mockData';
import { cn } from '@/lib/utils';

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: 'text-rose-400' },
  { value: 'medium', label: '中', color: 'text-amber-400' },
  { value: 'low', label: '低', color: 'text-emerald-400' },
];

const statuses: { value: WatchStatus; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'watching', label: '观察中' },
  { value: 'escalated', label: '需升级' },
  { value: 'resolved', label: '已解决' },
];

const sourceTypeLabels: Record<SourceType, string> = {
  node: '版本节点',
  controversy: '争议点',
  manual: '手动录入',
};

function getDefaultNextReview(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

interface FormData {
  title: string;
  description: string;
  sourceUrl: string;
  priority: Priority;
  status: WatchStatus;
  assignee: string;
  nextReviewDate: string;
  notes: string;
  relatedNodeId: string;
  relatedControversyId: string;
  sourceType: SourceType;
  sourceTitle: string;
  lastAction: string;
  lastActionDate: string;
  nextStep: string;
}

export function WatchModal() {
  const showWatchModal = useAppStore((state) => state.showWatchModal);
  const editingWatchItem = useAppStore((state) => state.editingWatchItem);
  const prefillData = useAppStore((state) => state.prefillData);
  const setShowWatchModal = useAppStore((state) => state.setShowWatchModal);
  const addWatchItem = useAppStore((state) => state.addWatchItem);
  const updateWatchItem = useAppStore((state) => state.updateWatchItem);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    sourceUrl: '',
    priority: 'medium',
    status: 'pending',
    assignee: '',
    nextReviewDate: getDefaultNextReview(),
    notes: '',
    relatedNodeId: '',
    relatedControversyId: '',
    sourceType: 'manual',
    sourceTitle: '手动录入',
    lastAction: '',
    lastActionDate: '',
    nextStep: '',
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
        relatedNodeId: editingWatchItem.relatedNodeId || '',
        relatedControversyId: editingWatchItem.relatedControversyId || '',
        sourceType: editingWatchItem.sourceType,
        sourceTitle: editingWatchItem.sourceTitle,
        lastAction: editingWatchItem.lastAction || '',
        lastActionDate: editingWatchItem.lastActionDate || '',
        nextStep: editingWatchItem.nextStep || '',
      });
    } else if (prefillData) {
      setFormData({
        title: prefillData.title,
        description: prefillData.description,
        sourceUrl: '',
        priority: prefillData.priority || (prefillData.relatedNodeId ? 'high' : 'medium'),
        status: 'pending',
        assignee: '',
        nextReviewDate: getDefaultNextReview(),
        notes: '',
        relatedNodeId: prefillData.relatedNodeId || '',
        relatedControversyId: prefillData.relatedControversyId || '',
        sourceType: prefillData.sourceType || (prefillData.relatedNodeId ? 'node' : prefillData.relatedControversyId ? 'controversy' : 'manual'),
        sourceTitle: prefillData.sourceTitle || '手动录入',
        lastAction: '',
        lastActionDate: '',
        nextStep: '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        sourceUrl: '',
        priority: 'medium',
        status: 'pending',
        assignee: '',
        nextReviewDate: getDefaultNextReview(),
        notes: '',
        relatedNodeId: '',
        relatedControversyId: '',
        sourceType: 'manual',
        sourceTitle: '手动录入',
        lastAction: '',
        lastActionDate: '',
        nextStep: '',
      });
    }
  }, [editingWatchItem, prefillData, showWatchModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const itemData: Omit<WatchItem, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      sourceUrl: formData.sourceUrl,
      priority: formData.priority,
      status: formData.status,
      assignee: formData.assignee,
      nextReviewDate: formData.nextReviewDate,
      notes: formData.notes,
      relatedNodeId: formData.relatedNodeId || undefined,
      relatedControversyId: formData.relatedControversyId || undefined,
      sourceType: formData.sourceType,
      sourceTitle: formData.sourceTitle,
      lastAction: formData.lastAction || undefined,
      lastActionDate: formData.lastActionDate || undefined,
      nextStep: formData.nextStep || undefined,
    };

    if (editingWatchItem) {
      updateWatchItem(editingWatchItem.id, itemData);
    } else {
      addWatchItem(itemData);
    }
  };

  const handleClose = () => {
    setShowWatchModal(false);
  };

  const handleGoToNode = () => {
    if (formData.relatedNodeId) {
      handleClose();
      setSelectedNodeId(formData.relatedNodeId);
      setCurrentView('nodes');
    }
  };

  const relatedNode = formData.relatedNodeId ? getNodeById(formData.relatedNodeId) : null;

  if (!showWatchModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl animate-modal-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 sticky top-0 bg-slate-800 z-10">
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

        {(relatedNode || formData.relatedControversyId) && (
          <div className="mx-5 mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink size={14} className="text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">
                  {formData.sourceType === 'node' ? '关联节点' : '关联争议'}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">{sourceTypeLabels[formData.sourceType]}</span>
              </div>
              {relatedNode && (
                <button
                  type="button"
                  onClick={handleGoToNode}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  前往查看
                </button>
              )}
            </div>
            <p className="text-sm text-white mt-1">{formData.sourceTitle}</p>
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                来源类型
              </label>
              <div className="text-xs text-slate-400 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2">
                {sourceTypeLabels[formData.sourceType]}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                来源标题
              </label>
              <div className="text-xs text-slate-400 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2">
                {formData.sourceTitle}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
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
              <MessageSquare size={12} className="inline mr-1" />
              最近一次处理动作
            </label>
            <textarea
              value={formData.lastAction}
              onChange={(e) => setFormData({ ...formData, lastAction: e.target.value })}
              placeholder="已做过什么处理、结论如何..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                动作日期
              </label>
              <input
                type="date"
                value={formData.lastActionDate}
                onChange={(e) => setFormData({ ...formData, lastActionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                下一步结论
              </label>
              <input
                type="text"
                value={formData.nextStep}
                onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
                placeholder="接下来要做什么"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50 sticky bottom-0 bg-slate-800 -mx-5 -mb-5 px-5 py-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              {editingWatchItem ? '保存修改' : '添加观察'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
