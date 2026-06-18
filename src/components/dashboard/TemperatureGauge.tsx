import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyTemperature } from '@/types';

interface TemperatureGaugeProps {
  data: DailyTemperature;
  trend: number;
}

function getScoreColor(score: number) {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function getScoreRingColor(score: number) {
  if (score >= 75) return '#34d399';
  if (score >= 60) return '#fbbf24';
  return '#fb7185';
}

function getScoreBgColor(score: number) {
  if (score >= 75) return 'from-emerald-500/10 to-emerald-600/5';
  if (score >= 60) return 'from-amber-500/10 to-amber-600/5';
  return 'from-rose-500/10 to-rose-600/5';
}

export function TemperatureGauge({ data, trend }: TemperatureGaugeProps) {
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (data.score / 100) * circumference;
  const ringColor = getScoreRingColor(data.score);

  const trendPositive = trend > 0;
  const trendNeutral = trend === 0;

  return (
    <div className={cn(
      'relative rounded-xl p-6 bg-gradient-to-br border border-slate-700/50',
      getScoreBgColor(data.score)
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-400 font-medium">今日社区温度</p>
          <p className="text-xs text-slate-500 mt-0.5">综合口碑评分</p>
        </div>
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
          trendPositive ? 'bg-emerald-500/10 text-emerald-400' :
          trendNeutral ? 'bg-slate-500/10 text-slate-400' :
          'bg-rose-500/10 text-rose-400'
        )}>
          {trendPositive ? <TrendingUp size={12} /> :
           trendNeutral ? <Minus size={12} /> :
           <TrendingDown size={12} />}
          {trendPositive ? '+' : ''}{trend.toFixed(1)}%
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="56"
              fill="none"
              stroke="rgba(148, 163, 184, 0.1)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="56"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 8px ${ringColor}30)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-3xl font-bold tabular-nums', getScoreColor(data.score))}>
              {data.score}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">讨论量</span>
            <span className="text-sm font-medium text-white tabular-nums">
              {data.discussionCount.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: '72%' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-emerald-400 font-semibold text-sm tabular-nums">
                {(data.positiveRatio * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500">正面</p>
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-semibold text-sm tabular-nums">
                {(data.neutralRatio * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500">中性</p>
            </div>
            <div className="text-center">
              <p className="text-rose-400 font-semibold text-sm tabular-nums">
                {(data.negativeRatio * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500">负面</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            data.score >= 75 ? 'bg-emerald-400' :
            data.score >= 60 ? 'bg-amber-400' : 'bg-rose-400'
          )} />
          <span className="text-xs text-slate-400">
            {data.score >= 75 ? '口碑健康，玩家整体评价正面' :
             data.score >= 60 ? '口碑平稳，存在部分争议需关注' :
             '口碑预警，负面情绪较高建议介入'}
          </span>
        </div>
      </div>
    </div>
  );
}
