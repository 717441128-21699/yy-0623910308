import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { DailyTemperature } from '@/types';
import { Card } from '@/components/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface TrendChartProps {
  data: DailyTemperature[];
  title?: string;
}

export function TrendChart({ data, title = '7日讨论趋势' }: TrendChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '讨论量',
        data: data.map((d) => d.discussionCount),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
      },
    ],
  };

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
            return data[idx].date;
          },
          label: (context) => {
            const idx = context.dataIndex;
            const d = data[idx];
            return [
              `讨论量: ${d.discussionCount.toLocaleString()}`,
              `口碑分: ${d.score}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(148, 163, 184, 0.1)',
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

  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <span className="text-xs text-slate-500">近{data.length}天</span>
      </Card.Header>
      <div className="h-56">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </Card>
  );
}
