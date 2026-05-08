'use client'

import { useEffect, useRef, useState } from 'react'

// Real SVG path for Canton Fribourg — derived from swiss-maps TopoJSON (canton ID 10)
// Projection: lon 6.796–7.379, lat 46.439–47.008 → viewBox 0 0 400 500 (pad 20)
const CANTON_PATH =
  'M 306.9 378.4 L 298.3 384.5 L 292.9 386.2 L 284.4 391.0 L 274.5 403.1 ' +
  'L 270.6 396.0 L 265.2 392.0 L 259.4 398.4 L 252.2 403.2 L 244.7 407.6 ' +
  'L 238.2 406.6 L 235.9 408.2 L 230.3 423.0 L 223.3 430.2 L 214.6 433.8 ' +
  'L 208.5 440.2 L 194.5 438.7 L 191.3 440.7 L 184.2 439.9 L 163.7 456.6 ' +
  'L 159.0 462.4 L 156.9 472.0 L 142.0 479.1 L 136.6 479.8 L 141.6 471.1 ' +
  'L 134.1 462.7 L 132.9 451.3 L 134.4 450.1 L 130.3 445.0 L 130.0 438.1 ' +
  'L 115.9 427.7 L 105.6 428.4 L 100.1 423.4 L 92.1 419.2 L 85.6 419.0 ' +
  'L 82.3 423.7 L 83.4 413.2 L 74.4 418.8 L 73.3 419.5 L 59.0 435.1 ' +
  'L 52.5 434.8 L 45.6 429.6 L 43.3 425.6 L 41.6 419.7 L 38.1 419.9 ' +
  'L 34.1 416.2 L 30.5 408.5 L 38.6 398.9 L 43.0 399.4 L 56.9 396.3 ' +
  'L 60.8 404.9 L 64.1 396.9 L 65.2 395.8 L 77.4 382.8 L 80.6 381.8 ' +
  'L 86.3 380.2 L 83.5 372.6 L 72.0 375.4 L 67.3 373.4 L 63.4 367.3 ' +
  'L 55.6 363.4 L 49.4 363.1 L 44.5 368.8 L 40.7 367.3 L 35.7 362.0 ' +
  'L 31.7 360.4 L 30.2 364.4 L 22.5 369.7 L 19.9 368.9 L 22.4 362.1 ' +
  'L 23.8 355.1 L 22.0 348.9 L 24.2 348.2 L 25.2 331.1 L 21.1 322.0 ' +
  'L 25.2 312.7 L 22.3 308.9 L 29.9 308.1 L 34.4 309.9 L 40.3 300.1 ' +
  'L 46.7 298.2 L 50.2 299.6 L 56.1 303.9 L 62.8 296.5 L 67.3 289.4 ' +
  'L 63.0 287.1 L 73.1 276.0 L 78.4 272.8 L 80.8 268.0 L 80.1 265.8 ' +
  'L 83.6 261.1 L 87.5 256.5 L 97.3 250.2 L 98.4 248.9 L 106.8 241.1 ' +
  'L 110.2 231.6 L 103.4 224.3 L 97.4 226.6 L 91.2 224.9 L 89.8 221.4 ' +
  'L 93.6 217.1 L 97.1 219.3 L 102.6 213.4 L 106.6 210.1 L 104.2 207.1 ' +
  'L 108.8 202.0 L 115.6 201.1 L 121.0 195.0 L 119.4 192.4 L 125.9 185.0 ' +
  'L 120.4 178.0 L 121.0 170.7 L 125.2 164.4 L 129.1 167.5 L 137.3 169.2 ' +
  'L 141.8 162.4 L 135.9 154.8 L 139.4 151.9 L 132.7 146.6 L 134.5 140.2 ' +
  'L 134.2 133.5 L 139.7 127.7 L 138.0 125.4 L 130.3 116.5 L 123.2 119.1 ' +
  'L 120.6 121.3 L 128.0 132.8 L 125.0 134.4 L 116.3 124.1 L 110.6 119.1 ' +
  'L 108.6 114.7 L 100.8 112.2 L 103.1 106.5 L 98.4 102.0 L 82.4 85.8 ' +
  'L 102.0 63.2 L 122.6 83.8 L 129.2 89.3 L 133.0 87.3 L 138.8 91.5 ' +
  'L 135.4 95.2 L 136.7 100.0 L 152.4 115.1 L 143.3 123.8 L 151.3 127.8 ' +
  'L 156.6 121.7 L 168.4 127.6 L 165.0 133.6 L 171.0 138.1 L 165.0 144.4 ' +
  'L 167.0 147.7 L 169.6 150.2 L 173.0 149.1 L 177.6 142.9 L 185.2 132.9 ' +
  'L 187.7 131.5 L 190.1 127.6 L 184.8 119.4 L 195.8 111.0 L 192.6 109.8 ' +
  'L 198.0 109.4 L 202.9 103.5 L 202.1 100.0 L 198.5 95.6 L 183.5 76.6 ' +
  'L 183.4 64.5 L 182.4 53.4 L 185.5 48.7 L 178.6 43.9 L 204.3 44.6 ' +
  'L 231.8 38.8 L 237.0 37.6 L 241.5 36.5 L 245.6 35.5 L 252.2 32.3 ' +
  'L 257.0 30.1 L 262.2 27.7 L 280.7 19.9 L 284.6 30.4 L 291.6 36.1 ' +
  'L 288.4 40.8 L 284.0 45.9 L 279.1 48.6 L 278.9 52.1 L 274.2 54.6 ' +
  'L 267.2 54.7 L 274.1 57.2 L 276.9 60.5 L 274.8 66.6 L 276.0 71.3 ' +
  'L 272.3 75.2 L 277.2 80.9 L 276.9 84.4 L 273.4 88.7 L 274.9 98.7 ' +
  'L 262.6 106.0 L 267.2 107.1 L 270.0 104.3 L 277.8 104.8 L 280.8 108.2 ' +
  'L 284.2 104.1 L 288.8 103.0 L 290.1 106.8 L 297.2 106.2 L 305.1 107.7 ' +
  'L 320.1 114.7 L 325.8 111.1 L 336.4 112.3 L 347.6 111.1 L 362.3 115.1 ' +
  'L 364.9 117.5 L 364.6 128.4 L 368.2 136.2 L 363.4 143.3 L 355.4 147.0 ' +
  'L 350.7 140.5 L 346.4 137.8 L 339.6 138.0 L 339.3 142.1 L 333.2 145.0 ' +
  'L 336.9 149.5 L 345.7 154.2 L 350.8 160.0 L 349.3 163.8 L 344.0 166.9 ' +
  'L 344.7 174.5 L 338.8 179.3 L 333.6 196.0 L 334.4 200.8 L 326.0 209.0 ' +
  'L 328.8 214.9 L 332.3 216.6 L 334.5 227.3 L 329.5 238.2 L 330.9 249.0 ' +
  'L 336.5 254.1 L 348.3 254.4 L 362.0 258.0 L 362.1 263.6 L 359.8 268.8 ' +
  'L 368.7 269.6 L 374.2 273.9 L 379.3 273.8 L 379.8 281.3 L 376.8 284.0 ' +
  'L 378.5 288.3 L 376.0 292.7 L 374.1 304.1 L 378.6 303.7 L 368.1 313.1 ' +
  'L 362.2 309.5 L 359.3 304.3 L 345.5 304.4 L 350.2 315.1 L 345.6 318.7 ' +
  'L 339.9 319.2 L 339.3 331.3 L 343.1 335.9 L 340.9 348.5 L 344.6 355.6 ' +
  'L 339.5 357.5 L 336.8 363.9 L 331.0 365.6 L 320.5 361.2 L 312.0 370.2 ' +
  'L 306.9 378.4 Z'

// Projection constants (must match path above)
const LON_MIN = 6.796, LON_MAX = 7.379
const LAT_MIN = 46.439, LAT_MAX = 47.008
const SVG_W = 400, SVG_H = 500, PAD = 20

function project(lon: number, lat: number): [number, number] {
  const x = PAD + (lon - LON_MIN) / (LON_MAX - LON_MIN) * (SVG_W - 2 * PAD)
  const y = SVG_H - PAD - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN) * (SVG_H - 2 * PAD)
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
}

// Coordinate lookup for Fribourg communes and zones
const COMMUNE_COORDS: Record<string, [number, number]> = {
  // Cities / communes
  'fribourg': [7.1555, 46.8065],
  'bulle': [7.0571, 46.6189],
  'romont': [6.9200, 46.6967],
  'estavayer': [6.8460, 46.8510],
  'estavayer-le-lac': [6.8460, 46.8510],
  'murten': [7.1190, 46.9258],
  'morat': [7.1190, 46.9258],
  'düdingen': [7.1858, 46.8750],
  'dudingen': [7.1858, 46.8750],
  'guin': [7.1858, 46.8750],
  'châtel-saint-denis': [6.9013, 46.5267],
  'chatel-saint-denis': [6.9013, 46.5267],
  'châtel-st-denis': [6.9013, 46.5267],
  'gruyères': [7.0826, 46.5883],
  'gruyeres': [7.0826, 46.5883],
  'broc': [7.0983, 46.5883],
  'riaz': [7.0352, 46.6388],
  'domdidier': [7.0132, 46.9044],
  'kerzers': [7.1976, 46.9718],
  'chiètres': [7.1976, 46.9718],
  'schwarzenburg': [7.3421, 46.8184],
  'plaffeien': [7.2723, 46.7438],
  'planfayon': [7.2723, 46.7438],
  'saint-aubin': [6.9988, 46.8875],
  'st-aubin': [6.9988, 46.8875],
  'avenches': [7.0416, 46.8777],
  'payerne': [6.9332, 46.8212],
  'villars-sur-glâne': [7.1283, 46.7863],
  'villars-sur-glane': [7.1283, 46.7863],
  'marly': [7.1758, 46.7683],
  'givisiez': [7.1406, 46.8228],
  'matran': [7.0974, 46.7813],
  'avry': [7.0974, 46.7813],
  'corminboeuf': [7.0825, 46.8133],
  'belfaux': [7.0980, 46.8183],
  'granges-paccot': [7.1597, 46.8317],
  'tafers': [7.2175, 46.8154],
  'tavel': [7.1930, 46.8395],
  'heitenried': [7.2443, 46.8521],
  'wünnewil': [7.2487, 46.8261],
  'schmitten': [7.2430, 46.8793],
  'überstorf': [7.3019, 46.8445],
  'tentlingen': [7.2702, 46.8167],
  'flamatt': [7.2993, 46.8614],
  'ueberstorf': [7.3019, 46.8445],
  'alterswil': [7.2501, 46.8628],
  'bösingen': [7.2199, 46.8467],
  'bosingen': [7.2199, 46.8467],
  'jaun': [7.3021, 46.5944],
  'charmey': [7.1846, 46.6192],
  'brünisried': [7.2655, 46.8038],
  'rechthalten': [7.2259, 46.8023],
  // Zones / districts
  'sarine': [7.1555, 46.8065],
  'saane': [7.1555, 46.8065],
  'gruyère': [7.0571, 46.5880],
  'veveyse': [6.9013, 46.5267],
  'glâne': [6.9200, 46.6967],
  'glane': [6.9200, 46.6967],
  'broye': [6.9988, 46.8875],
  'lac': [7.1190, 46.9258],
  'see': [7.1190, 46.9258],
  'singine': [7.2723, 46.8250],
  'sense': [7.2723, 46.8250],
}

const ZONE_CENTERS: Record<string, [number, number]> = {
  'Sarine': [7.1555, 46.8065],
  'Saane': [7.1555, 46.8065],
  'Gruyère': [7.0571, 46.5880],
  'Veveyse': [6.9013, 46.5267],
  'Glâne': [6.9200, 46.6967],
  'Broye': [6.9988, 46.8875],
  'Lac': [7.1190, 46.9258],
  'See': [7.1190, 46.9258],
  'Singine': [7.2723, 46.8250],
  'Sense': [7.2723, 46.8250],
}

// Canton center as fallback
const CANTON_CENTER: [number, number] = [7.1, 46.720]

interface Club {
  id: string
  name: string
  zone: string
  avatar_url: string | null
}

interface PlacedClub extends Club {
  x: number
  y: number
}

function getCoords(club: Club): [number, number] {
  const nameLower = club.name.toLowerCase()
  // Try to match commune name in club name
  for (const [key, coords] of Object.entries(COMMUNE_COORDS)) {
    if (nameLower.includes(key)) return coords
  }
  // Try zone
  if (club.zone) {
    const zoneCoords = ZONE_CENTERS[club.zone] || COMMUNE_COORDS[club.zone.toLowerCase()]
    if (zoneCoords) return zoneCoords
  }
  return CANTON_CENTER
}

// Spread overlapping dots slightly
function spreadDots(clubs: Club[]): PlacedClub[] {
  const placed: PlacedClub[] = []
  const usedPos: [number, number][] = []

  for (const club of clubs) {
    let [lon, lat] = getCoords(club)
    let [x, y] = project(lon, lat)

    // Offset if too close to existing dot
    let attempts = 0
    while (attempts < 20 && usedPos.some(([px, py]) => Math.hypot(px - x, py - y) < 14)) {
      const angle = (attempts * 137.5 * Math.PI) / 180 // golden angle spiral
      const r = 10 + attempts * 3
      x = project(lon, lat)[0] + Math.cos(angle) * r
      y = project(lon, lat)[1] + Math.sin(angle) * r
      attempts++
    }
    usedPos.push([x, y])
    placed.push({ ...club, x, y })
  }
  return placed
}

export default function HeroMap() {
  const [clubs, setClubs] = useState<PlacedClub[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    fetch('/api/clubs')
      .then(r => r.json())
      .then((data: Club[]) => {
        setClubs(spreadDots(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const hoveredClub = clubs.find(c => c.id === hovered)

  return (
    <div className="hero-map">
      <div className="hero-map-glow" />

      <svg
        ref={svgRef}
        viewBox="0 0 400 500"
        className="hero-map-svg"
        aria-label="Carte du Canton de Fribourg"
      >
        {/* Canton fill */}
        <path d={CANTON_PATH} fill="rgba(10,31,92,0.65)" stroke="none" />
        {/* Canton border */}
        <path d={CANTON_PATH} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Red inner glow */}
        <path d={CANTON_PATH} fill="none" stroke="rgba(230,57,70,0.07)" strokeWidth="10" strokeLinejoin="round" />

        {/* Club dots */}
        {clubs.map(club => (
          <g
            key={club.id}
            onMouseEnter={() => setHovered(club.id)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(v => v === club.id ? null : club.id)}
            style={{ cursor: 'pointer' }}
          >
            {/* Pulse ring */}
            <circle
              cx={club.x} cy={club.y} r="9"
              fill="rgba(230,57,70,0.14)"
              className="map-pulse-ring"
              style={{ animationDelay: `${(club.x * 0.041 + club.y * 0.037) % 2.8}s` }}
            />
            {/* Main dot */}
            <circle
              cx={club.x} cy={club.y} r="4.5"
              fill={hovered === club.id ? '#ff6b7a' : '#e63946'}
              className="map-dot"
              style={{ animationDelay: `${(club.x * 0.037 + club.y * 0.041) % 3}s`, filter: hovered === club.id ? 'drop-shadow(0 0 8px #ff6b7a)' : undefined }}
            />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredClub && (() => {
          const tx = hoveredClub.x > 280 ? hoveredClub.x - 8 : hoveredClub.x + 8
          const anchor = hoveredClub.x > 280 ? 'end' : 'start'
          const label = hoveredClub.name
          const labelW = Math.min(label.length * 6.4 + 16, 160)
          const rx = anchor === 'start' ? tx - 4 : tx - labelW + 4
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={rx} y={hoveredClub.y - 13}
                width={labelW} height={19}
                rx="4" fill="rgba(3,10,36,0.92)"
                stroke="rgba(230,57,70,0.5)" strokeWidth="1"
              />
              <text
                x={tx} y={hoveredClub.y + 1}
                textAnchor={anchor}
                fill="#fff"
                fontSize="10"
                fontFamily="'Bebas Neue', sans-serif"
                letterSpacing="0.04em"
              >
                {label}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Floating badges */}
      <div className="floating-badge badge-top">
        <span className="badge-dot" />
        {loading ? '…' : `${clubs.length} clubs inscrits`}
      </div>
      <div className="floating-badge badge-bottom">
        📍 Canton de Fribourg
      </div>
    </div>
  )
}
