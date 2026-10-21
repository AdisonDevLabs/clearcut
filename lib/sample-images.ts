// Preset high-fidelity SVG images encoded for immediate client-side testing
export interface SampleImage {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl: string;
}

// Generate realistic SVG mock images for instant 1-click test removal
function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sneaker',
    name: 'Velocity Runner Sneaker',
    category: 'Product / E-commerce',
    description: 'Athletic footwear with sharp contours against a studio peach background',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fed7aa"/>
            <stop offset="100%" stop-color="#fdba74"/>
          </linearGradient>
          <linearGradient id="sole" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="upper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2563eb"/>
            <stop offset="40%" stop-color="#1d4ed8"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#facc15"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="25" stdDeviation="20" flood-opacity="0.25"/>
          </filter>
        </defs>
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <!-- Soft Ground Shadow -->
        <ellipse cx="400" cy="460" rx="260" ry="24" fill="#000000" opacity="0.18" />
        
        <!-- Sneaker Group with shadow -->
        <g filter="url(#shadow)">
          <!-- Outsole -->
          <path d="M180,420 C220,440 320,445 420,440 C520,435 600,410 630,370 C635,365 620,355 600,360 C510,385 410,390 320,385 C230,380 180,390 170,400 C165,405 170,415 180,420 Z" fill="url(#sole)"/>
          <!-- Midsole tread texture -->
          <path d="M200,415 L220,422 M250,420 L270,427 M310,422 L330,428 M380,422 L400,427 M450,418 L470,423 M520,405 L540,410" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
          
          <!-- Sneaker Upper -->
          <path d="M175,398 C200,370 240,320 280,270 C310,230 350,210 390,240 C430,270 470,290 530,300 C580,310 620,335 628,368 C600,375 510,385 410,388 C310,390 230,385 175,398 Z" fill="url(#upper)"/>
          
          <!-- Dynamic Swoosh / Wave Line -->
          <path d="M260,340 C340,300 440,310 540,345 C460,355 360,360 260,340 Z" fill="url(#accent)"/>
          
          <!-- Collar & Tongue -->
          <path d="M280,268 C270,230 290,190 340,195 C370,200 390,235 390,240 C350,210 310,230 280,268 Z" fill="#0f172a"/>
          
          <!-- Laces -->
          <path d="M330,240 L370,250 M320,265 L365,275 M310,290 L360,300 M300,315 L350,325" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
          
          <!-- Heel Counter & Pull Tab -->
          <path d="M175,398 C160,360 170,300 210,260 C230,285 240,330 240,370 Z" fill="#0284c7" opacity="0.85"/>
          <path d="M190,260 C185,230 195,220 205,225 C215,230 210,250 210,260 Z" fill="#f97316"/>
        </g>
      </svg>
    `),
  },
  {
    id: 'portrait',
    name: 'Studio Portrait Silhouette',
    category: 'People / Portrait',
    description: 'Human portrait profile with distinct hair and neckline against studio cyan',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bg-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#bae6fd"/>
            <stop offset="100%" stop-color="#7dd3fc"/>
          </linearGradient>
          <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fed7aa"/>
            <stop offset="100%" stop-color="#fbcfe8"/>
          </linearGradient>
          <filter id="p-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.2"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-cyan)"/>
        
        <!-- Portrait Subject -->
        <g filter="url(#p-shadow)">
          <!-- Shoulders / Torso -->
          <path d="M220,600 C240,510 300,470 380,460 C420,460 480,510 580,600 Z" fill="#1e293b"/>
          <path d="M350,462 L400,530 L450,462 Z" fill="#f8fafc"/>
          
          <!-- Neck -->
          <path d="M360,370 L360,470 C380,480 420,480 440,470 L440,370 Z" fill="#fbb6ce"/>
          
          <!-- Head / Face -->
          <ellipse cx="400" cy="310" rx="95" ry="120" fill="#fbcfe8"/>
          <!-- Ear -->
          <ellipse cx="308" cy="320" rx="14" ry="24" fill="#fbb6ce"/>
          
          <!-- Detailed Hair Cutout -->
          <path d="M300,320 C280,240 310,150 400,150 C490,150 520,220 510,320 C500,270 470,210 400,210 C340,210 310,260 300,320 Z" fill="#475569"/>
          <!-- Curly / Wavy Locks -->
          <circle cx="310" cy="230" r="35" fill="#334155"/>
          <circle cx="340" cy="180" r="40" fill="#1e293b"/>
          <circle cx="400" cy="160" r="45" fill="#334155"/>
          <circle cx="460" cy="180" r="40" fill="#1e293b"/>
          <circle cx="490" cy="230" r="35" fill="#334155"/>
          <circle cx="505" cy="280" r="28" fill="#1e293b"/>
          
          <!-- Glasses -->
          <rect x="345" y="295" width="45" height="30" rx="8" fill="none" stroke="#0f172a" stroke-width="5"/>
          <rect x="410" y="295" width="45" height="30" rx="8" fill="none" stroke="#0f172a" stroke-width="5"/>
          <line x1="390" y1="310" x2="410" y2="310" stroke="#0f172a" stroke-width="5"/>
        </g>
      </svg>
    `),
  },
  {
    id: 'monstera',
    name: 'Monstera Deliciosa Plant',
    category: 'Nature / Interior',
    description: 'Potted tropical houseplant with fenestrated leaves on a warm terracotta background',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bg-warm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fecdd3"/>
            <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.4"/>
          </linearGradient>
          <linearGradient id="leaf1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#16a34a"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
          <linearGradient id="leaf2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#15803d"/>
          </linearGradient>
          <filter id="plant-shadow">
            <feDropShadow dx="0" dy="20" stdDeviation="18" flood-opacity="0.2"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-warm)"/>
        
        <g filter="url(#plant-shadow)">
          <!-- Ceramic Pot -->
          <ellipse cx="400" cy="530" rx="90" ry="15" fill="#000000" opacity="0.15"/>
          <path d="M330,420 L350,520 C355,535 445,535 450,520 L470,420 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
          <ellipse cx="400" cy="420" rx="70" ry="14" fill="#3f3f46"/>
          
          <!-- Stems -->
          <path d="M400,420 Q350,330 280,240" fill="none" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
          <path d="M400,420 Q410,290 400,170" fill="none" stroke="#166534" stroke-width="9" stroke-linecap="round"/>
          <path d="M400,420 Q450,320 530,250" fill="none" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
          
          <!-- Left Monstera Leaf with Cutouts -->
          <g transform="translate(260, 220) rotate(-25)">
            <path d="M0,0 C-70,-40 -120,40 -80,110 C-40,160 30,120 50,70 C70,20 40,-30 0,0 Z" fill="url(#leaf1)"/>
            <!-- Fenestration holes -->
            <ellipse cx="-40" cy="30" rx="8" ry="18" fill="url(#bg-warm)" transform="rotate(-30, -40, 30)"/>
            <ellipse cx="-20" cy="70" rx="7" ry="16" fill="url(#bg-warm)" transform="rotate(-15, -20, 70)"/>
          </g>
          
          <!-- Center Huge Leaf -->
          <g transform="translate(400, 150) rotate(5)">
            <path d="M0,0 C-90,-50 -130,50 -90,140 C-50,210 40,170 80,100 C110,40 60,-40 0,0 Z" fill="url(#leaf2)"/>
            <ellipse cx="-45" cy="50" rx="9" ry="22" fill="url(#bg-warm)" transform="rotate(-25, -45, 50)"/>
            <ellipse cx="30" cy="65" rx="8" ry="20" fill="url(#bg-warm)" transform="rotate(25, 30, 65)"/>
            <ellipse cx="-20" cy="110" rx="7" ry="16" fill="url(#bg-warm)"/>
          </g>
          
          <!-- Right Leaf -->
          <g transform="translate(520, 240) rotate(35)">
            <path d="M0,0 C-60,-35 -100,35 -70,100 C-35,140 30,110 50,60 C65,15 35,-25 0,0 Z" fill="url(#leaf1)"/>
            <ellipse cx="-30" cy="40" rx="7" ry="16" fill="url(#bg-warm)" transform="rotate(-20, -30, 40)"/>
          </g>
        </g>
      </svg>
    `),
  },
  {
    id: 'watch',
    name: 'Chronograph Luxury Watch',
    category: 'Product / Jewelry',
    description: 'Stainless steel timepiece with intricate bezel and dial on a dark slate surface',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bg-watch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="steel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="30%" stop-color="#cbd5e1"/>
            <stop offset="70%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
          <filter id="watch-shadow">
            <feDropShadow dx="0" dy="20" stdDeviation="20" flood-opacity="0.35"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-watch)"/>
        
        <g filter="url(#watch-shadow)">
          <!-- Top Strap -->
          <rect x="345" y="70" width="110" height="150" rx="10" fill="#78350f" stroke="#451a03" stroke-width="3"/>
          <line x1="355" y1="90" x2="445" y2="90" stroke="#b45309" stroke-width="2" stroke-dasharray="6,4"/>
          <line x1="355" y1="130" x2="445" y2="130" stroke="#b45309" stroke-width="2" stroke-dasharray="6,4"/>
          
          <!-- Bottom Strap -->
          <rect x="345" y="380" width="110" height="150" rx="10" fill="#78350f" stroke="#451a03" stroke-width="3"/>
          <circle cx="400" cy="420" r="4" fill="#1e293b"/>
          <circle cx="400" cy="450" r="4" fill="#1e293b"/>
          <circle cx="400" cy="480" r="4" fill="#1e293b"/>
          
          <!-- Case & Lugs -->
          <path d="M330,190 L345,230 L345,370 L330,410 C330,410 325,400 325,300 C325,200 330,190 330,190 Z" fill="url(#steel)"/>
          <path d="M470,190 L455,230 L455,370 L470,410 C470,410 475,400 475,300 C475,200 470,190 470,190 Z" fill="url(#steel)"/>
          
          <!-- Outer Crown and Pushers -->
          <rect x="525" y="285" width="20" height="30" rx="4" fill="url(#steel)"/>
          <rect x="520" y="240" width="15" height="18" rx="3" fill="url(#steel)"/>
          <rect x="520" y="342" width="15" height="18" rx="3" fill="url(#steel)"/>
          
          <!-- Main Watch Bezel -->
          <circle cx="400" cy="300" r="130" fill="url(#steel)"/>
          <circle cx="400" cy="300" r="115" fill="#090d16" stroke="#475569" stroke-width="3"/>
          <circle cx="400" cy="300" r="105" fill="#020617"/>
          
          <!-- Dial Hour Markers -->
          <line x1="400" y1="205" x2="400" y2="220" stroke="#f8fafc" stroke-width="4"/>
          <line x1="400" y1="395" x2="400" y2="380" stroke="#f8fafc" stroke-width="4"/>
          <line x1="305" y1="300" x2="320" y2="300" stroke="#f8fafc" stroke-width="4"/>
          <line x1="495" y1="300" x2="480" y2="300" stroke="#f8fafc" stroke-width="4"/>
          
          <!-- Sub-dials -->
          <circle cx="365" cy="300" r="22" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
          <circle cx="435" cy="300" r="22" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
          <circle cx="400" cy="340" r="22" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
          
          <!-- Hands -->
          <line x1="400" y1="300" x2="365" y2="245" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>
          <line x1="400" y1="300" x2="445" y2="260" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
          <line x1="400" y1="315" x2="400" y2="225" stroke="url(#gold)" stroke-width="2" stroke-linecap="round"/>
          <circle cx="400" cy="300" r="6" fill="url(#gold)"/>
        </g>
      </svg>
    `),
  },
];
