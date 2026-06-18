import { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Competitor } from '@/types';
import { Card } from '@/components/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface CompetitorChartProps {
  items: Competitor[];
  currentProduct?: string;
}

type MetricType = 'score' | 'discussion' | 'positive';

const metrics: { key: MetricType; label: string }[] = [
  { key: 'score', label: '口碑分' },
  { key: 'discussion', label: '讨论量' },
  { key: 'positive', label: '正面占比' },
];

export function CompetitorChart({ items, currentProduct = '星之契约' }: CompetitorChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('score');
  const chartRef = useRef<ChartJS<'bar'>>(null);

  const getData = () => {
    const allItems = [
      { name: currentProduct, isCurrent: true },
      ...items.map((i) => ({ ...i, isCurrent: false })),
    ];

    let values: number[];
    if (activeMetric === 'score') {
      values = [72, ...items.map((i) => i.score)];
    } else if (activeMetric === 'discussion') {
      values = [12847, ...items.map((i) => i.discussionCount)];
    } else {
      values = [58, ...items.map((i) => i.positiveRatio * 100)];
    }

    return {
      labels: allItems.map((i) => i.name),
      datasets: [
        {
          data: values,
          backgroundColor: allItems.map((i) =>
            i.isCurrent ? 'rgba(96, 165, 250, 0.9)' : 'rgba(100, 116, 139, 0.5)'
          ),
          borderColor: allItems.map((i) =>
            i.isCurrent ? '#60a5fa' : '#64748b'
          ),
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 32,
        },
      ],
    };
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
          label: () => {
            return '';
          },
          title: (items) => {
            return items[0].label;
          },
          afterBody: (ctx) => {
            const value = ctx[0].parsed.x;
            if (activeMetric === 'discussion') {
              return `讨论量: ${value.toLocaleString()}`;
            }
            if (activeMetric === 'positive') {
              return `正面占比: ${value.toFixed(1)}%`;
            }
            return `口碑分: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          callback: (value) => {
            if (activeMetric === 'discussion' && typeof value === 'number') {
              return (value / 1000).toFixed(0) + 'k';
            }
            if (activeMetric === 'positive') {
              return value + '%';
            }
            return value;
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>竞品对比</Card.Title>
        <div className="flex gap-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeMetric === m.key
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Card.Header>
      <div className="h-52">
        <Bar ref={chartRef} data={getData()} options={options} />
      </div>
    </Card>
  );
}
