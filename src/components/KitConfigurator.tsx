import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BOARD_SIZES,
  FRAME_OPTIONS,
  STRING_COLORS,
  GIFT_PACKAGING,
} from '@/data/mock'
import { cn } from '@/lib/utils'

export interface KitConfig {
  boardSizeId: string
  frameId: string
  stringColorId: string
  packagingId: string
  giftMessage: string
}

interface KitConfiguratorProps {
  config: KitConfig
  onChange: (config: KitConfig) => void
  className?: string
}

export function KitConfigurator({ config, onChange, className }: KitConfiguratorProps) {
  const update = (patch: Partial<KitConfig>) => onChange({ ...config, ...patch })

  const boardPrice = BOARD_SIZES.find((b) => b.id === config.boardSizeId)?.price ?? 0
  const framePrice = FRAME_OPTIONS.find((f) => f.id === config.frameId)?.price ?? 0
  const packagingPrice = GIFT_PACKAGING.find((p) => p.id === config.packagingId)?.price ?? 0
  const subtotal = boardPrice + framePrice + packagingPrice

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Board size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BOARD_SIZES.map((size) => (
            <label
              key={size.id}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-3 transition-colors',
                config.boardSizeId === size.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/30'
              )}
            >
              <input
                type="radio"
                name="boardSize"
                value={size.id}
                checked={config.boardSizeId === size.id}
                onChange={() => update({ boardSizeId: size.id })}
                className="sr-only"
              />
              <div>
                <span className="font-medium">{size.label}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {size.description}
                </span>
              </div>
              <span className="font-semibold text-accent">${size.price}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frame</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {FRAME_OPTIONS.map((frame) => (
              <label
                key={frame.id}
                className={cn(
                  'cursor-pointer rounded-lg border-2 px-3 py-2 text-sm transition-colors',
                  config.frameId === frame.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/30'
                )}
              >
                <input
                  type="radio"
                  name="frame"
                  value={frame.id}
                  checked={config.frameId === frame.id}
                  onChange={() => update({ frameId: frame.id })}
                  className="sr-only"
                />
                {frame.label}
                {frame.price > 0 && (
                  <span className="ml-1 text-muted-foreground">+${frame.price}</span>
                )}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">String color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STRING_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => update({ stringColorId: color.id })}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-colors',
                  config.stringColorId === color.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/30'
                )}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-border"
                  style={{
                    background: color.hex,
                  }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gift packaging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {GIFT_PACKAGING.map((pkg) => (
            <label
              key={pkg.id}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-3 transition-colors',
                config.packagingId === pkg.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/30'
              )}
            >
              <input
                type="radio"
                name="packaging"
                value={pkg.id}
                checked={config.packagingId === pkg.id}
                onChange={() => update({ packagingId: pkg.id })}
                className="sr-only"
              />
              <span className="font-medium">{pkg.label}</span>
              {pkg.price > 0 ? (
                <span className="font-semibold text-accent">+${pkg.price}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Included</span>
              )}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personalized message (optional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            We'll include this note with your gift.
          </p>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g. Happy anniversary! With love always."
            value={config.giftMessage}
            onChange={(e) => update({ giftMessage: e.target.value })}
            className="resize-none"
          />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Kit subtotal</span>
          <span className="font-semibold">${subtotal}</span>
        </div>
      </div>
    </div>
  )
}
