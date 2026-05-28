export default function VerifiedBadge({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 20 20"
      style={{ verticalAlign: 'middle', marginLeft: 5, flexShrink: 0, display: 'inline-block' }}
      aria-label="Vérifié"
    >
      <circle cx="10" cy="10" r="10" fill="#FF3A3A" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
