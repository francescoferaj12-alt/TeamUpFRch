import { ReactNode, CSSProperties } from 'react'

interface ContainerProps {
  children: ReactNode
  /** 'default' = 1400px, 'legal' = 1200px */
  size?: 'default' | 'legal'
  className?: string
  style?: CSSProperties
  as?: keyof JSX.IntrinsicElements
}

export default function Container({
  children,
  size = 'default',
  className,
  style,
  as: Tag = 'div',
}: ContainerProps) {
  const cls = [
    size === 'legal' ? 'ds-container-lg' : 'ds-container',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={cls} style={style}>
      {children}
    </Tag>
  )
}
