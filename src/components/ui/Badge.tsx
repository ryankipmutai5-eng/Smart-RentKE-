import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paid' | 'pending' | 'overdue'
}

export function Badge({ className, variant = 'pending', ...props }: BadgeProps) {
  const variants = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800"
  }
  
  return (
    <div
      className={cn("text-xs font-medium px-2.5 py-0.5 rounded inline-block", variants[variant], className)}
      {...props}
    />
  )
}
