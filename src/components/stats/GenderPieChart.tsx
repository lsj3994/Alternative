'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GenderStat, PollOption } from '@/lib/types';

interface GenderPieChartProps {
  stats: GenderStat[];
  options: PollOption[];
}

const OPTION_COLORS = ['#3182F6', '#00C4B4', '#FE6B00', '#F04452', '#6B7684'];

export default function GenderPieChart({ stats, options }: GenderPieChartProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-base font-bold text-text-primary mb-4">👫 성별 투표 현황</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((genderStat) => {
          const data = options.map((opt, i) => ({
            name: opt.label,
            value: genderStat.counts[opt.id] || 0,
            color: OPTION_COLORS[i % OPTION_COLORS.length],
          }));

          const total = data.reduce((acc, d) => acc + d.value, 0);

          return (
            <div key={genderStat.gender} className="text-center">
              <p className="text-sm font-semibold text-text-secondary mb-2">
                {genderStat.label} ({total.toLocaleString()}명)
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                    verticalAlign="bottom"
                    height={30}
                    iconSize={10}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
