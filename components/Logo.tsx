export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <div
      className="nav-logo-icon"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
      aria-label="TeamUpFR Logo"
    >
      ⚽
    </div>
  );
}
