import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Download, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewCardProps {
  previewImageUrl?: string | null
  title?: string
  kitContents?: string[]
  kitContentsTitle?: string
  price?: number
  onAddToCart?: () => void
  addToCartLabel?: string
  addToCartDisabled?: boolean
  onDownloadPdf?: () => void
  downloadLabel?: string
  onShare?: () => void
  className?: string
}

const DEFAULT_KIT_CONTENTS = [
  'Pre-drilled wooden board',
  'Enough nails for your pattern',
  'String in your chosen color',
  'Printed pattern guide',
  'Step-by-step instructions',
]

export function PreviewCard({
  previewImageUrl,
  title = 'Your String Art',
  kitContents = DEFAULT_KIT_CONTENTS,
  kitContentsTitle = 'Kit includes',
  price = 49,
  onAddToCart,
  addToCartLabel = 'Add to cart',
  addToCartDisabled = false,
  onDownloadPdf,
  downloadLabel = 'Download design',
  onShare,
  className,
}: PreviewCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted/30">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="String art preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No preview yet
            </div>
          )}
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            {kitContentsTitle}
          </h4>
          <ul className="space-y-1 text-sm">
            {kitContents.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-2xl font-bold">${price}</span>
          <span className="text-sm text-muted-foreground">+ shipping</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        {onAddToCart && (
          <Button className="w-full sm:flex-1" size="lg" onClick={onAddToCart} disabled={addToCartDisabled}>
            <ShoppingBag className="h-4 w-4" />
            {addToCartLabel}
          </Button>
        )}
        <div className="flex w-full gap-2 sm:w-auto">
          {onDownloadPdf && (
            <Button variant="outline" size="lg" onClick={onDownloadPdf} className="flex-1">
              <Download className="h-4 w-4" />
              {downloadLabel}
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="icon-lg" onClick={onShare} aria-label="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
