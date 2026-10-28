import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export default function CategoryRadarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic">
        Complete quizzes across categories to see your radar chart.
      </div>
    );
  }

  // Format short category names for readability on radar
  const formattedData = data.map((d) => ({
    ...d,
    shortCategory: d.category.length > 15 ? d.category.split(' ')[0] : d.category,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={formattedData}>
          <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <PolarAngleAxis 
            dataKey="shortCategory" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            stroke="#cbd5e1"
            className="dark:stroke-slate-700" 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
            }}
            formatter={(value, name, props) => [`${value}%`, props.payload.category]}
          />
          <Radar
            name="Skill Proficiency"
            dataKey="averageScore"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
