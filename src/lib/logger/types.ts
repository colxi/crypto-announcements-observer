import { LoggerColorRGB } from './helpers'

export enum LoggerFontStyle {
  reset = "\x1b[0m",
  bold = "\x1b[1m",
  dim = "\x1b[2m",
  italic = "\x1B[3m",
  underscore = "\x1b[4m",
  blink = "\x1b[5m",
  reverse = "\x1b[7m",
  strike = "\x1B[9m"
}

export enum LoggerFontColor {
  black = "\x1b[30m",
  red = "\x1b[31m",
  green = "\x1b[32m",
  yellow = "\x1b[33m",
  blue = "\x1b[34m",
  magenta = "\x1b[35m",
  cyan = "\x1b[36m",
  white = "\x1b[37m",
}

export enum LoggerFontBackground {
  black = "\x1b[40m",
  red = "\x1b[41m",
  green = "\x1b[42m",
  yellow = "\x1b[43m",
  blue = "\x1b[44m",
  magenta = "\x1b[45m",
  cyan = "\x1b[46m",
  white = "\x1b[47m",
}


export interface LoggerFormattedTextOptions {
  style?: keyof typeof LoggerFontStyle
  color?: keyof typeof LoggerFontColor | LoggerColorRGB
  background?: keyof typeof LoggerFontBackground | LoggerColorRGB
  padding?: number
  reset?: boolean
  text: string
}

export interface LoggerOptions {
  showTimestamp?: boolean
  context: LoggerFormattedTextOptions | LoggerFormattedTextOptions[]
}

export interface ColorDescriptor {
  r: number
  g: number
  b: number
}