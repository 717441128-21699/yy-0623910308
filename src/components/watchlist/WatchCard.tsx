import { useState } from 'react';
import { Clock, User, MoreHorizontal, AlertTriangle, CheckCircle, ArrowUpRight, Pencil, Trash2, GitBranch, MessageSquare } from 'lucide-react';
import type { WatchItem, Priority, WatchStatus, SourceType } from '@/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface WatchCardProps {
  item: WatchItem;
}

const priorityConfig: Record<Priority, { label: string; color: string; dotColor: string }> = {
  high: { label: '高', color: 'text-rose-400', dotColor: 'bg-rose-400' },
  medium: { label: '中', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  low: { label: '低', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
};

const statusConfig: Record<WatchStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Clock }> = {
  pending: { label: '待处理', color: 'text-slate-300', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', icon: Clock },
  watching: { label: '观察中', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', icon: Clock },
  resolved: { label: '已解决', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', icon: CheckCircle },
  escalated: { label: '需升级', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30', icon: AlertTriangle },
};

const sourceTypeConfig: Record<SourceType, { label: string; icon: typeof GitBranch }> = {
  node: { label: '版本节点', icon: GitBranch },
  controversy: { label: '社区争议', icon: MessageSquare },
  manual: { label: '手动录入', icon: Clock },
};

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function WatchCard({ item }: WatchCardProps) {
  const priority = priorityConfig[item.priority];
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;
  const SourceIcon = sourceTypeConfig[item.sourceType].icon;

  const daysUntil = getDaysUntil(item.nextReviewDate);
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil >= 0 && daysUntil <= 2;
  const needsAttention = item.status !== 'resolved' && (isOverdue || isUrgent);

  const setEditingWatchItem = useAppStore((state) => state.setEditingWatchItem);
  const deleteWatchItem = useAppStore((state) => state.deleteWatchItem);
  const navigateToNodeFromWatch = useAppStore((state) => state.navigateToNodeFromWatch);

  const [showMenu, setShowMenu] = useState(false);

  const handleGoToSource = () => {
    if (item.relatedNodeId) {
      navigateToNodeFromWatch(item.relatedNodeId, item.id, item.title);
    }
  };

  const canGoToSource = item.relatedNodeId;

  return (
    <div
      className={cn(
        'bg-slate-800/80 border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 group flex flex-col',
        needsAttention ? 'border-amber-500/50 ring-1 ring-amber-500/20' :
        isOverdue && item.status !== 'resolved' ? 'border-rose-500/50 ring-1 ring-rose-500/20' :
        'border-slate-700/50 hover:border-slate-600/50'
      )}
    >
      <div className={cn('h-1 w-full', priority.dotColor)} />

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', priority.dotColor)} />
            <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 w-32 bg-slate-700 border border-slate-600/50 rounded-lg shadow-xl py-1">
                  <button
                    onClick={() => { setEditingWatchItem(item); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600/50 transition-colors"
                  >
                    <Pencil size={12} /> 编辑
                  </button>
                  <button
                    onClick={() => { deleteWatchItem(item.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-slate-600/50 transition-colors"
                  >
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={cn(
            'text-xs font-medium px-1.5 py-0.5 rounded border',
            status.bgColor,
            status.borderColor,
            status.color
          )}>
            <StatusIcon size={10} className="inline mr-0.5 -mt-0.5" />
            {status.label}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <SourceIcon size={10} />
            {sourceTypeConfig[item.sourceType].label}
          </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {item.description}
        </p>

        <div className="text-xs text-slate-500 mb-3 bg-slate-900/40 rounded-md p-2">
          <span className="text-slate-400">来源：</span>{item.sourceTitle}
        </div>

        {item.lastAction && (
          <div className="mb-3">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <MessageSquare size={10} />
              最近动作
              {item.lastActionDate && (
                <span className="text-slate-500 ml-1">· {item.lastActionDate}</span>
              )}
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">{item.lastAction}</p>
          </div>
        )}

        {item.nextStep && (
          <div className="mb-3">
            <div className="text-xs text-slate-500 mb-1">下一步</div>
            <p className="text-xs text-blue-300 line-clamp-1">{item.nextStep}</p>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-slate-300" />
            </div>
            <span className="text-xs text-slate-400">{item.assignee || '未指定'}</span>
          </div>

          <div className={cn(
            'flex items-center gap-1 text-xs',
            isOverdue && item.status !== 'resolved' ? 'text-rose-400' :
            isUrgent && item.status !== 'resolved' ? 'text-amber-400' :
            'text-slate-500'
          )}>
            <Clock size={12} />
            {isOverdue ? `逾期 ${Math.abs(daysUntil)} 天` :
             daysUntil === 0 ? '今天' :
             `${daysUntil} 天后`}
          </div>
        </div>

        {canGoToSource && (
          <button
            onClick={handleGoToSource}
            className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-blue-400 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-blue-500/30 transition-colors"
          >
            <ArrowUpRight size={12} />
            查看来源 → 波峰和评论
          </button>
        )}
      </div>
    </div>
  );
}
