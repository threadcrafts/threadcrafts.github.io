import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { INSTAGRAM_URL } from '@/config/order'

interface LayoutProps {
  children: React.ReactNode
  darkMode: boolean
  onToggleDark: () => void
}

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/create', label: 'Create' },
  { to: '/gallery', label: 'Gallery' },
  { href: INSTAGRAM_URL, label: 'Contact us', external: true },
] as const

export function Layout({ children, darkMode, onToggleDark }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight">
            <img src="/logo.png" alt="Thread Crafts — String-art profile with heart" className="h-9 w-9 rounded-lg object-contain" />
            Thread Crafts
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4">
            {NAV.map((item) => {
              if ('href' in item && item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {item.label}
                  </a>
                )
              }
              const to = (item as { to: string; label: string }).to
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === to
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="ml-2"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Thread Crafts. Personalized gifts, made with care.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                Contact us
              </a>
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
