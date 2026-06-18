import { useState, useMemo } from 'react';
import { Clock, User, AlertTriangle, CheckCircle, ArrowUpRight, Pencil, GitBranch, MessageSquare, ChevronDown, ChevronRight, Square, CheckSquare, Filter, X } from 'lucide-react';
import type { WatchItem, WatchStatus, SourceType, Priority, ActionRecord } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const priorityConfig: Record<Priority, { label: string; color: string; dotColor: string }> = {
  high: { label: '高', color: 'text-rose-400', dotColor: 'bg-rose-400' },
  medium: { label: '中', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  low: { label: '低', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
};

const sourceTypeConfig: Record<SourceType, { label: string; icon: typeof GitBranch }> = {
  node: { label: '版本节点', icon: GitBranch },
  controversy: { label: '社区争议', icon: MessageSquare },
  manual: { label: '手动录入', icon: Clock },
};

const statusDotConfig: Record<WatchStatus, { color: string; bgColor: string }> = {
  pending: { color: 'bg-slate-400', bgColor: 'bg-slate-400' },
  watching: { color: 'bg-blue-400', bgColor: 'bg-blue-400' },
  escalated: { color: 'bg-rose-400', bgColor: 'bg-rose-400' },
  resolved: { color: 'bg-emerald-400', bgColor: 'bg-emerald-400' },
};

const statusGroups: { key: WatchStatus; label: string; description: string; icon: typeof Clock; color: string; bgColor: string }[] = [
  { key: 'pending', label: '待处理', description: '刚加入，还没确定跟进方案', icon: Clock, color: 'text-slate-300', bgColor: 'bg-slate-500/10' },
  { key: 'watching', label: '跟进中', description: '已指定责任人，持续观察中', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { key: 'escalated', label: '需升级', description: '问题超出当前层级，需要协调更多资源', icon: AlertTriangle, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  { key: 'resolved', label: '已解决', description: '风险已消除或不再需要跟进', icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
];

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

interface TimelineProps {
  timeline: ActionRecord[];
}

function ActionTimeline({ timeline }: TimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="ml-5 pl-4 border-l-2 border-slate-700/50 space-y-2 py-1">
      {timeline.map((record, idx) => {
        const dotConfig = statusDotConfig[record.status];
        return (
          <div key={idx} className="relative flex items-start gap-2">
            <div className={cn(
              'absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-800',
              dotConfig.color
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">{record.action}</span>
              </div>
              <span className="text-[10px] text-slate-500">{formatDate(record.date)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ItemRowProps {
  item: WatchItem;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

function ItemRow({ item, selected, onToggleSelect }: ItemRowProps) {
  const priority = priorityConfig[item.priority];
  const SourceIcon = sourceTypeConfig[item.sourceType].icon;
  const setEditingWatchItem = useAppStore((state) => state.setEditingWatchItem);
  const navigateToNodeFromWatch = useAppStore((state) => state.navigateToNodeFromWatch);

  const daysUntil = getDaysUntil(item.nextReviewDate);
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil >= 0 && daysUntil <= 2;
  const needsAttention = item.status !== 'resolved' && (isOverdue || isUrgent);

  const [expanded, setExpanded] = useState(false);

  const handleGoToSource = () => {
    if (item.relatedNodeId) {
      navigateToNodeFromWatch(item.relatedNodeId, item.id, item.title);
    }
  };

  return (
    <div className={cn(
      'group bg-slate-800/50 hover:bg-slate-800 border-b border-slate-700/30 px-4 py-3 transition-colors',
      needsAttention && 'bg-amber-500/5',
      selected && 'bg-blue-500/10 ring-1 ring-blue-500/30'
    )}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleSelect(item.id)}
          className="p-0.5 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
        >
          {selected ? <CheckSquare size={15} className="text-blue-400" /> : <Square size={15} />}
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', priority.dotColor)} />
          <span className="text-sm text-white truncate">{item.title}</span>
          <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
            <SourceIcon size={10} />
            {sourceTypeConfig[item.sourceType].label}
          </span>
        </div>

        <div className="flex items-center gap-3 w-[500px] flex-shrink-0">
          <div className="text-xs text-slate-400 w-40 truncate" title={item.sourceTitle}>
            {item.sourceTitle}
          </div>
          <div className="text-xs text-slate-400 w-20 truncate">
            {item.assignee || '未指定'}
          </div>
          <div className={cn(
            'text-xs w-24 tabular-nums',
            isOverdue && item.status !== 'resolved' ? 'text-rose-400' :
            isUrgent && item.status !== 'resolved' ? 'text-amber-400' :
            'text-slate-400'
          )}>
            {isOverdue ? `逾期 ${Math.abs(daysUntil)} 天` :
             daysUntil === 0 ? '今天到期' :
             `${daysUntil} 天后`}
          </div>
          <div className="text-xs text-slate-400 w-48 truncate">
            {item.lastAction || '—'}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {item.relatedNodeId && (
            <button
              onClick={handleGoToSource}
              className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="查看节点波峰和评论"
            >
              <ArrowUpRight size={13} />
            </button>
          )}
          <button
            onClick={() => setEditingWatchItem(item)}
            className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-colors opacity-0 group-hover:opacity-100"
            title="编辑"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      {item.nextStep && item.status !== 'resolved' && !expanded && (
        <div className="mt-1 ml-[52px] pl-3 border-l border-slate-600/30">
          <p className="text-xs text-blue-300">
            <span className="text-slate-500">下一步：</span>{item.nextStep}
          </p>
        </div>
      )}

      {expanded && (
        <div className="mt-3 ml-[52px]">
          {item.nextStep && item.status !== 'resolved' && (
            <div className="mb-3 pl-3 border-l border-blue-500/30">
              <p className="text-xs text-blue-300">
                <span className="text-slate-500">下一步：</span>{item.nextStep}
              </p>
            </div>
          )}
          <ActionTimeline timeline={item.actionTimeline || []} />
        </div>
      )}
    </div>
  );
}

type StatusFilter = 'all' | WatchStatus;
type AssigneeFilter = 'all' | string;
type OverdueFilter = 'all' | 'overdue' | 'urgent' | 'ok';

export function ClosedLoopView() {
  const watchItems = useAppStore((state) => state.watchItems);
  const bulkUpdateWatchItems = useAppStore((state) => state.bulkUpdateWatchItems);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  const [overdueFilter, setOverdueFilter] = useState<OverdueFilter>('all');

  const assignees = useMemo(() => {
    const set = new Set<string>();
    watchItems.forEach((i) => i.assignee && set.add(i.assignee));
    return Array.from(set).sort();
  }, [watchItems]);

  const filteredItems = useMemo(() => {
    return watchItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (assigneeFilter !== 'all' && item.assignee !== assigneeFilter) return false;
      if (overdueFilter !== 'all') {
        const days = getDaysUntil(item.nextReviewDate);
        if (item.status === 'resolved') return false;
        if (overdueFilter === 'overdue' && !(days < 0)) return false;
        if (overdueFilter === 'urgent' && !(days >= 0 && days <= 2)) return false;
        if (overdueFilter === 'ok' && !(days > 2)) return false;
      }
      return true;
    });
  }, [watchItems, statusFilter, assigneeFilter, overdueFilter]);

  const grouped = statusGroups.map((group) => ({
    ...group,
    items: filteredItems.filter((item) => item.status === group.key),
  }));

  const totalActive = watchItems.filter((i) => i.status !== 'resolved').length;
  const totalResolved = watchItems.filter((i) => i.status === 'resolved').length;

  const hasFilters = statusFilter !== 'all' || assigneeFilter !== 'all' || overdueFilter !== 'all';

  const visibleFilteredIds = new Set(filteredItems.map((i) => i.id));
  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedIds.has(i.id));

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAllVisible = () => {
    const next = new Set(selectedIds);
    if (allVisibleSelected) {
      filteredItems.forEach((i) => next.delete(i.id));
    } else {
      filteredItems.forEach((i) => next.add(i.id));
    }
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatus = (status: WatchStatus, actionLabel: string) => {
    if (selectedIds.size === 0) return;
    bulkUpdateWatchItems(Array.from(selectedIds), { status, lastAction: `批量操作：${actionLabel}` });
    clearSelection();
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statusGroups.map((group) => {
          const count = watchItems.filter((i) => i.status === group.key).length;
          const GroupIcon = group.icon;
          return (
            <div
              key={group.key}
              className={cn('bg-slate-800/60 border rounded-xl p-4', group.bgColor, 'border-slate-700/50')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GroupIcon size={16} className={group.color} />
                  <span className="text-sm text-slate-300">{group.label}</span>
                </div>
                <span className="text-2xl font-bold text-white tabular-nums">{count}</span>
              </div>
              <p className="text-xs text-slate-500">{group.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter size={12} />
          筛选：
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-2.5 py-1.5 text-xs bg-slate-800/80 border border-slate-700/50 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">全部状态</option>
          {statusGroups.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value as AssigneeFilter)}
          className="px-2.5 py-1.5 text-xs bg-slate-800/80 border border-slate-700/50 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">全部责任人</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={overdueFilter}
          onChange={(e) => setOverdueFilter(e.target.value as OverdueFilter)}
          className="px-2.5 py-1.5 text-xs bg-slate-800/80 border border-slate-700/50 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">全部到期状态</option>
          <option value="overdue">已逾期</option>
          <option value="urgent">2天内到期</option>
          <option value="ok">3天以上到期</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setStatusFilter('all'); setAssigneeFilter('all'); setOverdueFilter('all'); }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-md transition-colors"
          >
            <X size={11} />
            清除筛选
          </button>
        )}

        <div className="ml-auto text-xs text-slate-500">
          显示 {filteredItems.length} / {watchItems.length} 项
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex flex-wrap items-center gap-3">
          <span className="text-sm text-blue-300 font-medium">
            已选择 {selectedIds.size} 项
          </span>
          <div className="h-4 w-px bg-slate-600/50" />
          <span className="text-xs text-slate-400">批量操作：</span>
          <button
            onClick={() => handleBulkStatus('watching', '批量标记为跟进中')}
            className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            改为跟进中
          </button>
          <button
            onClick={() => handleBulkStatus('escalated', '批量升级处理')}
            className="px-3 py-1 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors"
          >
            需升级
          </button>
          <button
            onClick={() => handleBulkStatus('resolved', '批量标记为已解决')}
            className="px-3 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
          >
            已解决
          </button>
          <button
            onClick={() => handleBulkStatus('pending', '批量标为待处理')}
            className="px-3 py-1 text-xs text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors"
          >
            待处理
          </button>
          <button
            onClick={clearSelection}
            className="ml-auto px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            取消选择
          </button>
        </div>
      )}

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAllVisible}
              className="p-0.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {allVisibleSelected ? <CheckSquare size={15} className="text-blue-400" /> : <Square size={15} />}
            </button>
            <span className="w-5 flex-shrink-0 text-xs text-slate-500">展开</span>
            <div className="flex-1 text-xs text-slate-400 font-medium">事项</div>
            <div className="flex items-center gap-3 w-[500px] flex-shrink-0">
              <span className="text-xs text-slate-400 font-medium w-40">来源</span>
              <span className="text-xs text-slate-400 font-medium w-20">责任人</span>
              <span className="text-xs text-slate-400 font-medium w-24">查看时间</span>
              <span className="text-xs text-slate-400 font-medium w-48">最近动作</span>
            </div>
            <span className="w-16 flex-shrink-0" />
          </div>
        </div>

        {grouped.map((group) => (
          group.items.length > 0 && (
            <div key={group.key} className="border-t border-slate-700/30 first:border-t-0">
              <div className={cn('px-4 py-2 flex items-center gap-2', group.bgColor)}>
                <group.icon size={12} className={group.color} />
                <span className={cn('text-xs font-medium', group.color)}>{group.label}</span>
                <span className="text-xs text-slate-500">({group.items.length})</span>
              </div>
              {group.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          )
        ))}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">
            {hasFilters ? '没有符合筛选条件的观察项' : '暂无观察项，点击右上角「新增观察」添加'}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>共 {watchItems.length} 项，进行中 {totalActive} 项，已解决 {totalResolved} 项</span>
        <span>点击行首箭头展开处理时间线，勾选后可批量操作</span>
      </div>
    </div>
  );
}
