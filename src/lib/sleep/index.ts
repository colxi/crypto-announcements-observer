export function sleep(timeInMillis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeInMillis))
}
