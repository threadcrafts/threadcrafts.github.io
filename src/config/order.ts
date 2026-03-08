const INSTAGRAM_HANDLE = 'threadcraftuk'
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`
export const INSTAGRAM_DIRECT_URL = `https://www.instagram.com/direct/t/${INSTAGRAM_HANDLE}/`

export const KIT_ORDER = {
  instagramHandle: `@${INSTAGRAM_HANDLE}`,
  instagramUrl: INSTAGRAM_URL,
}

/** If set, "Submit order" sends order + design image to this URL (e.g. Google Apps Script). No form UI — fully white-label. */
export const ORDER_SUBMIT_URL: string | undefined = import.meta.env.VITE_ORDER_SUBMIT_URL as string | undefined

/** If set and ORDER_SUBMIT_URL is not, "Order kit" opens this form and downloads the design for the user to attach. */
export const ORDER_FORM_URL: string | undefined = import.meta.env.VITE_ORDER_FORM_URL as string | undefined

export interface OrderDetails {
  nails?: number
  lines?: number
  canvasSizeInches?: number
  threadMeters?: string
  occasion?: string
  recipient?: string
  neededBy?: string
  notes?: string
  boardSize?: string
  frame?: string
  packaging?: string
  giftMessage?: string
  phone?: string
  email?: string
  shippingAddress?: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  city?: string
  county?: string
  postcode?: string
}

/** Generate a short, unique order ID for display and sheet. */
export function generateOrderId(): string {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TC-${t}-${r}`
}

/**
 * Build the prewritten message for Instagram DM. User copies and pastes when ordering.
 * Design is not uploaded anywhere; user downloads and attaches it if ordering via Instagram.
 */
export function getOrderMessage(details: OrderDetails = {}): string {
  const {
    nails = '',
    lines = '',
    canvasSizeInches = '',
    threadMeters = '',
    occasion = '',
    recipient = '',
    neededBy = '',
    notes = '',
  } = details
  const linesArr = [
    `Hi ${KIT_ORDER.instagramHandle}! I'd like to order a custom string art kit.`,
    '',
    occasion ? `Occasion: ${occasion}` : null,
    recipient ? `Gift for: ${recipient}` : null,
    neededBy ? `Needed by: ${neededBy}` : null,
    canvasSizeInches ? `Canvas size: ${canvasSizeInches}"` : null,
    nails ? `Nails: ${nails}` : null,
    lines ? `Lines: ${lines}` : null,
    threadMeters ? `Estimated thread needed: ${threadMeters} m` : null,
    notes ? `Notes: ${notes}` : null,
    '',
    "I'll attach my design image in the chat. Please share pricing and shipping details.",
  ]
    .filter(Boolean)
    .join('\n')
  return linesArr
}

/**
 * Open Instagram and prepare order message. Instagram does not allow third-party sites to
 * pre-fill DM text for security reasons, so we copy the message and open their profile.
 * User pastes (Ctrl+V / Cmd+V) and attaches the design (downloaded from the app).
 */
export function openInstagramOrder(message: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(message).catch(() => { })
  }
  window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer')
}

/**
 * Build a pre-filled Google Form URL if entry IDs are configured.
 * Set VITE_ORDER_FORM_ENTRY_* in .env to the entry IDs from your form's "Get pre-filled link".
 */
export function getOrderFormUrl(details: OrderDetails): string {
  const base = ORDER_FORM_URL?.trim()
  if (!base) return ''
  const entryNails = import.meta.env.VITE_ORDER_FORM_ENTRY_NAILS as string | undefined
  const entryLines = import.meta.env.VITE_ORDER_FORM_ENTRY_LINES as string | undefined
  const entryCanvas = import.meta.env.VITE_ORDER_FORM_ENTRY_CANVAS as string | undefined
  const entryNotes = import.meta.env.VITE_ORDER_FORM_ENTRY_NOTES as string | undefined
  const params = new URLSearchParams()
  if (entryNails && details.nails != null) params.set(`entry.${entryNails}`, String(details.nails))
  if (entryLines && details.lines != null) params.set(`entry.${entryLines}`, String(details.lines))
  if (entryCanvas && details.canvasSizeInches != null) params.set(`entry.${entryCanvas}`, String(details.canvasSizeInches))
  if (entryNotes && details.notes) params.set(`entry.${entryNotes}`, details.notes)
  const qs = params.toString()
  return qs ? `${base.replace(/\?.*$/, '')}?${qs}` : base
}

function getBase64FromDataUrl(dataUrl: string): string {
  const i = dataUrl.indexOf(',')
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl
}

/**
 * Submit order and design image to the backend (e.g. Google Apps Script).
 * Uses form POST so the image is sent automatically — no CORS, no user attach.
 * Response loads in a hidden iframe so the user never leaves your app or sees the backend.
 * Pass orderId so the sheet and success message can show it.
 */
export function submitOrderToBackend(
  details: OrderDetails,
  designDataUrl: string | null,
  orderId: string
): boolean {
  const url = ORDER_SUBMIT_URL?.trim()
  if (!url) return false
  const iframe = document.createElement('iframe')
  iframe.name = 'order-submit-frame'
  iframe.style.display = 'none'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  form.target = 'order-submit-frame'
  form.style.display = 'none'
  const fields: [string, string][] = [
    ['orderId', orderId],
    ['nails', String(details.nails ?? '')],
    ['lines', String(details.lines ?? '')],
    ['canvasSizeInches', String(details.canvasSizeInches ?? '')],
    ['threadMeters', details.threadMeters ?? ''],
    ['boardSize', details.boardSize ?? ''],
    ['frame', details.frame ?? ''],
    ['packaging', details.packaging ?? ''],
    ['giftMessage', details.giftMessage ?? details.notes ?? ''],
    ['phone', details.phone ?? ''],
    ['email', details.email ?? ''],
    ['addressLine1', details.addressLine1 ?? ''],
    ['addressLine2', details.addressLine2 ?? ''],
    ['addressLine3', details.addressLine3 ?? ''],
    ['city', details.city ?? ''],
    ['county', details.county ?? ''],
    ['postcode', details.postcode ?? ''],
  ]
  for (const [name, value] of fields) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  if (designDataUrl) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'image_base64'
    input.value = getBase64FromDataUrl(designDataUrl)
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
  setTimeout(() => document.body.removeChild(iframe), 5000)
  return true
}
