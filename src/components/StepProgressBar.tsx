import { cn } from '@/lib/utils'

export type Step = { id: string; label: string; description?: string }

interface StepProgressBarProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepProgressBar({ steps, currentStep, className }: StepProgressBarProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          return (
            <li
              key={step.id}
              className={cn(
                'flex flex-1 flex-col items-center transition-opacity duration-300',
                !isComplete && !isCurrent && 'opacity-50'
              )}
            >
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors duration-300',
                      isComplete ? 'bg-accent' : 'bg-muted'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300',
                    isComplete && 'border-accent bg-accent text-accent-foreground',
                    isCurrent && 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20',
                    !isComplete && !isCurrent && 'border-muted bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors duration-300',
                      isComplete ? 'bg-accent' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-center text-xs font-medium sm:text-sm',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="mt-0.5 text-center text-xs text-muted-foreground">
                  {step.description}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
