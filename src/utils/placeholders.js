export function placeholderDataURI(width = 400, height = 400, text = 'Image') {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <rect width='100%' height='100%' fill='#f3f4f6' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='${Math.max(
      12,
      Math.floor(Math.min(width, height) / 10)
    )}'>${text}</text>
  </svg>`;
  // encodeURIComponent keeps the string safe for use as a data URI
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_PLACEHOLDER = placeholderDataURI();
