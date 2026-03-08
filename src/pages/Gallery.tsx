import { useNavigate } from 'react-router-dom'
import { GalleryGrid } from '@/components/GalleryGrid'

export function Gallery() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Gallery
        </h1>
        <p className="mt-2 text-muted-foreground">
          Inspiration from our community. Filter by style or start from one of these.
        </p>
      </div>
      <GalleryGrid onSelect={(id) => navigate(`/create?from=${id}`)} />
    </div>
  )
}
