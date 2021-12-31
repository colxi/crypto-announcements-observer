import { getTimeAsHHMMSS } from '../date'
import { isChainable, LoggerColorRGB } from './helpers'
import {
  LoggerFontBackground,
  LoggerFontColor,
  LoggerFontStyle,
  LoggerFormattedTextOptions,
  LoggerOptions
} from './types'


export default class Logger {
  constructor(options: LoggerOptions) {
    this.#showTimestamp = options.showTimestamp || false
    this.#contextTree = Array.isArray(options.context) ? options.context : [options.context]
  }


  #contextTree: LoggerFormattedTextOptions[]
  #showTimestamp: boolean


  /**
   *
   *
   */
  public createLogger(options: LoggerOptions): Logger {
    const context = Array.isArray(options.context) ? options.context : [options.context]
    return new Logger({
      showTimestamp: 'renderTime' in options ? options.showTimestamp : this.#showTimestamp,
      context: [...this.#contextTree, ...context]
    })
  }

  /**
  *
  *
  */
  static createLogger(options: LoggerOptions): Logger {
    const context = Array.isArray(options.context) ? options.context : [options.context]
    return new Logger(options)
  }

  /**
   *
   *
   */
  static hexColor(hexColor: string): LoggerColorRGB {
    return new LoggerColorRGB(hexColor)
  }


  /**
   *
   *
   */
  public hexColor(hexColor: string): LoggerColorRGB {
    return new LoggerColorRGB(hexColor)
  }


  /**
   *
   *
   */
  public formatText(options: LoggerFormattedTextOptions): string {
    let text = options.text
    let result = ''
    if (options.style) result += LoggerFontStyle[options.style]
    if (options.background) {
      result += options.background instanceof LoggerColorRGB
        ? options.background.backgroundToANSI()
        : LoggerFontBackground[options.background]
    }
    if (options.color) {
      result += options.color instanceof LoggerColorRGB
        ? options.color.colorToANSI()
        : LoggerFontColor[options.color]
    }
    if (options.padding) text = text.padStart(text.length + options.padding).padEnd(text.length + (options.padding * 2))
    result += text
    if (options.reset !== false) result += LoggerFontStyle.reset
    return result
  }


  /**
   * 
   * 
   */
  public error(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatText({
      color: 'red',
      text: message
    })
    this.log(formattedMessage, ...args)
  }


  /**
   *
   *
   */
  public warn(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatText({
      color: 'yellow',
      text: message
    })
    this.log(formattedMessage, ...args)
  }


  /**
   *
   *
   */
  public info(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatText({
      color: 'blue',
      text: message
    })
    this.log(formattedMessage, ...args)
  }


  /**
   *
   *
   */
  public log(message: string, ...args: unknown[]): void {
    const items: any[] = []
    // render the contexts
    for (const context of this.#contextTree) {
      const formatted = this.formatText(context)
      if (!items.length) items.push(formatted)
      else items[items.length - 1] = [items[0], formatted].join('')
    }

    // add an arrow at th end of te context
    if (this.#contextTree[this.#contextTree.length - 1].background) {
      const ending = this.formatText({
        color: this.#contextTree[this.#contextTree.length - 1].background,
        text: ''
      })
      items[items.length - 1] = [items[0], ending].join('')
    }

    // add message
    items.push(message)
    if (args.length) items.push('\n')

    // metadata
    for (const arg of args) {
      const last: any = items[items.length - 1]
      if (isChainable(last) && isChainable(arg)) items[items.length - 1] = [last, arg].join('')
      else items.push(arg)
    }

    // If running in debug mode, remove all formatting special chars  in order to display 
    // a clean  view of the messages in the browser console
    const isDebugMode = typeof global.v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' '))
    if (isDebugMode) {
      /*eslint no-control-regex: "off"*/
      const formatting = /((\[48|\[38|\[0)((;\d+)+)?m)|\u001B/g
      const arrow = //g
      for (const i in items) {
        if (typeof items[i] === 'string') items[i] = items[i].replace(formatting, '').replace(arrow, '-->')
      }
    }

    // render message data
    if (this.#showTimestamp) console.log(getTimeAsHHMMSS(), ...items, isDebugMode ? '' : LoggerFontStyle.reset)
    else console.log(...items, isDebugMode ? '' : LoggerFontStyle.reset)
  }
}