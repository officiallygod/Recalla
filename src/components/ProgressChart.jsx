import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom tooltip to format percentages to 2 decimal places
const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '12px'
        }}
      >
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value.toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ProgressChart = React.memo(({ data, isDark }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isDark ? '#334155' : '#e2e8f0'}
          vertical={false}
        />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke={isDark ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip isDark={isDark} />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Area 
          type="monotone" 
          dataKey="accuracy" 
          stroke="#6366f1" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorAccuracy)"
          name="Accuracy %"
        />
        <Area 
          type="monotone" 
          dataKey="mastery" 
          stroke="#10b981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorMastery)"
          name="Mastery %"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

ProgressChart.displayName = 'ProgressChart';

export default ProgressChart;
