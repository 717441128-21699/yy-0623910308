import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, Eye, Check, CheckSquare, Square, ListPlus } from 'lucide-react';
import type { Controversy } from '@/types';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface ControversyListProps {
  items: Controversy[];
  maxItems?: number;
}

const sentimentConfig = {
  positive: { label: '正面', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  neutral: { label: '中性', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  negative: { label: '负面', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const trendConfig = {
  rising: { icon: TrendingUp, color: 'text-rose-400' },
  stable: { icon: Minus, color: 'text-slate-400' },
  falling: { icon: TrendingDown, color: 'text-emerald-400' },
};

export function ControversyList({ items, maxItems }: ControversyListProps) {
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const openWatchModalWithPrefill = useAppStore((state) => state.openWatchModalWithPrefill);
  const toggleControversySelection = useAppStore((state) => state.toggleControversySelection);
  const clearControversySelection = useAppStore((state) => state.clearControversySelection);
  const isControversySelected = useAppStore((state) => state.isControversySelected);
  const bulkAddWatchItems = useAppStore((state) => state.bulkAddWatchItems);
  const selectedControversyIds = useAppStore((state) => state.selectedControversyIds);
  const watchItems = useAppStore((state) => state.watchItems);

  const [bulkToast, setBulkToast] = useState<{ show: boolean; added: number; skipped: number } | null>(null);

  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const maxHeat = Math.max(...items.map((i) => i.heat));
  const hasSelection = selectedControversyIds.size > 0;

  const isAlreadyWatched = (controversy: Controversy) => {
    return watchItems.some((w) =>
      (controversy.relatedNodeId && w.relatedNodeId === controversy.relatedNodeId) ||
      w.relatedControversyId === controversy.id
    );
  };

  const handleGoToNode = (item: Controversy) => {
    if (item.relatedNodeId) {
      setSelectedNodeId(item.relatedNodeId);
      setCurrentView('nodes');
    }
  };

  const handleAddToWatch = (e: React.MouseEvent, item: Controversy) => {
    e.stopPropagation();
    openWatchModalWithPrefill({
      title: `跟进: ${item.title}`,
      description: item.summary + (item.trend === 'rising' ? '（趋势上升中）' : item.trend === 'falling' ? '（趋势回落中）' : '（趋势平稳）'),
      relatedNodeId: item.relatedNodeId,
      relatedControversyId: item.id,
      sourceType: 'controversy',
      sourceTitle: item.title,
      priority: item.sentiment === 'negative' && item.trend === 'rising' ? 'high' : 'medium',
    });
  };

  const handleBulkAdd = () => {
    const itemsToAdd = displayItems
      .filter((item) => selectedControversyIds.has(item.id))
      .map((item) => ({
        title: `跟进: ${item.title}`,
        description: item.summary + (item.trend === 'rising' ? '（趋势上升中）' : item.trend === 'falling' ? '（趋势回落中）' : '（趋势平稳）'),
        relatedNodeId: item.relatedNodeId,
        relatedControversyId: item.id,
        sourceType: 'controversy' as const,
        sourceTitle: item.title,
        priority: item.sentiment === 'negative' && item.trend === 'rising' ? 'high' as const : 'medium' as const,
      }));

    const result = bulkAddWatchItems(itemsToAdd);
    clearControversySelection();
    setBulkToast({ ...result, show: true });
    setTimeout(() => setBulkToast(null), 3000);
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>核心争议点</Card.Title>
          {hasSelection && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
              已选 {selectedControversyIds.size} 项
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <>
              <button
                onClick={clearControversySelection}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBulkAdd}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
              >
                <ListPlus size={12} />
                批量加入观察
              </button>
            </>
          )}
          {!hasSelection && (
            <span className="text-xs text-slate-500">按热度排序</span>
          )}
        </div>
      </Card.Header>

      {bulkToast && (
        <div className="mb-3 mx-5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400">
            已添加 {bulkToast.added} 项
            {bulkToast.skipped > 0 && <span className="text-slate-400">，跳过 {bulkToast.skipped} 项（已存在）</span>}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {displayItems.map((item) => {
          const sentiment = sentimentConfig[item.sentiment];
          const TrendIcon = trendConfig[item.trend].icon;
          const heatPercent = (item.heat / maxHeat) * 100;
          const isSelected = isControversySelected(item.id);
          const watched = isAlreadyWatched(item);

          return (
            <div
              key={item.id}
              className={cn(
                'p-3 rounded-lg border transition-all duration-200',
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'border-transparent hover:bg-slate-700/30 hover:border-slate-600/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleControversySelection(item.id); }}
                    className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-blue-400" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded border',
                        sentiment.color
                      )}>
                        {sentiment.label}
                      </span>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {item.title}
                      </span>
                      {watched && (
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                          已观察
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            item.sentiment === 'negative' ? 'bg-rose-500/70' :
                            item.sentiment === 'positive' ? 'bg-emerald-500/70' :
                            'bg-slate-500/70'
                          )}
                          style={{ width: `${heatPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums w-14 text-right">
                        {item.heat.toLocaleString()}
                      </span>
                      <span className={cn(
                        'flex items-center gap-0.5 text-xs',
                        trendConfig[item.trend].color
                      )}>
                        <TrendIcon size={12} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0 mt-0.5">
                  {item.relatedNodeId && (
                    <button
                      onClick={() => handleGoToNode(item)}
                      className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="查看关联节点"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleAddToWatch(e, item)}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      watched
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                    )}
                    title={watched ? '已加入观察' : '加入观察清单'}
                    disabled={watched}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
