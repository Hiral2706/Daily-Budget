import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <p className="font-bold text-primary-600 dark:text-primary-400">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyBarChart({ data, dailyBudget }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.08)' }} />
        {dailyBudget > 0 && (
          <ReferenceLine
            y={dailyBudget}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: 'Budget', position: 'right', fontSize: 10, fill: '#22c55e' }}
          />
        )}
        <Bar
          dataKey="spent"
          fill="#4ade80"
          radius={[6, 6, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
