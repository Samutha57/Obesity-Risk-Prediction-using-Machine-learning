import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ModelComparisonChart from '../components/ModelComparisonChart'
import FeatureImportanceChart from '../components/FeatureImportanceChart'
import ConfusionMatrix from '../components/ConfusionMatrix'
import { compare, confusionMatrix, featureImportance } from '../api'

export default function Analysis() {
  const [cmp, setCmp] = useState(null)
  const [fi, setFi] = useState(null)
  const [cm, setCm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fiModel, setFiModel] = useState('')
  const [cmModel, setCmModel] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([compare(), featureImportance(), confusionMatrix()])
      .then(([c, f, m]) => {
        if (cancelled) return
        setCmp(c)
        setFi(f)
        setCm(m)
        const fiNames = (f?.models || []).map((x) => x.name)
        const cmNames = (m?.models || []).map((x) => x.name)
        if (fiNames.length) setFiModel(fiNames[0])
        if (cmNames.length) setCmModel(cmNames[0])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load analysis data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fiSelected = (fi?.models || []).find((x) => x.name === fiModel)
  const cmSelected = (cm?.models || []).find((x) => x.name === cmModel)
  const modelList = cmp?.models || []
  const bestModel =
    modelList.length > 0 ? modelList.reduce((a, b) => (b.accuracy > a.accuracy ? b : a)) : null
  const bestName = bestModel?.name ?? ''
  const bestAcc = bestModel?.accuracy

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Analysis</h1>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          Compare model accuracy, inspect feature importance, and review confusion matrices.
        </p>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-600 dark:text-slate-400">
            <Spinner />
            Loading…
          </div>
        )}

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Model comparison (accuracy)
              </h2>
              <ModelComparisonChart data={cmp} />
            </section>

            <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Feature importance (top 15)
                </h2>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  Model
                  <select
                    value={fiModel}
                    onChange={(e) => setFiModel(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {(fi?.models || []).map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {fiSelected && <FeatureImportanceChart features={fiSelected.features} />}
            </section>

            <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confusion matrix
                </h2>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  Model
                  <select
                    value={cmModel}
                    onChange={(e) => setCmModel(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {(cm?.models || []).map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {cmSelected && (
                <ConfusionMatrix labels={cmSelected.labels} matrix={cmSelected.matrix} />
              )}
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
              <h2 className="mb-3 text-lg font-semibold text-emerald-950 dark:text-emerald-100">
                Best model explanation
              </h2>
              {bestName && (
                <p className="mb-4 text-slate-700 dark:text-slate-300">
                  On this trained snapshot, <strong>{bestName}</strong> had the highest holdout accuracy
                  {bestAcc != null && (
                    <>
                      {' '}
                      (<span className="font-mono tabular-nums">{bestAcc}</span>)
                    </>
                  )}
                  . Rankings can change slightly if you re-run training with a new random seed or dataset.
                </p>
              )}
              <p className="mb-4 text-slate-700 dark:text-slate-300">
                <strong>LightGBM</strong> (gradient boosting) often does well on tabular data because it
                builds trees in sequence, correcting prior mistakes and modeling interactions (for example
                between BMI, activity, and eating habits).
              </p>
              <p className="mb-4 text-slate-700 dark:text-slate-300">
                <strong>Random Forest</strong> and <strong>Extra Trees</strong> average many randomized
                trees, which lowers variance. <strong>Decision Trees</strong> are easy to interpret but
                are more sensitive to small data shifts than ensembles.
              </p>
              <div className="overflow-x-auto rounded-lg border border-emerald-200/80 bg-white/80 dark:border-emerald-800 dark:bg-slate-900/80">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 font-semibold">Model</th>
                      <th className="p-3 font-semibold">Accuracy</th>
                      <th className="p-3 font-semibold">Precision (macro)</th>
                      <th className="p-3 font-semibold">Recall (macro)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cmp?.models || []).map((m) => (
                      <tr
                        key={m.name}
                        className={`border-b border-slate-100 dark:border-slate-800 ${
                          m.name === bestName ? 'bg-emerald-100/80 dark:bg-emerald-900/40' : ''
                        }`}
                      >
                        <td className="p-3">
                          {m.name}
                          {m.name === bestName && (
                            <span className="ml-2 rounded bg-emerald-600 px-1.5 py-0.5 text-xs text-white">
                              Best
                            </span>
                          )}
                        </td>
                        <td className="p-3">{m.accuracy}</td>
                        <td className="p-3">{m.precision}</td>
                        <td className="p-3">{m.recall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="h-6 w-6 animate-spin text-emerald-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
