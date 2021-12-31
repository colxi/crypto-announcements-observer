
/**
 * 
 * 
 */
export function getNumberInRange(min: number, max: number) {
  const val = Math.random()
  return Math.round(val * (max - min)) + min
}

