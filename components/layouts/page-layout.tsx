"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  showBreadcrumbs?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function PageLayout({
  children,
  className,
  showBreadcrumbs = true,
  maxWidth = "2xl",
}: PageLayoutProps) {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  // Map of path segments to readable names
  const pathNames: Record<string, string> = {
    agents: "Agents",
    chat: "Chat",
    history: "History",
    settings: "Settings",
    api: "API",
  }

  // Generate breadcrumb items
  const breadcrumbs = pathSegments.map((segment, index) => {
    // For dynamic routes like [id], check if it's a UUID or similar
    const isId = segment.length > 8 && !pathNames[segment]
    const displayName = isId ? "Details" : pathNames[segment] || segment

    // Build the href for this breadcrumb
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`

    return {
      href,
      label: displayName,
    }
  })

  // Map max width to Tailwind class
  const maxWidthClass = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth]

  return (
    <div className={cn("mx-auto px-4 py-6 w-full", maxWidthClass, className)}>
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link
            href="/"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link
                href={breadcrumb.href}
                className={cn(
                  "hover:text-foreground transition-colors",
                  index === breadcrumbs.length - 1 && "text-foreground font-medium"
                )}
              >
                {breadcrumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}
      {children}
    </div>
  )
}
