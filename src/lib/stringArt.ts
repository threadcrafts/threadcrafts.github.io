import { getLinePixels } from './bresenham'

// Petros Vrellis–style algorithm; UI defaults unchanged (288 pins, 4000 lines, line weight 20)
export const DEFAULT_NAIL_COUNT = 288
export const DEFAULT_ITERATIONS = 4000
export const DEFAULT_LINE_WEIGHT = 20

/** Working resolution for the algorithm (square). 400–500px recommended. */
const WORK_SIZE = 400

/** Map UI line weight (5–50) to thread opacity (0.1–0.2). */
function lineWeightToOpacity(lineWeight: number): number {
  return 0.1 + (Math.max(5, Math.min(50, lineWeight)) - 5) / 45 * 0.1
}

export interface NailPosition {
  x: number
  y: number
}

export interface Segment {
  from: number
  to: number
  color: { r: number; g: number; b: number; a: number }
  colorIndex: number
}

export type ShapeKind = 'circle' | 'square' | 'heart'

export interface StringArtResult {
  sequence: number[]
  segments: Segment[]
  segmentColors: { r: number; g: number; b: number; a: number }[]
  nailPositions: NailPosition[]
  width: number
  height: number
  approximation: Uint8Array
  shape?: ShapeKind
}

export function suggestIterations(nailCount: number, perceptionBlurFactor = 1): number {
  const d = Math.max(1, Number(perceptionBlurFactor) || 1)
  const base = Math.round(nailCount * 35 * (d / 4))
  const min = 1500
  const max = 15000
  return Math.min(max, Math.max(min, base))
}

export function suggestClassicIterations(nailCount: number): number {
  const base = Math.round(nailCount * 14)
  return Math.max(1200, Math.min(6000, base))
}

export function suggestNailCountFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  min = 140,
  max = 380
): number {
  const width = sourceCanvas.width
  const height = sourceCanvas.height
  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return Math.round((min + max) / 2)
  const { data } = ctx.getImageData(0, 0, width, height)
  let gradSum = 0
  let varSum = 0
  let mean = 0
  const n = width * height
  for (let i = 0; i < n; i++) mean += data[i * 4]
  mean /= Math.max(1, n)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4
      const gx = Math.abs(data[i - 4]! - data[i + 4]!)
      const gy = Math.abs(data[i - width * 4]! - data[i + width * 4]!)
      gradSum += gx + gy
      const d = data[i]! - mean
      varSum += d * d
    }
  }
  const sampleCount = Math.max(1, (width - 2) * (height - 2))
  const gradNorm = Math.min(1, gradSum / (sampleCount * 255 * 2))
  const stdNorm = Math.min(1, Math.sqrt(varSum / sampleCount) / 128)
  const complexity = Math.max(0, Math.min(1, gradNorm * 0.65 + stdNorm * 0.35))
  const suggested = Math.round(min + (max - min) * complexity)
  return Math.max(min, Math.min(max, suggested))
}

export function estimateThreadUsage(
  segments: Segment[],
  nailPositions: NailPosition[],
  width: number,
  height: number,
  canvasSizeInches: number,
  options: { wasteFactor?: number; bundleLengthMeters?: number; spoolLengthMeters?: number } = {}
): { totalMeters: number; totalFeet: number; bundlesNeeded: number; spoolsNeeded: number } {
  const wasteFactor = Number(options.wasteFactor) > 0 ? Number(options.wasteFactor) : 1.12
  const bundleLengthMeters = Number(options.bundleLengthMeters) > 0 ? Number(options.bundleLengthMeters) : 100
  const spoolLengthMeters = Number(options.spoolLengthMeters) > 0 ? Number(options.spoolLengthMeters) : 1000
  const radiusPixels = Math.max(1, Math.min(width, height) / 2 - 2)
  const inchesPerPixel = canvasSizeInches / 2 / radiusPixels
  let totalPixels = 0
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]!
    const a = nailPositions[s.from]
    const b = nailPositions[s.to]
    if (!a || !b) continue
    totalPixels += Math.hypot(b.x - a.x, b.y - a.y)
  }
  const totalMeters = totalPixels * inchesPerPixel * 0.0254
  const adjustedMeters = totalMeters * wasteFactor
  const bundlesNeeded = adjustedMeters > 0 ? Math.ceil(adjustedMeters / bundleLengthMeters) : 0
  const spoolsNeeded = adjustedMeters > 0 ? Math.ceil(adjustedMeters / spoolLengthMeters) : 0
  return {
    totalMeters: adjustedMeters,
    totalFeet: adjustedMeters * 3.28084,
    bundlesNeeded,
    spoolsNeeded,
  }
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image.'))
    }
    img.src = url
  })
}

function boxBlur3(data: Uint8ClampedArray, width: number, height: number): void {
  const out = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += data[(ny * width + nx) * 4]!
            n++
          }
        }
      }
      const i = (y * width + x) * 4
      const v = Math.round(sum / n)
      out[i] = out[i + 1] = out[i + 2] = v
      out[i + 3] = 255
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = out[i]!
}

export function toGrayscaleSquare(
  image: HTMLImageElement,
  options: { smooth?: boolean } = {}
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const size = Math.min(image.width, image.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { canvas, width: size, height: size }
  const sx = (image.width - size) / 2
  const sy = (image.height - size) / 2
  ctx.drawImage(image, sx, sy, size, size, 0, 0, size, size)
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  if (options.smooth) boxBlur3(data, size, size)
  ctx.putImageData(imageData, 0, 0)
  return { canvas, width: size, height: size }
}

/**
 * Apply circle mask: set all pixels outside the circle to white (255)
 * so the B/W algorithm only targets the circle.
 */
export function applyCircleMask(canvas: HTMLCanvasElement): void {
  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) / 2 - 2
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy > r * r) {
        const i = (y * w + x) * 4
        data[i] = 255
        data[i + 1] = 255
        data[i + 2] = 255
        data[i + 3] = 255
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Get nail positions for the given shape. Circle = ring; square = perimeter; heart = parametric curve.
 */
export function getNailPositionsForShape(
  shape: ShapeKind,
  nailCount: number,
  width: number,
  height: number
): NailPosition[] {
  const cx = width / 2
  const cy = height / 2
  const size = Math.min(width, height) - 4
  const half = size / 2

  if (shape === 'circle') {
    const radius = half - 2
    const positions: NailPosition[] = []
    for (let i = 0; i < nailCount; i++) {
      const angle = (2 * Math.PI * i) / nailCount - Math.PI / 2
      positions.push({
        x: Math.round(cx + radius * Math.cos(angle)),
        y: Math.round(cy + radius * Math.sin(angle)),
      })
    }
    return positions
  }

  if (shape === 'square') {
    const positions: NailPosition[] = []
    const perSide = nailCount / 4
    for (let i = 0; i < nailCount; i++) {
      const side = Math.min(3, Math.floor(i / perSide))
      const t = (i / perSide) % 1
      let x: number
      let y: number
      if (side === 0) {
        x = cx - half + t * size
        y = cy - half
      } else if (side === 1) {
        x = cx + half
        y = cy - half + t * size
      } else if (side === 2) {
        x = cx + half - t * size
        y = cy + half
      } else {
        x = cx - half
        y = cy + half - t * size
      }
      positions.push({ x: Math.round(x), y: Math.round(y) })
    }
    return positions
  }

  // heart: parametric (0 to 2*PI)
  const positions: NailPosition[] = []
  const scale = (half - 4) / 16
  for (let i = 0; i < nailCount; i++) {
    const t = (2 * Math.PI * i) / nailCount
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    positions.push({
      x: Math.round(cx + x * scale),
      y: Math.round(cy + y * scale),
    })
  }
  return positions
}

export function getNailPositions(
  nailCount: number,
  width: number,
  height: number,
  shape: ShapeKind = 'circle'
): NailPosition[] {
  return getNailPositionsForShape(shape, nailCount, width, height)
}

function buildLineCache(nailPositions: NailPosition[]): { x: number; y: number }[][][] {
  const n = nailPositions.length
  const lineCache: { x: number; y: number }[][][] = Array.from({ length: n }, () => Array(n))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p0 = nailPositions[i]!
      const p1 = nailPositions[j]!
      const points = getLinePixels(p0.x, p0.y, p1.x, p1.y)
      lineCache[i]![j] = points
      lineCache[j]![i] = points
    }
  }
  return lineCache
}

const defaultThreadPalette = [
  { r: 0, g: 0, b: 0, a: 255 },
  { r: 35, g: 35, b: 35, a: 255 },
  { r: 75, g: 75, b: 75, a: 255 },
]

function clampToByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

/** Ring distance between two pin indices (for circular layout). */
function ringDistance(i: number, j: number, n: number): number {
  const d = Math.abs(i - j)
  return Math.min(d, n - d)
}

/**
 * Preprocess: resize source to WORK_SIZE, grayscale, normalize to 0–1, invert.
 * target[x,y] = 1 - grayscale so darker regions have higher value (need more threads).
 */
function buildTargetFromCanvas(sourceCanvas: HTMLCanvasElement): { target: Float32Array; width: number; height: number } {
  const w = WORK_SIZE
  const h = WORK_SIZE
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Could not get canvas context')
  ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, w, h)
  const id = ctx.getImageData(0, 0, w, h)
  const data = id.data
  const target = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4]!
    const g = data[i * 4 + 1]!
    const b = data[i * 4 + 2]!
    const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    target[i] = 1 - gray
  }
  return { target, width: w, height: h }
}

interface VrellisOptions {
  threadOpacity?: number
  minPinDistance?: number
  recentPinWindow?: number
  shape?: ShapeKind
  lineWeight?: number
}

/**
 * Petros Vrellis–style greedy line-selection algorithm.
 * Reconstructs the target image using straight lines between pins; at each step
 * picks the line that maximizes sum(target[p] - canvas[p]) and adds thread_opacity to canvas along that line.
 */
function runVrellisStyleModel(
  target: Float32Array,
  width: number,
  height: number,
  nailCount: number,
  maxLines: number,
  onProgress: (current: number, total: number) => void,
  onUpdate: ((state: Partial<StringArtResult>) => void) | null,
  updateEvery: number,
  lineCache: { x: number; y: number }[][][],
  nailPositions: NailPosition[],
  options: VrellisOptions
): StringArtResult {
  const threadOpacity = options.threadOpacity ?? 0.15
  const minPinDistance = options.minPinDistance ?? 10
  const recentPinWindow = options.recentPinWindow ?? 20
  const shape = options.shape ?? 'circle'
  const threadColor = defaultThreadPalette[0]!

  const n = nailCount
  const canvas = new Float32Array(width * height)

  const sequence: number[] = []
  const segments: Segment[] = []
  const segmentColors: { r: number; g: number; b: number; a: number }[] = []
  const recentEdgesMax = 80
  const recentEdges: [number, number][] = []

  const edgeKey = (a: number, b: number) => [Math.min(a, b), Math.max(a, b)] as [number, number]
  const isRecentEdge = (a: number, b: number) => {
    const key = edgeKey(a, b)
    for (let i = 0; i < recentEdges.length; i++) {
      if (recentEdges[i]![0] === key[0] && recentEdges[i]![1] === key[1]) return true
    }
    return false
  }

  let currentPin = Math.floor(Math.random() * n)
  sequence.push(currentPin)
  const recentPins: number[] = [currentPin]

  for (let iter = 0; iter < maxLines; iter++) {
    let bestPin = -1
    let bestScore = -1

    for (let j = 0; j < n; j++) {
      if (j === currentPin) continue
      if (ringDistance(currentPin, j, n) <= minPinDistance) continue
      if (recentPins.includes(j)) continue
      if (isRecentEdge(currentPin, j)) continue
      const points = lineCache[currentPin]![j]
      if (!points || points.length === 0) continue
      let score = 0
      for (let k = 0; k < points.length; k++) {
        const p = points[k]!
        if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) continue
        const idx = p.y * width + p.x
        score += target[idx]! - canvas[idx]!
      }
      if (score > bestScore) {
        bestScore = score
        bestPin = j
      }
    }

    if (bestPin < 0 || bestScore <= 0) break

    const points = lineCache[currentPin]![bestPin]!
    for (let k = 0; k < points.length; k++) {
      const p = points[k]!
      if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) continue
      const idx = p.y * width + p.x
      canvas[idx] = Math.min(1, canvas[idx]! + threadOpacity)
    }

    segments.push({ from: currentPin, to: bestPin, color: threadColor, colorIndex: 0 })
    segmentColors.push(threadColor)
    sequence.push(bestPin)
    recentEdges.push(edgeKey(currentPin, bestPin))
    if (recentEdges.length > recentEdgesMax) recentEdges.shift()
    currentPin = bestPin

    recentPins.push(bestPin)
    if (recentPins.length > recentPinWindow) recentPins.shift()

    onProgress(iter + 1, maxLines)
    if (onUpdate && ((iter + 1) % updateEvery === 0 || iter + 1 === maxLines)) {
      onUpdate({
        sequence: [...sequence],
        segments: [...segments],
        segmentColors: [...segmentColors],
        nailPositions,
        width,
        height,
        shape,
      })
    }
  }

  const approximation = new Uint8Array(width * height)
  for (let i = 0; i < approximation.length; i++) {
    approximation[i] = clampToByte(canvas[i]! * 255)
  }
  if (onUpdate) {
    onUpdate({
      sequence: [...sequence],
      segments: [...segments],
      segmentColors: [...segmentColors],
      nailPositions,
      width,
      height,
      shape,
    })
  }

  return {
    sequence,
    segments,
    segmentColors,
    nailPositions,
    width,
    height,
    approximation,
    shape,
  }
}

export interface RunStringArtOptions {
  shape?: ShapeKind
  perceptionBlurFactor?: number
  onUpdate?: (state: Partial<StringArtResult>) => void
  updateEvery?: number
  threadPalette?: { r: number; g: number; b: number; a: number }[]
  minNailDistance?: number
  lineWeight?: number
  recentPinWindow?: number
  /** Thread opacity per line (0.1–0.2). If set, overrides lineWeight-based opacity. */
  threadOpacity?: number
  algorithmModel?: 'classic' | 'advanced'
}

export function runStringArt(
  sourceCanvas: HTMLCanvasElement,
  nailCount: number,
  iterations: number,
  onProgress: (current: number, total: number) => void,
  options: RunStringArtOptions = {}
): Promise<StringArtResult> {
  const updateEvery = Math.max(10, options.updateEvery ?? 75)
  const shape = options.shape ?? 'circle'
  const lineWeight = options.lineWeight ?? 20
  const minPinDistance = options.minNailDistance ?? 10
  const recentPinWindow = options.recentPinWindow ?? 20
  const threadOpacity = options.threadOpacity ?? lineWeightToOpacity(lineWeight)

  let target: Float32Array
  let width: number
  let height: number
  try {
    const pre = buildTargetFromCanvas(sourceCanvas)
    target = pre.target
    width = pre.width
    height = pre.height
  } catch (e) {
    return Promise.reject(e)
  }

  const nailPositions = getNailPositionsForShape(shape, nailCount, width, height)
  const lineCache = buildLineCache(nailPositions)

  const result = runVrellisStyleModel(
    target,
    width,
    height,
    nailCount,
    iterations,
    onProgress,
    options.onUpdate ?? null,
    updateEvery,
    lineCache,
    nailPositions,
    { threadOpacity, minPinDistance, recentPinWindow, shape, lineWeight }
  )
  return Promise.resolve(result)
}

/**
 * Draw string art result to an offscreen canvas and return as PNG data URL (for download/preview).
 */
export function stringArtResultToDataUrl(result: StringArtResult, size = 512): string {
  const { nailPositions, segments, segmentColors, width, height } = result
  if (!nailPositions.length) return ''
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const scale = Math.min(size / width, size / height) * 0.9
  const centerX = size / 2
  const centerY = size / 2
  const toCanvas = (px: number, py: number) => [
    (px - width / 2) * scale + centerX,
    (py - height / 2) * scale + centerY,
  ] as const
  ctx.fillStyle = '#faf7f2'
  ctx.fillRect(0, 0, size, size)
  const lineCount = segments.length
  const alpha = Math.max(0.03, Math.min(0.25, 12 / Math.sqrt(lineCount)))
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(0.8, (size / 400) * 1.2)
  ctx.globalCompositeOperation = 'multiply'
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]!
    const a = nailPositions[s.from]
    const b = nailPositions[s.to]
    if (!a || !b) continue
    const [x0, y0] = toCanvas(a.x, a.y)
    const [x1, y1] = toCanvas(b.x, b.y)
    const c = s.color || segmentColors[i] || { r: 0, g: 0, b: 0, a: 255 }
    ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'
  const shape = result.shape ?? 'circle'
  const r = (Math.min(width, height) / 2 - 2) * scale
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'
  ctx.lineWidth = 1
  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
    ctx.stroke()
  } else if (shape === 'square') {
    ctx.strokeRect(centerX - r, centerY - r, r * 2, r * 2)
  } else if (shape === 'heart') {
    ctx.beginPath()
    const scaleH = r / 16
    for (let i = 0; i <= 50; i++) {
      const t = (2 * Math.PI * i) / 50
      const x = centerX + 16 * Math.pow(Math.sin(t), 3) * scaleH
      const y = centerY + (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scaleH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  ctx.fillStyle = '#111'
  nailPositions.forEach((p) => {
    const [x, y] = toCanvas(p.x, p.y)
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  })
  return canvas.toDataURL('image/png')
}
