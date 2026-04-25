const pad = (n: number) => String(n).padStart(2, '0')

function fmtUTC(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

export function generateICSContent(
  title: string,
  start: Date,
  durationMinutes: number,
  description: string,
  location: string,
): string {
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const uid = `${start.getTime()}-${Math.random().toString(36).slice(2)}@letudiant-salons`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//L'Etudiant Salons//FR",
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${fmtUTC(start)}`,
    `DTEND:${fmtUTC(end)}`,
    `SUMMARY:${title.replace(/\n/g, '\\n')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function generateGoogleCalendarUrl(
  title: string,
  start: Date,
  durationMinutes: number,
  description: string,
  location: string,
): string {
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmtUTC(start)}/${fmtUTC(end)}`,
    details: description,
    location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
