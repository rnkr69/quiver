import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface ChartData {
  chart_type?: 'line' | 'bar'
  x_key?: string
  y_key?: string
  series?: Array<{ x: string | number; y: number }>
}

interface Props {
  title: string
  data: ChartData
}

export function ChartWidget({ title, data }: Props) {
  const chartData = data.series ?? []
  const xKey = data.x_key ?? 'x'
  const yKey = data.y_key ?? 'y'
  const chartType = data.chart_type ?? 'line'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="text-md text-gray-600 mb-3">{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        {chartType === 'bar'
          ? (
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={35} />
              <Tooltip />
              <Bar dataKey={yKey} fill="#009ca6" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={35} />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} stroke="#009ca6" strokeWidth={2} dot={false} />
            </LineChart>
          )
        }
      </ResponsiveContainer>
    </div>
  )
}
