import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { ShapeOption } from '@/data/mock'
interface ParameterControlsProps {
  nailCount: number
  onNailCountChange: (v: number) => void
  lineCount: number
  onLineCountChange: (v: number) => void
  lineWeight: number
  onLineWeightChange: (v: number) => void
  shape: ShapeOption
  onShapeChange: (s: ShapeOption) => void
  disabled?: boolean
  className?: string
}

const SHAPES: { value: ShapeOption; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'heart', label: 'Heart' },
]

export function ParameterControls({
  nailCount,
  onNailCountChange,
  lineCount,
  onLineCountChange,
  lineWeight,
  onLineWeightChange,
  shape,
  onShapeChange,
  disabled,
  className,
}: ParameterControlsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Number of pins</Label>
        <div className="flex items-center gap-3">
          <Slider
            min={72}
            max={500}
            step={4}
            value={nailCount}
            onValueChange={onNailCountChange}
            className="flex-1"
            disabled={disabled}
          />
          <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
            {nailCount}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          More pins = finer detail (default 288)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Number of lines</Label>
        <div className="flex items-center gap-3">
          <Slider
            min={500}
            max={15000}
            step={100}
            value={lineCount}
            onValueChange={onLineCountChange}
            className="flex-1"
            disabled={disabled}
          />
          <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
            {lineCount.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          More lines = richer contrast (default 4000)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Line weight</Label>
        <div className="flex items-center gap-3">
          <Slider
            min={5}
            max={50}
            step={1}
            value={lineWeight}
            onValueChange={onLineWeightChange}
            className="flex-1"
            disabled={disabled}
          />
          <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
            {lineWeight}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Heavier lines = bolder result (default 20)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Shape</Label>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onShapeChange(s.value)}
              disabled={disabled}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
                shape === s.value
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border bg-muted/50 text-foreground hover:border-accent/50 hover:bg-accent/5'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
