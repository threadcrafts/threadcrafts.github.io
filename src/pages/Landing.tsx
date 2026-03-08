import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Upload, Sparkles, Package, Quote } from 'lucide-react'
import { StepProgressBar } from '@/components/StepProgressBar'
import { GALLERY_ITEMS, TESTIMONIALS } from '@/data/mock'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: '1', label: 'Upload Photo', description: 'Choose your image' },
  { id: '2', label: 'Generate Pattern', description: 'We create your design' },
  { id: '3', label: 'Order Kit', description: 'Receive & create' },
]

export function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent-muted/30 to-background px-4 py-20 sm:px-6 sm:py-28 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-sm font-medium uppercase tracking-widest text-accent"
          >
            Personalized Gifts
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Turn Your Photo Into Beautiful String Art
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            The perfect personalized gift for birthdays, anniversaries, weddings, and
            every special moment. Upload a photo, get a custom pattern, and order a
            ready-to-make DIY kit.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10"
          >
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-10 py-3.5 text-lg font-medium text-accent-foreground shadow-soft-lg transition-all hover:bg-accent/90 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Create Your String Art
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Example gallery strip */}
      <section className="border-b border-border bg-muted/20 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="mb-6 text-center font-serif text-2xl font-semibold sm:text-3xl">
            Examples from our community
          </h2>
          <div className="flex justify-center gap-4 overflow-x-auto pb-4">
            {GALLERY_ITEMS.slice(0, 4).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-border shadow-soft"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-center">
            <Link to="/gallery" className="text-sm font-medium text-accent hover:underline">
              View full gallery →
            </Link>
          </p>
        </div>
      </section>

      {/* 3 steps */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-10 text-center font-serif text-2xl font-semibold sm:text-3xl">
            How it works
          </h2>
          <StepProgressBar steps={STEPS} currentStep={0} />
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Upload,
                title: 'Upload Photo',
                text: 'Choose a clear, high-contrast photo. Portraits, pets, and silhouettes work beautifully.',
              },
              {
                icon: Sparkles,
                title: 'Generate Pattern',
                text: 'Our algorithm turns your image into a unique nail-and-string pattern. Adjust density and shape.',
              },
              {
                icon: Package,
                title: 'Order Kit',
                text: 'Get a physical DIY kit: board, nails, string, and instructions. Perfect as a gift.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift messaging */}
      <section className="border-y border-border bg-accent-muted/20 py-16">
        <div className="container mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Perfect for every occasion
          </h2>
          <p className="mt-4 text-muted-foreground">
            Birthdays · Anniversaries · Weddings · Mother's Day · Father's Day ·
            Graduation · Housewarming · Just because
          </p>
          <Link
            to="/create"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg border border-border bg-muted px-8 font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Create a gift
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="mb-10 text-center font-serif text-2xl font-semibold sm:text-3xl">
            What people are saying
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'rounded-xl border border-border bg-card p-6 shadow-soft',
                  'flex flex-col'
                )}
              >
                <Quote className="mb-2 h-8 w-8 text-accent/40" />
                <p className="flex-1 text-muted-foreground">"{t.quote}"</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-medium">{t.author}</span>
                  <span className="text-xs text-muted-foreground">{t.occasion}</span>
                </div>
                <div className="mt-1 flex gap-0.5 text-accent">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} aria-hidden>★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16">
        <div className="container mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Ready to create something unique?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Upload your photo and see your string art in minutes.
          </p>
          <Link
            to="/create"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-xl bg-accent px-10 text-lg font-medium text-accent-foreground shadow-soft transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Create Your String Art
          </Link>
        </div>
      </section>
    </div>
  )
}
