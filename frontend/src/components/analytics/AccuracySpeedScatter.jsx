import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis } from 'recharts';

export default function AccuracySpeedScatter({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic">
        Need quiz attempt data to compute speed vs accuracy correlation.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis 
            type="number" 
            dataKey="speedMinutes" 
            name="Duration" 
            unit=" min" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
          />
          <YAxis 
            type="number" 
            dataKey="accuracy" 
            name="Accuracy" 
            unit="%" 
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
          />
          <ZAxis range={[60, 200]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
            }}
            formatter={(value, name) => [value, name === 'Duration' ? `${value} minutes` : `${value}%`]}
          />
          <Scatter 
            name="Quiz Attempts" 
            data={data} 
            fill="#3b82f6" 
            className="hover:scale-125 transition-transform"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
