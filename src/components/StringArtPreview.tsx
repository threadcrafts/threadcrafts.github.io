import { useRef, useEffect } from 'react'
import type { StringArtResult, ShapeKind } from '@/lib/stringArt'

const PREVIEW_SUPERSAMPLE = 2

interface StringArtPreviewProps {
  result: StringArtResult
  displaySize?: number
  intensity?: number
  className?: string
}

/**
 * Renders the string-art result: nails + lines with shape boundary (circle, square, or heart).
 */
export function StringArtPreview({
  result,
  displaySize = 400,
  intensity = 1,
  className,
}: StringArtPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { nailPositions, segments, segmentColors, width, height, shape: resultShape } = result
  const shape: ShapeKind = resultShape ?? 'circle'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !nailPositions.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = displaySize
    const renderSize = displaySize * PREVIEW_SUPERSAMPLE
    const offscreen = document.createElement('canvas')
    offscreen.width = renderSize
    offscreen.height = renderSize
    const octx = offscreen.getContext('2d')
    if (!octx) return

    const padding = Math.round(24 * (displaySize / 560)) * PREVIEW_SUPERSAMPLE
    const drawSize = renderSize - 2 * padding
    const scale = Math.min(drawSize / width, drawSize / height, PREVIEW_SUPERSAMPLE)
    const centerX = renderSize / 2
    const centerY = renderSize / 2

    const intensityFactor = Math.max(0.6, Math.min(1.8, intensity))
    const lineCount = segments.length
    const dynamicAlpha = Math.max(0.01, Math.min(0.55, (12 / Math.sqrt(lineCount)) * intensityFactor))
    const lineWidth = Math.max(0.45, (displaySize / 560) * 0.95) * PREVIEW_SUPERSAMPLE

    octx.fillStyle = '#faf7f2'
    octx.fillRect(0, 0, renderSize, renderSize)

    const toCanvas = (px: number, py: number) => {
      const nx = (px - width / 2) * scale + centerX
      const ny = (py - height / 2) * scale + centerY
      return [nx, ny] as const
    }

    octx.lineCap = 'round'
    octx.lineJoin = 'round'
    octx.lineWidth = lineWidth
    octx.globalCompositeOperation = 'multiply'

    const drawThread = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      c: { r: number; g: number; b: number }
    ) => {
      octx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${(dynamicAlpha * 0.45).toFixed(3)})`
      octx.lineWidth = lineWidth * 1.8
      octx.beginPath()
      octx.moveTo(x0, y0)
      octx.lineTo(x1, y1)
      octx.stroke()
      octx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${dynamicAlpha.toFixed(3)})`
      octx.lineWidth = lineWidth
      octx.beginPath()
      octx.moveTo(x0, y0)
      octx.lineTo(x1, y1)
      octx.stroke()
    }

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i]!
      const a = nailPositions[s.from]
      const b = nailPositions[s.to]
      if (!a || !b) continue
      const [x0, y0] = toCanvas(a.x, a.y)
      const [x1, y1] = toCanvas(b.x, b.y)
      const c = s.color || segmentColors[i] || { r: 0, g: 0, b: 0, a: 255 }
      drawThread(x0, y0, x1, y1, c)
    }

    octx.globalCompositeOperation = 'source-over'
    const r = Math.min(width, height) / 2 - 2
    const rCanvas = r * scale
    octx.strokeStyle = 'rgba(0,0,0,0.22)'
    octx.lineWidth = PREVIEW_SUPERSAMPLE
    if (shape === 'circle') {
      octx.beginPath()
      octx.arc(centerX, centerY, rCanvas, 0, Math.PI * 2)
      octx.stroke()
    } else if (shape === 'square') {
      octx.strokeRect(centerX - rCanvas, centerY - rCanvas, rCanvas * 2, rCanvas * 2)
    } else if (shape === 'heart') {
      octx.beginPath()
      const scaleH = rCanvas / 16
      for (let i = 0; i <= 50; i++) {
        const t = (2 * Math.PI * i) / 50
        const x = centerX + 16 * Math.pow(Math.sin(t), 3) * scaleH
        const y = centerY + (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scaleH
        if (i === 0) octx.moveTo(x, y)
        else octx.lineTo(x, y)
      }
      octx.closePath()
      octx.stroke()
    }

    const nailRadius = Math.max(1.5, 2.5 * (displaySize / 560)) * PREVIEW_SUPERSAMPLE
    octx.fillStyle = '#111'
    nailPositions.forEach((p) => {
      const [x, y] = toCanvas(p.x, p.y)
      octx.beginPath()
      octx.arc(x, y, nailRadius, 0, Math.PI * 2)
      octx.fill()
    })

    ctx.clearRect(0, 0, size, size)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(offscreen, 0, 0, renderSize, renderSize, 0, 0, size, size)
  }, [result, displaySize, intensity, nailPositions, segments, segmentColors, width, height, shape])

  if (!nailPositions.length) return null

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      className={className}
      style={{ maxWidth: '100%' }}
      aria-label="String art preview"
    />
  )
}
