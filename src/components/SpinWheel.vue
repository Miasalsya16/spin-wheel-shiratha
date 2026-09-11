<script setup>
import { computed } from 'vue'

const props = defineProps({
  prizes: { type: Array, required: true },
  rotation: { type: Number, default: 0 },
  spinning: { type: Boolean, default: false },
  large: { type: Boolean, default: false },
})

const size = computed(() => (props.large ? 640 : 520))
const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)
const radius = computed(() => size.value / 2 - 10)
const hubR = computed(() => (props.large ? 40 : 34))
const hubDot = computed(() => (props.large ? 12 : 11))

const labelFont = computed(() => {
  const n = props.prizes.length || 1
  const base = props.large ? 15 : 13
  if (n >= 14) return base - 2
  if (n >= 10) return base - 1
  return base
})

function splitLabel(name) {
  const text = String(name || '').trim()
  const words = text.split(/\s+/)
  if (words.length === 1) {
    if (text.length <= 14) return [text]
    const mid = Math.ceil(text.length / 2)
    return [text.slice(0, mid), text.slice(mid)]
  }
  if (words.length === 2) return words
  // 3+ kata: 2 baris seimbang
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

const segments = computed(() => {
  const list = props.prizes
  const n = list.length
  if (!n) return []
  const angle = (Math.PI * 2) / n
  const c = cx.value
  const r = radius.value
  const font = labelFont.value
  return list.map((prize, i) => {
    const start = i * angle - Math.PI / 2
    const end = start + angle
    const largeArc = angle > Math.PI ? 1 : 0
    const x1 = c + r * Math.cos(start)
    const y1 = c + r * Math.sin(start)
    const x2 = c + r * Math.cos(end)
    const y2 = c + r * Math.sin(end)
    const mid = start + angle / 2
    const labelR = r * 0.58
    const lx = c + labelR * Math.cos(mid)
    const ly = c + labelR * Math.sin(mid)
    const deg = (mid * 180) / Math.PI
    const lines = splitLabel(prize.name)
    const lineH = font + 2
    return {
      prize,
      path: `M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      lx,
      ly,
      rotate: deg,
      lines,
      lineH,
    }
  })
})

const wheelStyle = computed(() => ({
  transform: `rotate(${props.rotation}deg)`,
  transition: props.spinning
    ? 'transform 5s cubic-bezier(0.12, 0.75, 0.08, 1)'
    : 'none',
}))
</script>

<template>
  <div class="wheel-wrap" :class="{ large }">
    <div class="pointer" aria-hidden="true" />
    <div class="wheel-shadow">
      <svg
        class="wheel"
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        :style="wheelStyle"
        role="img"
        aria-label="Spin wheel"
      >
        <circle
          :cx="cx"
          :cy="cy"
          :r="radius + 4"
          fill="#ffffff"
          stroke="#a68d5f"
          stroke-width="7"
        />
        <path
          v-for="seg in segments"
          :key="seg.prize.id"
          :d="seg.path"
          :fill="seg.prize.color"
          stroke="#ffffff"
          stroke-width="2"
        />
        <g v-for="seg in segments" :key="`label-${seg.prize.id}`">
          <text
            :x="seg.lx"
            :y="seg.ly"
            text-anchor="middle"
            dominant-baseline="middle"
            :transform="`rotate(${seg.rotate} ${seg.lx} ${seg.ly})`"
            class="seg-label"
            :style="{ fontSize: labelFont + 'px' }"
          >
            <tspan
              v-for="(line, li) in seg.lines"
              :key="li"
              :x="seg.lx"
              :dy="li === 0 ? (-(seg.lines.length - 1) * seg.lineH) / 2 : seg.lineH"
            >
              {{ line }}
            </tspan>
          </text>
        </g>
        <circle
          :cx="cx"
          :cy="cy"
          :r="hubR"
          fill="#2b2b2b"
          stroke="#a68d5f"
          stroke-width="3"
        />
        <circle :cx="cx" :cy="cy" :r="hubDot" fill="#a68d5f" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.wheel-wrap {
  position: relative;
  width: min(520px, 92vw);
  height: min(520px, 92vw);
  margin: 0 auto;
}

.wheel-wrap.large {
  width: min(640px, 88vmin);
  height: min(640px, 88vmin);
}

.pointer {
  position: absolute;
  top: -8px;
  left: 50%;
  z-index: 3;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 32px solid #a68d5f;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.large .pointer {
  border-left-width: 18px;
  border-right-width: 18px;
  border-top-width: 36px;
}

.wheel-shadow {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 16px 40px rgba(43, 43, 43, 0.12);
}

.wheel {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
  will-change: transform;
}

.seg-label {
  fill: #ffffff;
  font-family: 'Figtree', sans-serif;
  font-weight: 700;
  letter-spacing: 0.01em;
  paint-order: stroke;
  stroke: rgba(43, 43, 43, 0.4);
  stroke-width: 3px;
  pointer-events: none;
}
</style>
