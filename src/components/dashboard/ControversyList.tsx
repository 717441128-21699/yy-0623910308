import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
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
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const maxHeat = Math.max(...items.map((i) => i.heat));

  const handleClick = (item: Controversy) => {
    if (item.relatedNodeId) {
      setSelectedNodeId(item.relatedNodeId);
      setCurrentView('nodes');
    }
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>核心争议点</Card.Title>
        <span className="text-xs text-slate-500">按热度排序</span>
      </Card.Header>
      <div className="space-y-2">
        {displayItems.map((item) => {
          const sentiment = sentimentConfig[item.sentiment];
          const TrendIcon = trendConfig[item.trend].icon;
          const heatPercent = (item.heat / maxHeat) * 100;

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={cn(
                'p-3 rounded-lg border border-transparent transition-all duration-200',
                'hover:bg-slate-700/30 hover:border-slate-600/50 cursor-pointer group'
              )}
            >
              <div className="flex items-start justify-between gap-3">
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
                {item.relatedNodeId && (
                  <ArrowUpRight
                    size={14}
                    className="text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0 mt-1"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
