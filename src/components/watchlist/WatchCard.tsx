import { useState } from 'react';
import { Clock, User, MoreHorizontal, AlertTriangle, CheckCircle, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import type { WatchItem, Priority, WatchStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface WatchCardProps {
  item: WatchItem;
}

const priorityConfig: Record<Priority, { label: string; color: string; dotColor: string }> = {
  high: { label: '高优先级', color: 'text-rose-400', dotColor: 'bg-rose-400' },
  medium: { label: '中优先级', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  low: { label: '低优先级', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
};

const statusConfig: Record<WatchStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Clock }> = {
  watching: { label: '观察中', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', icon: Clock },
  resolved: { label: '已解决', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', icon: CheckCircle },
  escalated: { label: '需升级', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30', icon: AlertTriangle },
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

  const daysUntil = getDaysUntil(item.nextReviewDate);
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil >= 0 && daysUntil <= 2;

  const setEditingWatchItem = useAppStore((state) => state.setEditingWatchItem);
  const deleteWatchItem = useAppStore((state) => state.deleteWatchItem);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

  const [showMenu, setShowMenu] = useState(false);

  const handleGoToNode = () => {
    if (item.relatedNodeId) {
      setSelectedNodeId(item.relatedNodeId);
      setCurrentView('nodes');
    }
  };

  return (
    <div
      className={cn(
        'bg-slate-800/80 border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 group',
        isUrgent && !isOverdue && item.status === 'watching' ? 'border-amber-500/50 ring-1 ring-amber-500/20' :
        isOverdue && item.status === 'watching' ? 'border-rose-500/50 ring-1 ring-rose-500/20' :
        'border-slate-700/50 hover:border-slate-600/50'
      )}
    >
      <div className={cn('h-1 w-full', priority.dotColor)} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              priority.dotColor
            )} />
            <h3 className="text-sm font-semibold text-white truncate">
              {item.title}
            </h3>
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

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded border',
            status.bgColor,
            status.borderColor,
            status.color
          )}>
            <StatusIcon size={10} className="inline mr-1 -mt-0.5" />
            {status.label}
          </span>
          <span className={cn('text-xs', priority.color)}>
            {priority.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-slate-300" />
            </div>
            <span className="text-xs text-slate-400">{item.assignee || '未指定'}</span>
          </div>

          <div className={cn(
            'flex items-center gap-1 text-xs',
            isOverdue ? 'text-rose-400' :
            isUrgent ? 'text-amber-400' :
            'text-slate-500'
          )}>
            <Clock size={12} />
            {isOverdue ? `逾期 ${Math.abs(daysUntil)} 天` :
             daysUntil === 0 ? '今天' :
             `${daysUntil} 天后`}
          </div>
        </div>

        {item.relatedNodeId && (
          <button
            onClick={handleGoToNode}
            className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-blue-400 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-blue-500/30 transition-colors"
          >
            <ArrowUpRight size={12} />
            查看相关节点
          </button>
        )}
      </div>
    </div>
  );
}
