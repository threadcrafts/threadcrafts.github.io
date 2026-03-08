export const GALLERY_ITEMS = [
  {
    id: '1',
    title: 'Wedding portrait',
    style: 'portrait',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
    occasion: 'Wedding',
  },
  {
    id: '2',
    title: 'Pet portrait',
    style: 'portrait',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    occasion: 'Birthday',
  },
  {
    id: '3',
    title: 'Mountain landscape',
    style: 'landscape',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    occasion: 'Anniversary',
  },
  {
    id: '4',
    title: 'Family moment',
    style: 'portrait',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop',
    occasion: 'Wedding',
  },
  {
    id: '5',
    title: 'Minimal silhouette',
    style: 'minimal',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    occasion: 'Anniversary',
  },
  {
    id: '6',
    title: 'Botanical',
    style: 'botanical',
    imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=400&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=400&fit=crop',
    occasion: 'Birthday',
  },
] as const

export const TESTIMONIALS = [
  {
    id: '1',
    quote: 'Turned our wedding photo into the most unique gift. Everyone asked where we got it!',
    author: 'Sarah & Mike',
    occasion: 'Wedding',
    rating: 5,
  },
  {
    id: '2',
    quote: 'My mum cried when she saw her portrait. The kit was easy to follow and the result is stunning.',
    author: 'Emma L.',
    occasion: "Mother's Day",
    rating: 5,
  },
  {
    id: '3',
    quote: 'Perfect anniversary surprise. The quality of the board and string exceeded expectations.',
    author: 'James K.',
    occasion: 'Anniversary',
    rating: 5,
  },
] as const

export const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  "Mother's Day",
  "Father's Day",
  'Graduation',
  'Housewarming',
  'Just because',
] as const

export const BOARD_SIZES = [
  { id: '8x8', label: '8" × 8"', price: 34, description: 'Compact & charming' },
  { id: '12x12', label: '12" × 12"', price: 49, description: 'Most popular' },
  { id: '16x16', label: '16" × 16"', price: 69, description: 'Statement piece' },
  { id: '20x20', label: '20" × 20"', price: 89, description: 'Gallery worthy' },
] as const

export const FRAME_OPTIONS = [
  { id: 'none', label: 'No frame', price: 0 },
  { id: 'natural', label: 'Natural wood', price: 12 },
  { id: 'black', label: 'Black wood', price: 12 },
  { id: 'white', label: 'White wood', price: 12 },
  { id: 'gold', label: 'Gold metal', price: 18 },
] as const

export const STRING_COLORS = [
  { id: 'black', name: 'Black', hex: '#1a1a1a' },
  { id: 'white', name: 'White', hex: '#f5f5f5' },
  { id: 'navy', name: 'Navy', hex: '#1e3a5f' },
  { id: 'burgundy', name: 'Burgundy', hex: '#722f37' },
  { id: 'gold', name: 'Gold', hex: '#c9a227' },
  { id: 'forest', name: 'Forest green', hex: '#2d5a27' },
  { id: 'multi', name: 'Multi (color portrait)', hex: 'linear-gradient(90deg,#1a1a1a,#722f37,#c9a227)' },
] as const

export const GIFT_PACKAGING = [
  { id: 'standard', label: 'Standard packaging', price: 0 },
  { id: 'gift', label: 'Gift box + ribbon', price: 8 },
  { id: 'premium', label: 'Premium gift box + card', price: 14 },
] as const

export type ShapeOption = 'circle' | 'square' | 'heart'
