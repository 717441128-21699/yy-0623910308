import { useState } from 'react';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { WatchCard } from '@/components/watchlist/WatchCard';
import { WatchModal } from '@/components/watchlist/WatchModal';
import { useAppStore } from '@/store/useAppStore';
import type { WatchStatus, Priority } from '@/types';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | WatchStatus;
type SortType = 'nextReview' | 'priority' | 'createdAt';

const statusFilters: { value: StatusFilter; label: string; count?: number }[] = [
  { value: 'all', label: '全部' },
  { value: 'watching', label: '观察中' },
  { value: 'escalated', label: '需升级' },
  { value: 'resolved', label: '已解决' },
];

export function WatchlistPage() {
  const watchItems = useAppStore((state) => state.watchItems);
  const setShowWatchModal = useAppStore((state) => state.setShowWatchModal);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortType>('nextReview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = watchItems
    .filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'nextReview') {
        return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const urgentCount = watchItems.filter((item) => {
    if (item.status !== 'watching') return false;
    const daysUntil = Math.ceil(
      (new Date(item.nextReviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 2;
  }).length;

  const counts = {
    all: watchItems.length,
    watching: watchItems.filter((i) => i.status === 'watching').length,
    escalated: watchItems.filter((i) => i.status === 'escalated').length,
    resolved: watchItems.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">观察清单</h2>
          <p className="text-sm text-slate-400 mt-1">
            追踪需要持续关注的争议和风险
          </p>
        </div>
        <button
          onClick={() => setShowWatchModal(true)}
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          新增观察
        </button>
      </div>

      {urgentCount > 0 && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-amber-400">
              有 {urgentCount} 项观察即将到期
            </p>
            <p className="text-xs text-amber-300/70 mt-0.5">
              请及时跟进并更新状态，避免会议上只靠印象争论
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                statusFilter === f.value
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs text-slate-500">
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] max-w-sm">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索观察项..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            <option value="nextReview">按查看时间</option>
            <option value="priority">按优先级</option>
            <option value="createdAt">按创建时间</option>
          </select>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <WatchCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/30 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-600" />
          </div>
          <h3 className="text-base font-medium text-slate-400 mb-2">暂无观察项</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            添加需要持续关注的争议问题，设置责任人和下次查看时间
          </p>
          <button
            onClick={() => setShowWatchModal(true)}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus size={14} />
            添加第一个观察
          </button>
        </div>
      )}

      <WatchModal />
    </div>
  );
}
