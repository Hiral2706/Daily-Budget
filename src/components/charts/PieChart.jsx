import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444', '#eab308', '#14b8a6', '#6b7280'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-50">{payload[0].name}</p>
        <p className="text-primary-600 dark:text-primary-400">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600 dark:text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
