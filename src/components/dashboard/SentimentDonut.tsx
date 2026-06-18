import { useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DailyTemperature } from '@/types';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip);

interface SentimentDonutProps {
  data: DailyTemperature;
  trend?: number;
}

export function SentimentDonut({ data, trend = 0 }: SentimentDonutProps) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  const chartData = {
    labels: ['正面', '中性', '负面'],
    datasets: [
      {
        data: [
          data.positiveRatio * 100,
          data.neutralRatio * 100,
          data.negativeRatio * 100,
        ],
        backgroundColor: ['#34d399', '#64748b', '#fb7185'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
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
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed.toFixed(1)}%`;
          },
        },
      },
    },
  };

  const trendPositive = trend >= 0;

  return (
    <Card>
      <Card.Header>
        <Card.Title>评价情绪分布</Card.Title>
        {trend !== 0 && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trendPositive ? 'text-emerald-400' : 'text-rose-400'
          )}>
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendPositive ? '+' : ''}{trend.toFixed(1)}%
          </div>
        )}
      </Card.Header>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 flex-shrink-0 relative">
          <Doughnut ref={chartRef} data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">
              {(data.positiveRatio * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-500">正面占比</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm text-slate-300">正面</span>
            </div>
            <span className="text-sm font-medium text-emerald-400 tabular-nums">
              {(data.positiveRatio * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="text-sm text-slate-300">中性</span>
            </div>
            <span className="text-sm font-medium text-slate-300 tabular-nums">
              {(data.neutralRatio * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-sm text-slate-300">负面</span>
            </div>
            <span className="text-sm font-medium text-rose-400 tabular-nums">
              {(data.negativeRatio * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
