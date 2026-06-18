import { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { VersionNode, DailyTemperature } from '@/types';
import { Card } from '@/components/Card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler
);

interface NodeDetailChartProps {
  node: VersionNode;
  dailyData: DailyTemperature[];
}

export function NodeDetailChart({ node, dailyData }: NodeDetailChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = useMemo(() => {
    const nodeIndex = dailyData.findIndex((d) => d.date === node.date);

    return {
      labels: dailyData.map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: '讨论量',
          data: dailyData.map((d) => d.discussionCount),
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: (context: any) => {
            return context.dataIndex === nodeIndex ? 6 : 3;
          },
          pointBackgroundColor: (context: any) => {
            return context.dataIndex === nodeIndex ? '#f472b6' : '#60a5fa';
          },
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [dailyData, node.date]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            return dailyData[idx].date;
          },
          label: (context) => {
            const idx = context.dataIndex;
            const d = dailyData[idx];
            return [
              `讨论量: ${d.discussionCount.toLocaleString()}`,
              `口碑分: ${d.score}`,
              `正面: ${(d.positiveRatio * 100).toFixed(0)}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.06)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          callback: (value) => {
            if (typeof value === 'number') {
              return (value / 1000).toFixed(0) + 'k';
            }
            return value;
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const sentimentDiff = node.afterSentiment - node.beforeSentiment;
  const sentimentDiffPercent = ((node.afterSentiment - node.beforeSentiment) / node.beforeSentiment) * 100;
  const isPositive = sentimentDiff > 0;
  const isNeutral = sentimentDiff === 0;

  return (
    <Card className="h-full">
      <Card.Header>
        <div>
          <Card.Title>{node.title}</Card.Title>
          <p className="text-xs text-slate-500 mt-1">{node.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">上线日期</p>
          <p className="text-sm font-medium text-white">
            {new Date(node.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </Card.Header>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">峰值讨论</p>
          <p className="text-lg font-bold text-white tabular-nums">
            {(node.peakDiscussion / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">评论数</p>
          <p className="text-lg font-bold text-white tabular-nums">
            {node.commentCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">上线前情绪</p>
          <p className="text-lg font-bold text-emerald-400 tabular-nums">
            {(node.beforeSentiment * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">上线后情绪</p>
          <div className="flex items-center gap-1.5">
            <p className={cn(
              'text-lg font-bold tabular-nums',
              node.afterSentiment >= 0.6 ? 'text-emerald-400' :
              node.afterSentiment >= 0.4 ? 'text-amber-400' : 'text-rose-400'
            )}>
              {(node.afterSentiment * 100).toFixed(0)}%
            </p>
            <span className={cn(
              'flex items-center text-xs',
              isPositive ? 'text-emerald-400' :
              isNeutral ? 'text-slate-400' : 'text-rose-400'
            )}>
              {isPositive ? <TrendingUp size={12} /> :
               isNeutral ? <Minus size={12} /> :
               <TrendingDown size={12} />}
              {isPositive ? '+' : ''}{sentimentDiffPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </Card>
  );
}
