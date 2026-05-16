'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RegionStat, PollOption } from '@/lib/types';

interface RegionChartProps {
  stats: RegionStat[];
  options: PollOption[];
}

const OPTION_COLORS = ['#3182F6', '#00C4B4', '#FE6B00', '#F04452', '#6B7684'];

export default function RegionChart({ stats, options }: RegionChartProps) {
  const data = stats.map((regionStat) => {
    const item: Record<string, string | number> = { name: regionStat.region };
    options.forEach((opt) => {
      item[opt.label] = regionStat.counts[opt.id] || 0;
    });
    return item;
  });

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-base font-bold text-text-primary mb-4">📍 지역별 투표 현황</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" barGap={2} barCategoryGap="15%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value) => [`${Number(value).toLocaleString()}표`, '']}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconSize={10}
            wrapperStyle={{ fontSize: '12px' }}
          />
          {options.map((opt, i) => (
            <Bar
              key={opt.id}
              dataKey={opt.label}
              fill={OPTION_COLORS[i % OPTION_COLORS.length]}
              radius={[0, 4, 4, 0]}
              animationBegin={0}
              animationDuration={1000}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
