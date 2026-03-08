import { useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, Image as ImageIcon, Grid3X3, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StringArtResult } from '@/lib/stringArt'
import { StringArtPreview } from '@/components/StringArtPreview'

export type ViewMode = 'original' | 'string-art' | 'nail-map'

interface PatternCanvasProps {
  originalImageUrl?: string | null
  stringArtResult?: StringArtResult | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
  isLoading?: boolean
  displaySize?: number
  className?: string
}

export function PatternCanvas({
  originalImageUrl,
  stringArtResult,
  viewMode,
  onViewModeChange,
  zoom = 1,
  onZoomChange,
  isLoading,
  displaySize = 360,
  className,
}: PatternCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoom = useCallback(
    (delta: number) => {
      const next = Math.max(0.25, Math.min(3, zoom + delta))
      onZoomChange?.(next)
    },
    [zoom, onZoomChange]
  )

  const hasRealResult = stringArtResult && stringArtResult.segments.length > 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border border-border bg-muted/20',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-3 py-2">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(
            [
              ['original', 'Original', ImageIcon],
              ['string-art', 'String art', Heart],
              ['nail-map', 'Nail map', Grid3X3],
            ] as const
          ).map(([mode, label, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleZoom(-0.25)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.25)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-sm">Generating your pattern…</span>
          </div>
        ) : viewMode === 'nail-map' ? (
          <div
            className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30"
            style={{
              width: 200,
              height: 200,
              backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.4) 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />
        ) : viewMode === 'string-art' && hasRealResult ? (
          <div
            className="transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <StringArtPreview
              result={stringArtResult}
              displaySize={Math.round(displaySize * zoom)}
              intensity={1}
            />
          </div>
        ) : viewMode === 'original' && originalImageUrl ? (
          <img
            src={originalImageUrl}
            alt="Original photo"
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        ) : viewMode === 'string-art' && !hasRealResult ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Heart className="h-12 w-12" />
            <span className="text-sm">Generate string art to see preview</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
            <span className="text-sm">Upload a photo to see preview</span>
          </div>
        )}
      </div>
    </div>
  )
}
