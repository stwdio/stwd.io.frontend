export function generateIdenticon(userId: string): string {
  // Simple identicon generator using canvas
  if (typeof window === "undefined") return ""

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  canvas.width = 64
  canvas.height = 64

  // Generate colors based on user ID
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const hue = Math.abs(hash) % 360
  const saturation = 70
  const lightness = 50

  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  ctx.fillRect(0, 0, 64, 64)

  // Add pattern
  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness - 20}%)`
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((hash >> (i + j)) & 1) {
        ctx.fillRect(i * 8, j * 8, 8, 8)
      }
    }
  }

  return canvas.toDataURL()
}
