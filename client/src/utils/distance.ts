// utils/distance.ts
export const getDistance = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};