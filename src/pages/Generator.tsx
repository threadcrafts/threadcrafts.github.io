import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ImageUpload } from '@/components/ImageUpload'
import { ParameterControls } from '@/components/ParameterControls'
import { PatternCanvas, type ViewMode } from '@/components/PatternCanvas'
import { KitConfigurator, type KitConfig } from '@/components/KitConfigurator'
import { PreviewCard } from '@/components/PreviewCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepProgressBar } from '@/components/StepProgressBar'
import type { ShapeOption } from '@/data/mock'
import { BOARD_SIZES, FRAME_OPTIONS, GIFT_PACKAGING } from '@/data/mock'
import {
  loadImage,
  toGrayscaleSquare,
  applyCircleMask,
  runStringArt,
  DEFAULT_NAIL_COUNT,
  DEFAULT_ITERATIONS,
  DEFAULT_LINE_WEIGHT,
  estimateThreadUsage,
  stringArtResultToDataUrl,
  type StringArtResult,
} from '@/lib/stringArt'
import { getOrderMessage, openInstagramOrder, getOrderFormUrl, submitOrderToBackend, generateOrderId, ORDER_SUBMIT_URL, ORDER_FORM_URL, KIT_ORDER } from '@/config/order'

const STEPS = [
  { id: '1', label: 'Upload & generate' },
  { id: '2', label: 'Customize kit' },
  { id: '3', label: 'Review & order' },
]

const defaultKitConfig: KitConfig = {
  boardSizeId: '12x12',
  frameId: 'natural',
  stringColorId: 'black',
  packagingId: 'gift',
  giftMessage: '',
}

const CANVAS_SIZE_INCHES = 12

export function Generator() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [nailCount, setNailCount] = useState(DEFAULT_NAIL_COUNT)
  const [lineCount, setLineCount] = useState(DEFAULT_ITERATIONS)
  const [lineWeight, setLineWeight] = useState(DEFAULT_LINE_WEIGHT)
  const [shape, setShape] = useState<ShapeOption>('circle')
  const [viewMode, setViewMode] = useState<ViewMode>('string-art')
  const [zoom, setZoom] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: DEFAULT_ITERATIONS })
  const [stringArtResult, setStringArtResult] = useState<StringArtResult | null>(null)
  const [orderMessageShown, setOrderMessageShown] = useState(false)
  const [orderViaForm, setOrderViaForm] = useState(false)
  const [orderSubmittedToBackend, setOrderSubmittedToBackend] = useState(false)
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderPhone, setOrderPhone] = useState('')
  const [orderEmail, setOrderEmail] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [addressLine3, setAddressLine3] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressCounty, setAddressCounty] = useState('')
  const [addressPostcode, setAddressPostcode] = useState('')
  const [kitConfig, setKitConfig] = useState<KitConfig>(defaultKitConfig)

  const handleFileSelect = useCallback((f: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setStringArtResult(null)
  }, [previewUrl])

  const handleGenerate = useCallback(async () => {
    if (!file) return
    setIsGenerating(true)
    setStringArtResult(null)
    setProgress({ current: 0, total: lineCount })
    try {
      const image = await loadImage(file)
      const { canvas } = toGrayscaleSquare(image, { smooth: true })
      if (shape === 'circle') applyCircleMask(canvas)
      const result = await runStringArt(
        canvas,
        nailCount,
        lineCount,
        (current, total) => setProgress({ current, total }),
        {
          algorithmModel: 'classic',
          shape,
          lineWeight,
          updateEvery: 100,
          onUpdate: (state) => {
            if (state.segments?.length && state.nailPositions && state.width != null && state.height != null) {
              setStringArtResult({
                sequence: state.sequence ?? [],
                segments: state.segments,
                segmentColors: state.segmentColors ?? [],
                nailPositions: state.nailPositions,
                width: state.width,
                height: state.height,
                approximation: new Uint8Array(state.width * state.height),
                shape,
              })
            }
          },
        }
      )
      setStringArtResult(result)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }, [file, nailCount, lineCount, lineWeight, shape])

  const boardPrice = BOARD_SIZES.find((b) => b.id === kitConfig.boardSizeId)?.price ?? 0
  const framePrice = FRAME_OPTIONS.find((f) => f.id === kitConfig.frameId)?.price ?? 0
  const packagingPrice = GIFT_PACKAGING.find((p) => p.id === kitConfig.packagingId)?.price ?? 0
  const totalPrice = boardPrice + framePrice + packagingPrice

  const boardSizeInches = BOARD_SIZES.find((b) => b.id === kitConfig.boardSizeId)?.label?.replace(/[^0-9]/g, '') ?? '12'
  const threadEstimate = stringArtResult
    ? estimateThreadUsage(
      stringArtResult.segments,
      stringArtResult.nailPositions,
      stringArtResult.width,
      stringArtResult.height,
      Number(boardSizeInches) || CANVAS_SIZE_INCHES
    )
    : null

  const previewImageUrl = useMemo(() => {
    if (stringArtResult) return stringArtResultToDataUrl(stringArtResult, 400)
    return previewUrl
  }, [stringArtResult, previewUrl])

  const handleOrderKit = useCallback(() => {
    const orderDetails = {
      nails: nailCount,
      lines: stringArtResult?.segments.length ?? lineCount,
      canvasSizeInches: Number(boardSizeInches) || CANVAS_SIZE_INCHES,
      threadMeters: threadEstimate ? threadEstimate.totalMeters.toFixed(1) : undefined,
      notes: kitConfig.giftMessage || undefined,
      giftMessage: kitConfig.giftMessage || undefined,
      boardSize: BOARD_SIZES.find((b) => b.id === kitConfig.boardSizeId)?.label ?? kitConfig.boardSizeId,
      frame: FRAME_OPTIONS.find((f) => f.id === kitConfig.frameId)?.label ?? kitConfig.frameId,
      packaging: GIFT_PACKAGING.find((p) => p.id === kitConfig.packagingId)?.label ?? kitConfig.packagingId,
      phone: orderPhone.trim() || undefined,
      email: orderEmail.trim() || undefined,
      addressLine1: addressLine1.trim() || undefined,
      addressLine2: addressLine2.trim() || undefined,
      addressLine3: addressLine3.trim() || undefined,
      city: addressCity.trim() || undefined,
      county: addressCounty.trim() || undefined,
      postcode: addressPostcode.trim() || undefined,
    }
    if (ORDER_SUBMIT_URL?.trim()) {
      if (orderSubmittedToBackend || isSubmittingOrder) return
      if (!orderPhone.trim()) {
        alert('Please enter your phone number so we can contact you on WhatsApp.')
        return
      }
      if (!orderEmail.trim()) {
        alert('Please enter your email address so we can send your order confirmation.')
        return
      }
      const emailTrim = orderEmail.trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
        alert('Please enter a valid email address.')
        return
      }
      setIsSubmittingOrder(true)
      const orderId = generateOrderId()
      const designDataUrl = stringArtResult ? stringArtResultToDataUrl(stringArtResult, 1024) : null
      const sent = submitOrderToBackend(orderDetails, designDataUrl, orderId)
      if (sent) {
        setOrderViaForm(true)
        setOrderSubmittedToBackend(true)
        setSubmittedOrderId(orderId)
        setOrderMessageShown(true)
      }
      setIsSubmittingOrder(false)
      return
    }
    if (ORDER_FORM_URL?.trim()) {
      if (stringArtResult) {
        const dataUrl = stringArtResultToDataUrl(stringArtResult, 1024)
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `thread-crafts-string-art-${Date.now()}.png`
        a.click()
      }
      const formUrl = getOrderFormUrl(orderDetails)
      if (formUrl) window.open(formUrl, '_blank', 'noopener,noreferrer')
      const message = getOrderMessage(orderDetails)
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => { })
      setOrderViaForm(true)
    } else {
      const message = getOrderMessage(orderDetails)
      openInstagramOrder(message)
      setOrderViaForm(false)
    }
    setOrderMessageShown(true)
  }, [nailCount, stringArtResult, lineCount, boardSizeInches, threadEstimate, kitConfig, orderSubmittedToBackend, isSubmittingOrder, orderPhone, orderEmail, addressLine1, addressLine2, addressLine3, addressCity, addressCounty, addressPostcode])

  const handleDownloadDesign = useCallback(() => {
    if (!stringArtResult) return
    const dataUrl = stringArtResultToDataUrl(stringArtResult, 1024)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `thread-crafts-string-art-${Date.now()}.png`
    a.click()
  }, [stringArtResult])

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Create your string art
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a photo, adjust the pattern, then customize and order your kit.
        </p>
        <StepProgressBar steps={STEPS} currentStep={step} className="mt-6 max-w-md" />
      </div>

      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <ImageUpload
              onFileSelect={handleFileSelect}
              previewUrl={previewUrl}
              disabled={isGenerating}
            />
            <ParameterControls
              nailCount={nailCount}
              onNailCountChange={setNailCount}
              lineCount={lineCount}
              onLineCountChange={setLineCount}
              lineWeight={lineWeight}
              onLineWeightChange={setLineWeight}
              shape={shape}
              onShapeChange={(s) => {
                setShape(s)
                setStringArtResult(null)
              }}
              disabled={isGenerating}
            />
            {isGenerating && (
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (progress.current / progress.total) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()} lines
                </p>
              </div>
            )}
            <Button
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={!file || isGenerating}
            >
              {isGenerating ? 'Generating…' : 'Generate string art'}
            </Button>
          </div>
          <PatternCanvas
            originalImageUrl={previewUrl}
            stringArtResult={stringArtResult}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            zoom={zoom}
            onZoomChange={setZoom}
            isLoading={isGenerating}
            displaySize={360}
            className="min-h-[400px]"
          />
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl space-y-6"
        >
          <div className="rounded-xl border-2 border-accent/40 bg-accent/5 p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold text-foreground">Your number to contact you</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              We&apos;ll use this to reach you on WhatsApp with payment and tracking. Required.
            </p>
            <div className="mb-4">
              <Label htmlFor="order-phone-step1" className="text-sm font-medium text-foreground">Phone number (required)</Label>
              <Input
                id="order-phone-step1"
                type="tel"
                placeholder="e.g. +44 7700 900000"
                value={orderPhone}
                onChange={(e) => setOrderPhone(e.target.value)}
                className="mt-2 w-full"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="order-email-step1" className="text-sm font-medium text-foreground">Email (required)</Label>
              <Input
                id="order-email-step1"
                type="email"
                placeholder="e.g. you@example.com"
                value={orderEmail}
                onChange={(e) => setOrderEmail(e.target.value)}
                className="mt-2 w-full"
              />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">Shipping address (where you want it shipped)</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Full delivery address for your kit.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="addr-line1-s1" className="text-sm font-medium text-foreground">First line</Label>
                <Input id="addr-line1-s1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street and number" className="mt-1 w-full" />
              </div>
              <div>
                <Label htmlFor="addr-line2-s1" className="text-sm font-medium text-foreground">Second line</Label>
                <Input id="addr-line2-s1" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className="mt-1 w-full" />
              </div>
              <div>
                <Label htmlFor="addr-line3-s1" className="text-sm font-medium text-foreground">Third line</Label>
                <Input id="addr-line3-s1" value={addressLine3} onChange={(e) => setAddressLine3(e.target.value)} placeholder="(optional)" className="mt-1 w-full" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="addr-city-s1" className="text-sm font-medium text-foreground">City</Label>
                  <Input id="addr-city-s1" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="City" className="mt-1 w-full" />
                </div>
                <div>
                  <Label htmlFor="addr-county-s1" className="text-sm font-medium text-foreground">County</Label>
                  <Input id="addr-county-s1" value={addressCounty} onChange={(e) => setAddressCounty(e.target.value)} placeholder="County" className="mt-1 w-full" />
                </div>
                <div>
                  <Label htmlFor="addr-postcode-s1" className="text-sm font-medium text-foreground">Postcode</Label>
                  <Input id="addr-postcode-s1" value={addressPostcode} onChange={(e) => setAddressPostcode(e.target.value)} placeholder="Postcode" className="mt-1 w-full" />
                </div>
              </div>
            </div>
          </div>
          <KitConfigurator config={kitConfig} onChange={setKitConfig} />
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl space-y-6"
        >
          {orderSubmittedToBackend && submittedOrderId ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mx-auto max-w-md space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                    <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Your order has been submitted successfully
                </h2>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order ID</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-foreground">{submittedOrderId}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Save this for your records</p>
                </div>
                <p className="text-muted-foreground">
                  Expect a message from us on your WhatsApp number with tracking and how to pay for the order.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border-2 border-border bg-card p-5 shadow-sm">
                <h3 className="mb-1 text-base font-semibold text-foreground">Your number to contact you</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {ORDER_SUBMIT_URL?.trim()
                    ? "We'll contact you on WhatsApp and by email with payment and tracking. Both required."
                    : "Include this when you message us so we can get in touch."}
                </p>
                <div className="mb-4">
                  <Label htmlFor="order-phone" className="text-sm font-medium text-foreground">Phone number (required)</Label>
                  <Input
                    id="order-phone"
                    type="tel"
                    placeholder="e.g. +44 7700 900000"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    className="mt-2 w-full"
                  />
                </div>
                <div className="mb-6">
                  <Label htmlFor="order-email" className="text-sm font-medium text-foreground">Email (required)</Label>
                  <Input
                    id="order-email"
                    type="email"
                    placeholder="e.g. you@example.com"
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                    className="mt-2 w-full"
                  />
                </div>
                <h3 className="mb-1 text-base font-semibold text-foreground">Shipping address (where you want it shipped)</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Full delivery address for your kit.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="addr-line1" className="text-sm font-medium text-foreground">First line</Label>
                    <Input id="addr-line1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street and number" className="mt-1 w-full" />
                  </div>
                  <div>
                    <Label htmlFor="addr-line2" className="text-sm font-medium text-foreground">Second line</Label>
                    <Input id="addr-line2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className="mt-1 w-full" />
                  </div>
                  <div>
                    <Label htmlFor="addr-line3" className="text-sm font-medium text-foreground">Third line</Label>
                    <Input id="addr-line3" value={addressLine3} onChange={(e) => setAddressLine3(e.target.value)} placeholder="(optional)" className="mt-1 w-full" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="addr-city" className="text-sm font-medium text-foreground">City</Label>
                      <Input id="addr-city" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="City" className="mt-1 w-full" />
                    </div>
                    <div>
                      <Label htmlFor="addr-county" className="text-sm font-medium text-foreground">County</Label>
                      <Input id="addr-county" value={addressCounty} onChange={(e) => setAddressCounty(e.target.value)} placeholder="County" className="mt-1 w-full" />
                    </div>
                    <div>
                      <Label htmlFor="addr-postcode" className="text-sm font-medium text-foreground">Postcode</Label>
                      <Input id="addr-postcode" value={addressPostcode} onChange={(e) => setAddressPostcode(e.target.value)} placeholder="Postcode" className="mt-1 w-full" />
                    </div>
                  </div>
                </div>
              </div>
              <PreviewCard
                previewImageUrl={previewImageUrl}
                price={totalPrice}
                kitContents={[
                  'Step-by-step guide to build',
                  `Nails required (${nailCount})`,
                  'Premium black thread spool',
                  'Small hammer',
                  'Printed canvas with all nail positions',
                ]}
                kitContentsTitle="What's in your kit"
                onAddToCart={handleOrderKit}
                addToCartLabel={
                  ORDER_SUBMIT_URL?.trim()
                    ? isSubmittingOrder
                      ? 'Submitting…'
                      : 'Submit order'
                    : ORDER_FORM_URL?.trim()
                      ? 'Open order form'
                      : 'Order kit on Instagram'
                }
                addToCartDisabled={isSubmittingOrder || (!!ORDER_SUBMIT_URL?.trim() && (!orderPhone.trim() || !orderEmail.trim()))}
                onDownloadPdf={stringArtResult ? handleDownloadDesign : undefined}
                downloadLabel="Download design"
                onShare={() => {
                  if (stringArtResult) handleDownloadDesign()
                }}
              />
            </>
          )}
          {orderMessageShown && !orderSubmittedToBackend && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground">
              {orderViaForm ? (
                <>
                  <strong>Order form opened.</strong> Your design has been downloaded. Attach the design file in the form (check your Downloads folder) and submit. Order details are copied to the clipboard if you need to paste them.
                </>
              ) : (
                <>
                  <strong>Message copied!</strong> We&apos;ve opened Instagram. Tap <strong>Message</strong> on {KIT_ORDER.instagramHandle}&apos;s profile, paste (Ctrl+V or Cmd+V), then attach your design (download below) and send.
                </>
              )}
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-10 flex justify-between">
        {orderSubmittedToBackend && submittedOrderId ? (
          <div className="flex w-full justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setOrderSubmittedToBackend(false)
                setSubmittedOrderId(null)
                setOrderMessageShown(false)
                setOrderViaForm(false)
                setStep(0)
              }}
            >
              Create another design
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button
                onClick={handleOrderKit}
                disabled={isSubmittingOrder || (ORDER_SUBMIT_URL?.trim() ? orderSubmittedToBackend : false) || (!!ORDER_SUBMIT_URL?.trim() && (!orderPhone.trim() || !orderEmail.trim()))}
              >
                {ORDER_SUBMIT_URL?.trim()
                  ? isSubmittingOrder
                    ? 'Submitting…'
                    : 'Submit order'
                  : ORDER_FORM_URL?.trim()
                    ? 'Open order form'
                    : 'Order kit on Instagram'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
