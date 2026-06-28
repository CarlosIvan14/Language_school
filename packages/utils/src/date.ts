import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'
import { es, enUS, uk } from 'date-fns/locale'

const locales = { es, en: enUS, uk }

export function formatDate(date: string | Date, lang: 'es' | 'en' | 'uk' = 'es') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'PPP', { locale: locales[lang] })
}

export function formatDateTime(date: string | Date, lang: 'es' | 'en' | 'uk' = 'es') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'PPp', { locale: locales[lang] })
}

export function formatTime(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function relativeTime(date: string | Date, lang: 'es' | 'en' | 'uk' = 'es') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: locales[lang] })
}

export function friendlyDate(date: string | Date, lang: 'es' | 'en' | 'uk' = 'es') {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return `Hoy ${formatTime(d)}`
  if (isTomorrow(d)) return `Mañana ${formatTime(d)}`
  return formatDateTime(d, lang)
}
