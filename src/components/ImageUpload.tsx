import { useCallback, useRef } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  previewUrl?: string | null
  disabled?: boolean
  accept?: string
  maxSizeMb?: number
  className?: string
}

export function ImageUpload({
  onFileSelect,
  previewUrl,
  disabled,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMb = 10,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > maxSizeMb * 1024 * 1024) {
        alert(`Please choose an image under ${maxSizeMb}MB.`)
        return
      }
      onFileSelect(file)
      e.target.value = ''
    },
    [onFileSelect, maxSizeMb]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith('image/')) {
        if (file.size > maxSizeMb * 1024 * 1024) {
          alert(`Please choose an image under ${maxSizeMb}MB.`)
          return
        }
        onFileSelect(file)
      }
    },
    [onFileSelect, disabled, maxSizeMb]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-all duration-200',
          'hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'min-h-[200px] overflow-hidden',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Upload preview"
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <span className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-foreground">
                <ImageIcon className="h-4 w-4" />
                Change photo
              </span>
            </div>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-12 w-12 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Drop your photo here or click to upload
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              JPG, PNG or WebP · max {maxSizeMb}MB
            </span>
          </>
        )}
      </button>
    </div>
  )
}
