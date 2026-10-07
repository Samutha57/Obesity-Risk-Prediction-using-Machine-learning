/** Tailwind classes for obesity level color coding */
export function levelCardClass(level) {
  const l = String(level).toLowerCase()
  if (l.includes('normal')) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-100'
  }
  if (l.includes('underweight')) {
    return 'border-sky-300 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:border-sky-700 dark:text-sky-100'
  }
  if (l.includes('overweight')) {
    return 'border-amber-400 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:border-amber-600 dark:text-amber-100'
  }
  if (l.includes('obese')) {
    return 'border-red-400 bg-red-50 text-red-950 dark:bg-red-950/40 dark:border-red-700 dark:text-red-100'
  }
  return 'border-slate-200 bg-slate-50 text-slate-900 dark:bg-slate-800 dark:border-slate-600'
}

export function pieColors() {
  return ['#10b981', '#0ea5e9', '#f59e0b', '#f97316', '#ef4444', '#991b1b']
}
