'use client'

import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children: ReactNode
  className?: string
}

interface ButtonLinkProps {
  variant?: Variant
  size?: Size
  full?: boolean
  href: string
  children: ReactNode
  className?: string
}

function buildClass(variant: Variant, size: Size, full: boolean, extra?: string) {
  const parts = ['ds-btn', `ds-btn-${variant}`]
  if (size === 'sm') parts.push('ds-btn-sm')
  if (size === 'lg') parts.push('ds-btn-lg')
  if (full) parts.push('ds-btn-full')
  if (extra) parts.push(extra)
  return parts.join(' ')
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  full = false,
  href,
  children,
  className,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buildClass(variant, size, full, className)}>
      {children}
    </Link>
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buildClass(variant, size, full, className)} {...props}>
      {children}
    </button>
  )
}
