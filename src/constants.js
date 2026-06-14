export const DAYS = ['จ','อ','พ','พฤ','ศ','ส','อา']
export const DAY_FULL = { จ:'จันทร์', อ:'อังคาร', พ:'พุธ', พฤ:'พฤหัส', ศ:'ศุกร์', ส:'เสาร์', อา:'อาทิตย์' }
export const COLORS = [
  '#b4d4ff','#a8e6c4','#fde68a','#e9c8ff','#99f6e4',
  '#fed7aa','#fbcfe8','#d9f99d','#a5f3fc','#c7d2fe',
  '#fef08a','#bbf7d0','#fecaca','#ddd6fe','#bae6fd',
]
export const TIMES = []
for (let h = 7; h < 20; h++) {
  TIMES.push(`${String(h).padStart(2,'0')}:00`)
  TIMES.push(`${String(h).padStart(2,'0')}:30`)
}
TIMES.push('20:00')

export const t2m = t => { const [h,m] = t.split(':').map(Number); return h*60+m }
