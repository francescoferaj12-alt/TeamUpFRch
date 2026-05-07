'use client'

// Path SVG del Canton Friborgo — derivato da coordinate WGS84 reali
// Bounding box: W 6.80°E · E 7.50°E · N 47.05°N · S 46.38°N
// Proiezione: x=(lon-6.80)/0.70*340+30  y=(47.05-lat)/0.67*440+30
// ViewBox 400×500 — aspect-ratio 4/5
const CANTON_PATH =
  'M 85 158 C 115 138 162 115 195 108 L 232 72 C 256 68 280 85 292 105 ' +
  'L 315 148 L 342 175 L 348 192 ' +
  'C 332 225 312 252 305 290 C 298 322 285 355 275 385 ' +
  'C 258 415 228 435 198 438 ' +
  'C 172 440 148 428 130 415 L 108 388 L 88 355 L 78 318 L 72 278 ' +
  'L 68 238 L 72 198 C 75 178 80 165 85 158 Z'

const majorClubs = [
  { id: 1, name: 'FC Fribourg',   x: 210, y: 218 },
  { id: 2, name: 'FC Bulle',      x: 168, y: 368 },
  { id: 3, name: 'SC Düdingen',   x: 322, y: 180 },
  { id: 4, name: 'FC Romont',     x:  98, y: 305 },
  { id: 5, name: 'FC Estavayer',  x:  90, y: 198 },
  { id: 6, name: 'FC Murten',     x: 200, y: 120 },
]

const minorClubs = [
  { id:  7, x: 252, y: 108 }, { id:  8, x: 168, y: 125 }, { id:  9, x: 295, y: 125 },
  { id: 10, x: 138, y: 165 }, { id: 11, x: 305, y: 162 }, { id: 12, x: 158, y: 182 },
  { id: 13, x: 242, y: 158 }, { id: 14, x: 278, y: 175 }, { id: 15, x: 328, y: 188 },
  { id: 16, x: 112, y: 188 }, { id: 17, x: 188, y: 198 }, { id: 18, x: 232, y: 192 },
  { id: 19, x: 148, y: 222 }, { id: 20, x: 242, y: 228 }, { id: 21, x: 298, y: 225 },
  { id: 22, x: 178, y: 242 }, { id: 23, x: 112, y: 245 }, { id: 24, x: 268, y: 258 },
  { id: 25, x: 312, y: 255 }, { id: 26, x: 198, y: 268 }, { id: 27, x: 138, y: 268 },
  { id: 28, x: 235, y: 278 }, { id: 29,  x: 96, y: 275 }, { id: 30, x: 305, y: 285 },
  { id: 31, x: 168, y: 298 }, { id: 32, x: 248, y: 295 }, { id: 33, x: 118, y: 312 },
  { id: 34, x: 208, y: 312 }, { id: 35, x: 278, y: 325 }, { id: 36, x: 148, y: 332 },
  { id: 37, x: 238, y: 338 }, { id: 38, x: 105, y: 342 }, { id: 39, x: 182, y: 352 },
  { id: 40, x: 252, y: 355 }, { id: 41, x: 128, y: 362 }, { id: 42, x: 215, y: 375 },
  { id: 43, x: 162, y: 388 }, { id: 44, x: 235, y: 382 }, { id: 45, x: 192, y: 408 },
  { id: 46, x: 215, y: 420 }, { id: 47, x: 268, y: 305 }, { id: 48, x: 138, y: 145 },
  { id: 49, x: 222, y: 142 }, { id: 50, x: 175, y: 338 }, { id: 51, x: 270, y: 372 },
  { id: 52, x: 198, y: 258 },
]

const connections = [
  [210, 218, 322, 180], // Fribourg – Düdingen
  [210, 218, 168, 368], // Fribourg – Bulle
  [210, 218,  98, 305], // Fribourg – Romont
  [210, 218, 200, 120], // Fribourg – Murten
  [200, 120, 322, 180], // Murten – Düdingen
  [ 98, 305, 168, 368], // Romont – Bulle
  [ 90, 198, 200, 120], // Estavayer – Murten
  [ 90, 198,  98, 305], // Estavayer – Romont
]

export default function HeroMap() {
  return (
    <div className="hero-map">
      <div className="hero-map-glow" />

      <svg viewBox="0 0 400 500" className="hero-map-svg" aria-label="Carte active du Canton de Fribourg">
        {/* Fond terrain */}
        <path d={CANTON_PATH} fill="rgba(10,31,92,0.6)" stroke="none" />
        {/* Contour principal */}
        <path d={CANTON_PATH} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Halo rouge intérieur */}
        <path d={CANTON_PATH} fill="none" stroke="rgba(230,57,70,0.08)" strokeWidth="10" strokeLinejoin="round" />

        {/* Lignes de connexion animées */}
        {connections.map(([x1, y1, x2, y2], i) => (
          <line
            key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(230,57,70,0.35)" strokeWidth="1"
            className="map-connection"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}

        {/* Points clubs mineurs */}
        {minorClubs.map(c => (
          <g key={c.id}>
            <circle cx={c.x} cy={c.y} r="9"
              fill="rgba(230,57,70,0.12)"
              className="map-pulse-ring"
              style={{ animationDelay: `${(c.id * 0.41) % 2.8}s` }}
            />
            <circle cx={c.x} cy={c.y} r="3.5"
              fill="#e63946"
              className="map-dot"
              style={{ animationDelay: `${(c.id * 0.37) % 3}s` }}
            />
          </g>
        ))}

        {/* Points clubs majeurs */}
        {majorClubs.map(c => {
          const labelRight = c.x < 280
          const lx = labelRight ? c.x + 12 : c.x - 12
          const anchor = labelRight ? 'start' : 'end'
          const rectX = labelRight ? c.x + 10 : c.x - 10 - c.name.length * 6.2
          return (
            <g key={c.id}>
              {/* Aura */}
              <circle cx={c.x} cy={c.y} r="18" fill="rgba(230,57,70,0.08)" />
              {/* Pulse ring grande */}
              <circle cx={c.x} cy={c.y} r="10"
                fill="rgba(230,57,70,0.18)"
                className="map-pulse-ring"
                style={{ animationDelay: `${c.id * 0.5}s` }}
              />
              {/* Dot principale */}
              <circle cx={c.x} cy={c.y} r="6"
                fill="#e63946"
                className="map-dot major"
              />
              {/* Etichetta */}
              <rect
                x={rectX} y={c.y - 9}
                width={c.name.length * 6.2 + 10} height={17}
                rx="3" fill="rgba(3,10,36,0.78)"
              />
              <text x={lx} y={c.y + 4}
                textAnchor={anchor}
                className="map-label"
              >
                {c.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Badges fluttuanti */}
      <div className="floating-badge badge-top">
        <span className="badge-dot" />
        52 clubs actifs
      </div>
      <div className="floating-badge badge-bottom">
        📍 Tout le canton de Fribourg
      </div>
    </div>
  )
}
