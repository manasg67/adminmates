import {  type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "danger"
}

const variantStyles = {
  default: {
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
  primary: {
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  accent: {
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  success: {
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
  },
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-slate-900/50">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
