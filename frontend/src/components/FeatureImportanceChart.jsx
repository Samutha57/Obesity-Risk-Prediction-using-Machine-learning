import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function FeatureImportanceChart({ features }) {
  const data = [...(features || [])]
    .sort((a, b) => a.importance - b.importance)
    .map((f) => {
      const featName = f.feature || f.name || ''
      return {
        name: featName.length > 28 ? `${featName.slice(0, 26)}…` : featName,
        fullName: featName,
        importance: f.importance,
      }
    })

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis type="number" domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(6), 'Importance']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          />
          <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
