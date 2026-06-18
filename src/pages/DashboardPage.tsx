import { TemperatureGauge } from '@/components/dashboard/TemperatureGauge';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { SentimentDonut } from '@/components/dashboard/SentimentDonut';
import { ControversyList } from '@/components/dashboard/ControversyList';
import { CompetitorChart } from '@/components/dashboard/CompetitorChart';
import {
  getTodayTemperature,
  dailyTemperatures,
  controversies,
  competitors,
} from '@/data/mockData';

export function DashboardPage() {
  const today = getTodayTemperature();
  const yesterday = dailyTemperatures[dailyTemperatures.length - 2];
  const scoreTrend = today.score - yesterday.score;

  const last14Days = dailyTemperatures.slice(-14);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">今日社区温度</h2>
          <p className="text-sm text-slate-400 mt-1">
            {new Date(today.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 transition-colors">
            导出报告
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
            分享
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <TemperatureGauge data={today} trend={scoreTrend} />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <TrendChart data={last14Days} title="14日讨论趋势" />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <SentimentDonut data={today} trend={2.3} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <ControversyList items={controversies} />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <CompetitorChart items={competitors} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">本周数据概览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">周均讨论量</span>
                <span className="text-sm font-semibold text-white tabular-nums">
                  15.2k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">正面率均值</span>
                <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                  53.4%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">负面率峰值</span>
                <span className="text-sm font-semibold text-rose-400 tabular-nums">
                  28%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">活跃争议数</span>
                <span className="text-sm font-semibold text-amber-400 tabular-nums">
                  5 个
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">主要讨论渠道</h3>
            <div className="space-y-3">
              {[
                { name: '贴吧', count: 4230, percent: 33 },
                { name: 'NGA', count: 2890, percent: 22 },
                { name: 'B站评论', count: 2450, percent: 19 },
                { name: '微博', count: 1870, percent: 15 },
                { name: 'TapTap', count: 1407, percent: 11 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{item.name}</span>
                    <span className="text-xs text-slate-300 tabular-nums">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">玩家画像</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">性别分布</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: '68%' }} />
                    <div className="h-full bg-pink-500" style={{ width: '32%' }} />
                  </div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-slate-400">男 68%</span>
                  <span className="text-xs text-slate-400">女 32%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">年龄分布</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold text-white">12%</p>
                    <p className="text-xs text-slate-500">18岁以下</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">45%</p>
                    <p className="text-xs text-slate-500">19-25岁</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">28%</p>
                    <p className="text-xs text-slate-500">26-35岁</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">15%</p>
                    <p className="text-xs text-slate-500">36岁+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
