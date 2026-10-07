import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import heroWellnessUrl from '../assets/hero-wellness.svg'

const features = [
  {
    title: 'Four ML models',
    text: 'LightGBM, Random Forest, Extra Trees, and Decision Tree vote on your risk profile.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Clear visuals',
    text: 'Compare accuracy, explore feature importance, and review confusion matrices.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    title: 'Actionable tips',
    text: 'Get diet and lifestyle guidance tailored to your predicted obesity category.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.22),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/10" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-12 md:py-20 lg:py-24">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
              Obesity Risk Prediction System
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.15rem] lg:leading-[1.1]">
              Smarter insights for a{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                healthier you
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:mx-0 mx-auto">
              Estimate obesity category with ensemble machine learning, compare models side by side,
              and receive practical nutrition and activity guidance—built for clarity, not clutter.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Link
                to="/predict"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl"
              >
                Start prediction
              </Link>
              <Link
                to="/analysis"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white/80 px-8 py-3 text-base font-semibold text-slate-800 backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-emerald-700"
              >
                View model analysis
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Demo uses a synthetic training set; not a substitute for medical advice.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="relative rounded-3xl border border-emerald-100/80 bg-white/60 p-3 shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-500/10 backdrop-blur-md transition duration-300 hover:shadow-emerald-900/15 dark:border-emerald-900/40 dark:bg-slate-900/40 dark:ring-emerald-500/20">
              <img
                src={heroWellnessUrl}
                alt="Illustration: wellness analytics, heart health, and activity"
                className="h-auto w-full rounded-2xl"
                width={560}
                height={420}
                loading="eager"
              />
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-slate-200/90 bg-white/95 px-4 py-2 text-xs font-medium text-slate-600 shadow-lg dark:border-slate-600 dark:bg-slate-800/95 dark:text-slate-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live-style dashboard preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="border-t border-slate-200/80 bg-white/80 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            What you can do here
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
            A focused workflow: predict, understand model behavior, and read evidence-based lifestyle tips.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, text, icon }) => (
              <li
                key={title}
                className="group rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/80 dark:hover:border-emerald-800"
              >
                <div className="mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-300 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-8 py-12 text-center text-white shadow-xl shadow-emerald-900/20 md:px-12">
            <h2 className="text-2xl font-bold md:text-3xl">Ready to run a prediction?</h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-100">
              Enter a few health and lifestyle fields—we will compute BMI, run all four models, and show
              probabilities plus recommendations.
            </p>
            <Link
              to="/predict"
              className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-8 py-3 text-base font-semibold text-emerald-800 shadow-md transition hover:bg-emerald-50"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
