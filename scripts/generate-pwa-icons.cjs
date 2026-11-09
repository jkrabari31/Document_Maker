const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.44;
  const cornerRadius = isMaskable ? 0 : size * 0.22;

  // Colors
  const bgDark = [15, 23, 42];     // #0f172a
  const bgBlue = [30, 58, 138];    // #1e3a8a
  const bgLight = [37, 99, 235];   // #2563eb
  const gold = [217, 119, 6];      // #d97706
  const goldLight = [245, 158, 11]; // #f59e0b
  const white = [255, 255, 255];
  const paperLine = [203, 213, 225]; // #cbd5e1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Distance from center for radial gradient
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = Math.min(1, dist / (size * 0.7));

      let r = Math.round(bgBlue[0] * (1 - normDist * 0.4) + bgDark[0] * (normDist * 0.4));
      let g = Math.round(bgBlue[1] * (1 - normDist * 0.4) + bgDark[1] * (normDist * 0.4));
      let b = Math.round(bgBlue[2] * (1 - normDist * 0.4) + bgDark[2] * (normDist * 0.4));
      let a = 255;

      // Check rounded rect boundary (if not maskable)
      if (!isMaskable) {
        // Distance to rounded corner
        const qx = Math.max(0, Math.abs(dx) - (center - cornerRadius));
        const qy = Math.max(0, Math.abs(dy) - (center - cornerRadius));
        const cornerDist = Math.sqrt(qx * qx + qy * qy);
        if (cornerDist > cornerRadius) {
          a = 0; // Transparent outside rounded rect
        } else if (cornerDist > cornerRadius - 1.5) {
          a = Math.round(255 * (cornerRadius - cornerDist) / 1.5);
        }
      }

      if (a > 0) {
        // Inner golden circle ring
        const ringRadius = size * 0.38;
        const ringThickness = size * 0.018;
        const ringDist = Math.abs(dist - ringRadius);
        if (ringDist < ringThickness) {
          const factor = 1 - (ringDist / ringThickness);
          r = Math.round(r * (1 - factor) + goldLight[0] * factor);
          g = Math.round(g * (1 - factor) + goldLight[1] * factor);
          b = Math.round(b * (1 - factor) + goldLight[2] * factor);
        }

        // Draw Document Paper
        // Document bounds (centered)
        const docW = size * 0.40;
        const docH = size * 0.50;
        const docLeft = center - docW / 2;
        const docRight = center + docW / 2;
        const docTop = center - docH / 2;
        const docBottom = center + docH / 2;
        const foldSize = size * 0.11;

        const inDocX = x >= docLeft && x <= docRight;
        const inDocY = y >= docTop && y <= docBottom;

        if (inDocX && inDocY) {
          // Check top-right fold
          const inFoldCorner = (x >= docRight - foldSize) && (y <= docTop + foldSize);
          const foldCut = (x - (docRight - foldSize)) + ((docTop + foldSize) - y) > foldSize;

          if (!inFoldCorner || !foldCut) {
            // Inside main paper
            r = white[0];
            g = white[1];
            b = white[2];

            // Fold flap shadow / flap
            if (inFoldCorner && !foldCut) {
              const foldEdge = Math.abs((x - (docRight - foldSize)) + ((docTop + foldSize) - y) - foldSize);
              if (foldEdge < size * 0.015) {
                r = 203; g = 213; b = 225;
              } else {
                r = 241; g = 245; b = 249;
              }
            }

            // Document text lines
            const lineLeft = docLeft + size * 0.05;
            const lineRight = docRight - size * 0.05;
            const l1Y = docTop + size * 0.16;
            const l2Y = docTop + size * 0.23;
            const l3Y = docTop + size * 0.30;
            const l4Y = docTop + size * 0.37;
            const lineH = size * 0.018;

            const isLine1 = y >= l1Y && y <= l1Y + lineH && x >= lineLeft && x <= docRight - foldSize - size * 0.02;
            const isLine2 = y >= l2Y && y <= l2Y + lineH && x >= lineLeft && x <= lineRight;
            const isLine3 = y >= l3Y && y <= l3Y + lineH && x >= lineLeft && x <= lineRight - size * 0.06;
            const isLine4 = y >= l4Y && y <= l4Y + lineH && x >= lineLeft && x <= lineRight - size * 0.12;

            if (isLine1 || isLine2 || isLine3 || isLine4) {
              const isHeader = isLine1;
              r = isHeader ? bgBlue[0] : paperLine[0];
              g = isHeader ? bgBlue[1] : paperLine[1];
              b = isHeader ? bgBlue[2] : paperLine[2];
            }

            // Gold Notary / Legal Seal on bottom right of paper
            const sealX = docRight - size * 0.08;
            const sealY = docBottom - size * 0.08;
            const sDist = Math.hypot(x - sealX, y - sealY);
            const sealR = size * 0.065;
            if (sDist <= sealR) {
              r = gold[0];
              g = gold[1];
              b = gold[2];
              if (sDist <= sealR * 0.65 && sDist >= sealR * 0.45) {
                r = goldLight[0]; g = goldLight[1]; b = goldLight[2];
              }
            }
          }
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}

// Ensure public dir exists
const publicDir = path.resolve(__dirname, '../public');

console.log('Generating PWA Icons in:', publicDir);

// 1. 192x192 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createIcon(192, false));
console.log('✓ Created pwa-192x192.png');

// 2. 512x512 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createIcon(512, false));
console.log('✓ Created pwa-512x512.png');

// 3. 512x512 Maskable PNG (full bleed background for Android adaptive icons)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createIcon(512, true));
console.log('✓ Created pwa-maskable-512x512.png');

// 4. 180x180 Apple Touch Icon
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIcon(180, false));
console.log('✓ Created apple-touch-icon.png');

// 5. 32x32 Favicon
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), createIcon(32, false));
console.log('✓ Created favicon-32x32.png');

// 6. SVG Icon for modern browsers
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="60%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>

  <!-- Decorative gold border ring -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="url(#goldGrad)" stroke-width="8" opacity="0.6"/>

  <!-- Main Legal Document -->
  <g filter="url(#dropShadow)">
    <!-- Document Body -->
    <path d="M 156 128 L 306 128 L 356 178 L 356 384 C 356 392.8 348.8 400 340 400 L 156 400 C 147.2 400 140 392.8 140 384 L 140 144 C 140 135.2 147.2 128 156 128 Z" fill="#ffffff"/>
    
    <!-- Folded Corner -->
    <path d="M 306 128 L 356 178 L 314 178 C 309.6 178 306 174.4 306 170 Z" fill="#e2e8f0"/>

    <!-- Document Content Lines -->
    <rect x="170" y="196" width="110" height="12" rx="4" fill="#1e3a8a"/>
    <rect x="170" y="226" width="160" height="10" rx="3" fill="#cbd5e1"/>
    <rect x="170" y="252" width="160" height="10" rx="3" fill="#cbd5e1"/>
    <rect x="170" y="278" width="130" height="10" rx="3" fill="#cbd5e1"/>
    <rect x="170" y="304" width="110" height="10" rx="3" fill="#cbd5e1"/>

    <!-- Gold Notary Seal / Stamp Badge -->
    <circle cx="316" cy="350" r="32" fill="url(#goldGrad)"/>
    <circle cx="316" cy="350" r="24" fill="none" stroke="#fef3c7" stroke-width="2.5" stroke-dasharray="4,2"/>
    <path d="M 316 338 L 320 346 L 328 348 L 322 354 L 324 362 L 316 357 L 308 362 L 310 354 L 304 348 L 312 346 Z" fill="#ffffff"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'pwa-icon.svg'), svgIcon);
console.log('✓ Created pwa-icon.svg');

