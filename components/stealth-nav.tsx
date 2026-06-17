'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function StealthNav() {
  const path = usePathname()
  const isAdmin = path.startsWith('/admin')
  const href = isAdmin ? '/' : '/admin'
  const label = isAdmin ? 'Home' : 'Admin'

  return (
    <Link
      href={href}
      className="fixed bottom-4 right-4 z-50 p-2 rounded-lg opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 text-ink-light hover:text-ink hover:bg-paper-card border border-transparent hover:border-paper-border"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </Link>
  )
}
