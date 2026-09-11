// Total hadiah fisik: 317 pcs
// ZONK: 300 pcs → total slot spin ≈ 617 (cukup untuk 600+ peserta)
// Palet: warm Shiratha (emas, teal, terracotta) — beda jelas antar segmen
export const DEFAULT_PRIZES = [
  { name: 'Topi Treetan', stock: 25, color: '#C9A227', active: true, order: 0 },
  { name: 'Toiletris Treetan', stock: 4, color: '#2F5D50', active: true, order: 1 },
  { name: 'Gelas Treetan', stock: 25, color: '#D4764E', active: true, order: 2 },
  { name: 'Tap Cash Minala', stock: 20, color: '#1E3A5F', active: true, order: 3 },
  { name: 'Tumbler Minala', stock: 20, color: '#A68D5F', active: true, order: 4 },
  { name: 'Gelas Minala', stock: 20, color: '#8B5E3C', active: true, order: 5 },
  { name: 'Tote Bag Final', stock: 20, color: '#4A7C6F', active: true, order: 6 },
  { name: 'Voucher Minala', stock: 60, color: '#B85C38', active: true, order: 7 },
  { name: 'Tumbler Jasindo', stock: 20, color: '#6B8F71', active: true, order: 8 },
  { name: 'Payung Jasindo', stock: 20, color: '#3F4E63', active: true, order: 9 },
  { name: 'Bantal Kanomas', stock: 15, color: '#C4A574', active: true, order: 10 },
  { name: 'Notebook Kanomas', stock: 13, color: '#9C6B4F', active: true, order: 11 },
  { name: 'Pulpen Kanomas', stock: 20, color: '#5F7161', active: true, order: 12 },
  { name: 'Topi Aqobah', stock: 32, color: '#A67C52', active: true, order: 13 },
  { name: 'ZONK', stock: 300, color: '#6E6A63', active: true, order: 14 },
]

/** Warna resmi per nama hadiah (untuk update data lokal tanpa reset stok) */
export const PRIZE_COLORS_BY_NAME = Object.fromEntries(
  DEFAULT_PRIZES.map((p) => [p.name.toLowerCase(), p.color]),
)

export function createLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
