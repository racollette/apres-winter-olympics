export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.sqrt(deltaX ** 2 + deltaY ** 2);
}
