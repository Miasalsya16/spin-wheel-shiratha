// Total hadiah fisik: 314 pcs + ZONK 300 pcs
export const DEFAULT_PRIZES = [
  { name: 'Topi Treetan', stock: 25, color: '#E6A817', active: true, order: 0 },
  { name: 'Toiletris Treetan', stock: 4, color: '#0D9488', active: true, order: 1 },
  { name: 'Gelas Treetan', stock: 25, color: '#E11D48', active: true, order: 2 },
  { name: 'Tap Cash Minala', stock: 20, color: '#1D4ED8', active: true, order: 3 },
  { name: 'Tumbler Minala', stock: 20, color: '#CA8A04', active: true, order: 4 },
  { name: 'Gelas Minala', stock: 20, color: '#9A3412', active: true, order: 5 },
  { name: 'Tote Bag Minala', stock: 20, color: '#059669', active: true, order: 6 },
  { name: 'Voucher Minala', stock: 60, color: '#C026D3', active: true, order: 7 },
  { name: 'Tumbler Jasindo', stock: 20, color: '#0284C7', active: true, order: 8 },
  { name: 'Payung Jasindo', stock: 20, color: '#312E81', active: true, order: 9 },
  { name: 'Bantal Kanomas', stock: 15, color: '#F97316', active: true, order: 10 },
  { name: 'Notebook Kanomas', stock: 13, color: '#BE123C', active: true, order: 11 },
  { name: 'Pulpen Kanomas', stock: 20, color: '#4D7C0F', active: true, order: 12 },
  { name: 'Topi Aqobah', stock: 32, color: '#7C3AED', active: true, order: 13 },
  { name: 'ZONK', stock: 300, color: '#57534E', active: true, order: 14 },
]

export const ZONK_COLOR = '#57534E'

/** Warna resmi per nama hadiah (untuk update data lokal tanpa reset stok) */
export const PRIZE_COLORS_BY_NAME = Object.fromEntries(
  DEFAULT_PRIZES.map((p) => [p.name.toLowerCase(), p.color]),
)

const NAME_ALIASES = {
  'tote bag final': 'Tote Bag Minala',
}

export function isZonkName(name) {
  return String(name || '')
    .toUpperCase()
    .includes('ZONK')
}

export function normalizePrizeName(name) {
  const key = String(name || '').trim().toLowerCase()
  return NAME_ALIASES[key] || String(name || '').trim()
}

export function createLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** Gabungkan semua ZONK jadi 1 segmen, total stok tetap. */
export function mergeZonkPrizes(list) {
  const others = []
  let zonkStock = 0
  let hadZonk = false

  for (const p of list) {
    if (isZonkName(p.name)) {
      hadZonk = true
      zonkStock += Math.max(0, Number(p.stock) || 0)
    } else {
      others.push({ ...p })
    }
  }

  if (!hadZonk) zonkStock = 300

  others.push({
    id: createLocalId(),
    name: 'ZONK',
    stock: zonkStock,
    color: ZONK_COLOR,
    active: true,
    order: others.length,
    updatedAt: Date.now(),
  })

  return others.map((p, i) => ({ ...p, order: i }))
}
