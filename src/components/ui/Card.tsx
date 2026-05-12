import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-white shadow-sm border border-gray-200 rounded-lg p-4", className)}
      {...props}
    />
  )
}
