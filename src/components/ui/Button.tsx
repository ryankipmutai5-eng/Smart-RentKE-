import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: "bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition disabled:opacity-50",
      ghost: "text-emerald-600 border border-emerald-600 py-2 px-4 rounded-md hover:bg-emerald-50 transition disabled:opacity-50",
      danger: "bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50"
    }
    
    return (
      <button
        className={cn(variants[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
