import { Sword, Shirt, Trophy, Package, Settings } from 'lucide-react';
import type { VersionNode, NodeType } from '@/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface NodeTimelineProps {
  nodes: VersionNode[];
}

const nodeTypeConfig: Record<NodeType, { icon: typeof Sword; label: string; color: string; bgColor: string }> = {
  hero: { icon: Sword, label: '新英雄', color: 'text-violet-400', bgColor: 'bg-violet-500/20 border-violet-500/30' },
  skin: { icon: Shirt, label: '新皮肤', color: 'text-pink-400', bgColor: 'bg-pink-500/20 border-pink-500/30' },
  season: { icon: Trophy, label: '赛季', color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30' },
  bundle: { icon: Package, label: '礼包', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30' },
  patch: { icon: Settings, label: '补丁', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30' },
};

export function NodeTimeline({ nodes }: NodeTimelineProps) {
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

  const sortedNodes = [...nodes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">版本节点</h3>
        <span className="text-xs text-slate-500">{nodes.length} 个节点</span>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-700/50" />
        <div className="space-y-1">
          {sortedNodes.map((node) => {
            const config = nodeTypeConfig[node.type];
            const Icon = config.icon;
            const isSelected = selectedNodeId === node.id;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-200 relative',
                  isSelected
                    ? 'bg-slate-700/50'
                    : 'hover:bg-slate-700/30'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 z-10',
                  isSelected ? config.bgColor : 'bg-slate-800/80 border-slate-700/50'
                )}>
                  <Icon size={18} className={isSelected ? config.color : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-medium truncate',
                      isSelected ? 'text-white' : 'text-slate-200'
                    )}>
                      {node.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">
                      {new Date(node.date).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className={cn('text-xs', config.color)}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">峰值讨论</p>
                  <p className="text-sm font-medium text-white tabular-nums">
                    {(node.peakDiscussion / 1000).toFixed(1)}k
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
