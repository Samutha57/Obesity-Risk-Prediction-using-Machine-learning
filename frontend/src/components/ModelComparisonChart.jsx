import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function ModelComparisonChart({ data }) {
  const chartData = (data?.models || []).map((m) => ({
    name: m.name,
    accuracy: m.accuracy,
  }))

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={60} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Accuracy']}
            contentStyle={{ borderRadius: '8px' }}
          />
          <Bar dataKey="accuracy" fill="#059669" radius={[6, 6, 0, 0]} name="Accuracy" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
