export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <div
      className="nav-logo-icon"
      style={{ width: size, height: size }}
      aria-label="TeamUpFR Logo"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5" />
        <path d="M12 2 L14.5 7 L20 8 L16 12.5 L17 18.5 L12 16 L7 18.5 L8 12.5 L4 8 L9.5 7 Z" fill="#fff" fillOpacity="0.85" />
      </svg>
    </div>
  )
}
