import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PredictionPieChart from '../components/PredictionPieChart'
import { recommend } from '../api'
import { levelCardClass } from '../utils/levelStyle'

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state
  const result = state?.result

  const [tips, setTips] = useState(null)
  const [tipError, setTipError] = useState(null)

  useEffect(() => {
    if (!result?.final_prediction) return
    let cancelled = false
    recommend(result.final_prediction)
      .then((data) => {
        if (!cancelled) setTips(data)
      })
      .catch((e) => {
        if (!cancelled) setTipError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [result?.final_prediction])

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="mb-6 text-slate-600 dark:text-slate-400">No prediction data. Run the form first.</p>
          <Link to="/predict" className="text-emerald-600 underline hover:text-emerald-500">
            Go to Predict
          </Link>
        </main>
      </div>
    )
  }

  const { final_prediction, predictions, best_model_name, probabilities } = result
  const predEntries = Object.entries(predictions || {})

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Results</h1>

        <div
          className={`mb-8 rounded-2xl border-2 p-6 shadow-sm ${levelCardClass(final_prediction)}`}
        >
          <p className="text-sm font-medium opacity-80">Final prediction (best model)</p>
          <p className="mt-1 text-3xl font-bold">{final_prediction}</p>
          <p className="mt-2 text-sm">
            Best model: <span className="font-semibold">{best_model_name}</span>
          </p>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              All model predictions
            </h2>
            <ul className="space-y-3">
              {predEntries.map(([name, label]) => (
                <li
                  key={name}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 transition hover:shadow-md ${
                    name === best_model_name
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50'
                  }`}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>
                  <span className="flex items-center gap-2">
                    {name === best_model_name && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Best
                      </span>
                    )}
                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              Probability distribution
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              From the best model ({best_model_name})
            </p>
            <PredictionPieChart probabilities={probabilities} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Diet and lifestyle recommendations
          </h2>
          {tipError && <p className="text-red-600 dark:text-red-400">{tipError}</p>}
          {tips && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Diet</h3>
                <ul className="list-inside list-disc space-y-1 text-slate-600 dark:text-slate-400">
                  {tips.diet_tips?.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Lifestyle</h3>
                <ul className="list-inside list-disc space-y-1 text-slate-600 dark:text-slate-400">
                  {tips.lifestyle_tips?.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => navigate('/predict')}
            className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            New prediction
          </button>
          <Link
            to="/analysis"
            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition hover:bg-emerald-500"
          >
            View model analysis
          </Link>
        </div>
      </main>
    </div>
  )
}
