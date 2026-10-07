export default function ConfusionMatrix({ labels, matrix }) {
  const rows = matrix || []
  const cols = labels || []
  const flat = rows.flat()
  const maxVal = Math.max(1, ...flat.map(Number))

  function cellClass(v) {
    const t = Number(v) / maxVal
    if (t < 0.15) return 'bg-slate-100 dark:bg-slate-800'
    if (t < 0.35) return 'bg-indigo-200 dark:bg-indigo-900/60'
    if (t < 0.6) return 'bg-indigo-400 text-white dark:bg-indigo-700'
    return 'bg-indigo-700 text-white dark:bg-indigo-500'
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[480px] border-collapse text-center text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900">
            <th className="border border-slate-200 p-2 text-xs font-medium dark:border-slate-700" />
            {cols.map((c) => (
              <th
                key={c}
                className="border border-slate-200 p-1 text-[10px] font-medium leading-tight dark:border-slate-700 sm:text-xs"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={cols[i] || i}>
              <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-medium dark:border-slate-700 dark:bg-slate-900">
                {cols[i]}
              </th>
              {row.map((cell, j) => (
                <td
                  key={`${i}-${j}`}
                  className={`border border-slate-200 p-2 text-xs font-semibold transition dark:border-slate-700 ${cellClass(cell)}`}
                  title={`True: ${cols[i]}, Predicted: ${cols[j]} = ${cell}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
