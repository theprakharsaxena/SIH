import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export default function CompetencyRadar({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="glass-card" style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No competency data available for chart</p>
      </div>
    );
  }

  // Pick top 8-10 key competencies for clean radar visualization
  const chartData = gaps.slice(0, 10).map((g) => ({
    subject: g.competency_code,
    name: g.competency_name,
    Current: parseFloat(g.current_score.toFixed(1)),
    Required: parseFloat(g.required_score.toFixed(1)),
    fullMark: 5.0,
  }));

  return (
    <div className="glass-card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Competency Radar</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Current proficiency vs Required level for active role
        </p>
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 5]}
              tick={{ fill: '#6B7280', fontSize: 10 }}
            />
            <Radar
              name="Current Score"
              dataKey="Current"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.35}
            />
            <Radar
              name="Required Level"
              dataKey="Required"
              stroke="#F43F5E"
              fill="#F43F5E"
              fillOpacity={0.15}
              strokeDasharray="4 4"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
              }}
              formatter={(value, name, item) => [
                `${value} / 5.0`,
                `${name} (${item.payload.name})`,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
