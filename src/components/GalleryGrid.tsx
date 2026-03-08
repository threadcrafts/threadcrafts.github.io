import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GALLERY_ITEMS } from '@/data/mock'
import { cn } from '@/lib/utils'

type StyleFilter = 'all' | (typeof GALLERY_ITEMS)[number]['style']

const STYLE_OPTIONS: { value: StyleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'botanical', label: 'Botanical' },
]

interface GalleryGridProps {
  items?: typeof GALLERY_ITEMS
  onSelect?: (id: string) => void
  className?: string
}

export function GalleryGrid({
  items = GALLERY_ITEMS,
  onSelect,
  className,
}: GalleryGridProps) {
  const [filter, setFilter] = useState<StyleFilter>('all')
  const filtered =
    filter === 'all'
      ? items
      : items.filter((i) => i.style === filter)

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-wrap gap-2">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              filter === opt.value
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <motion.ul
        layout
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <button
                type="button"
                onClick={() => onSelect?.(item.id)}
                className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:border-accent/30 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="aspect-square overflow-hidden bg-muted/30">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="text-left">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-white/80">{item.occasion}</p>
                  </div>
                </div>
                <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
                  {item.style}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  )
}
