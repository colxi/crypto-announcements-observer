import { ColorDescriptor } from './types'

const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
const hexColorRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

export function hexColorToRGB(hex: string): ColorDescriptor {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  hex = hex.replace(
    shorthandRegex,
    (
      m: unknown,
      r: string,
      g: string,
      b: string
    ) => `${r}${r}${g}${g}${b}${b}`
  )
  const result = hexColorRegex.exec(hex) || []
  return {
    r: parseInt(result[1], 16) || 0,
    g: parseInt(result[2], 16) || 0,
    b: parseInt(result[3], 16) || 0
  }
}

export class LoggerColorRGB {
  constructor(hexColor: string) {
    const colorRgb = hexColorToRGB(hexColor)
    this.r = colorRgb.r
    this.g = colorRgb.g
    this.b = colorRgb.b
  }

  public readonly r: number
  public readonly g: number
  public readonly b: number

  public colorToANSI(): string {
    return `\x1B[38;2;${this.r};${this.g};${this.b}m`
  }

  public backgroundToANSI(): string {
    return `\x1B[48;2;${this.r};${this.g};${this.b}m`
  }
}


export function isChainable(i: any): boolean {
  return typeof i === 'string' || typeof i === 'number' || typeof i === 'boolean'
}