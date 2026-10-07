import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { predict } from '../api'

const initial = {
  age: 35,
  gender: 'M',
  height_cm: 175,
  weight_kg: 78,
  physical_activity: 'Medium',
  eating_habits: 'Balanced',
  family_history: 'No',
}

export default function Predict() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const hM = Number(form.height_cm) / 100
  const bmi =
    hM > 0 && Number(form.weight_kg) > 0 ? (Number(form.weight_kg) / (hM * hM)).toFixed(1) : '—'

  function update(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        age: parseInt(form.age, 10),
        gender: form.gender,
        height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg),
        physical_activity: form.physical_activity,
        eating_habits: form.eating_habits,
        family_history: form.family_history,
      }
      const data = await predict(payload)
      navigate('/result', { state: { result: data } })
    } catch (err) {
      setError(err.message || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Prediction</h1>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          Enter your details. BMI is calculated automatically from height and weight.
        </p>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Age</span>
              <input
                type="number"
                name="age"
                min={1}
                max={120}
                required
                value={form.age}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</span>
              <select
                name="gender"
                value={form.gender}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Height (cm)
              </span>
              <input
                type="number"
                name="height_cm"
                min={50}
                max={300}
                step={0.1}
                required
                value={form.height_cm}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Weight (kg)
              </span>
              <input
                type="number"
                name="weight_kg"
                min={10}
                max={400}
                step={0.1}
                required
                value={form.weight_kg}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                BMI (auto)
              </span>
              <input
                type="text"
                readOnly
                value={bmi}
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Physical activity
              </span>
              <select
                name="physical_activity"
                value={form.physical_activity}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Eating habits
              </span>
              <select
                name="eating_habits"
                value={form.eating_habits}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="Poor">Poor</option>
                <option value="Balanced">Balanced</option>
                <option value="Healthy">Healthy</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Family history of obesity
              </span>
              <select
                name="family_history"
                value={form.family_history}
                onChange={update}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-8 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Predicting…
                </span>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
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
