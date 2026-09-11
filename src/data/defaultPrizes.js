// Total hadiah fisik: 317 pcs
// ZONK: 300 pcs → total slot spin ≈ 617 (cukup untuk 600+ peserta)
export const DEFAULT_PRIZES = [
  { name: 'Topi Treetan', stock: 25, color: '#E85D4C', active: true, order: 0 },
  { name: 'Toiletris Treetan', stock: 4, color: '#F0A202', active: true, order: 1 },
  { name: 'Gelas Treetan', stock: 25, color: '#2A9D8F', active: true, order: 2 },
  { name: 'Tap Cash Minala', stock: 20, color: '#264653', active: true, order: 3 },
  { name: 'Tumbler Minala', stock: 20, color: '#E9C46A', active: true, order: 4 },
  { name: 'Gelas Minala', stock: 20, color: '#BC6C25', active: true, order: 5 },
  { name: 'Tote Bag Final', stock: 20, color: '#457B9D', active: true, order: 6 },
  { name: 'Voucher Minala', stock: 60, color: '#E76F51', active: true, order: 7 },
  { name: 'Tumbler Jasindo', stock: 20, color: '#2A9D8F', active: true, order: 8 },
  { name: 'Payung Jasindo', stock: 20, color: '#1D3557', active: true, order: 9 },
  { name: 'Bantal Kanomas', stock: 15, color: '#A8DADC', active: true, order: 10 },
  { name: 'Notebook Kanomas', stock: 13, color: '#F4A261', active: true, order: 11 },
  { name: 'Pulpen Kanomas', stock: 20, color: '#9B5DE5', active: true, order: 12 },
  { name: 'Topi Aqobah', stock: 32, color: '#00BBF9', active: true, order: 13 },
  { name: 'ZONK', stock: 300, color: '#6D6875', active: true, order: 14 },
]

export function createLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
