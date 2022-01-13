import { parentPort, MessagePort } from 'worker_threads'
import { v4 as uuid } from 'uuid'
import { DataSourceMessageType, DataSourceWorkerOptions, SymbolAnnouncementDetails } from './types'
import { WorkerMessage } from '../worker-manager/types'
import { isValidMessage } from '../worker-manager'
import { sleep } from '../sleep'
import Logger from '../logger'
import { LoggerColorRGB } from '../logger/helpers'


function initializeWorkerErrorHandling() {
  // for some reason the following listeners are needed in order to allow
  // the main thread capture the error (otherwise only displays "worker crashed!")
  // without displaying the errors on the specific error
  process.on('uncaughtException', (err) => { throw err })
  process.on('uncaughtException', (err) => { throw err })
}



export class DataSourceWorker {
  public constructor(options: DataSourceWorkerOptions) {
    initializeWorkerErrorHandling()
    this.workerMessagePort = parentPort!
    this.isSleeping = false
    this.name = options.name
    this.url = options.url
    this.workerMessagePort.on('message', this.onWorkerParentMessage.bind(this))
    this.logger = Logger.createLogger({
      showTimestamp: true,
      context: {
        text: `source:${options.name}`,
        color: new LoggerColorRGB('#FFFFFF'),
        background: new LoggerColorRGB(options.loggerColor),
        padding: 1
      }
    })

  }

  public name: string
  public url: string
  private workerMessagePort: MessagePort
  protected isSleeping: boolean

  protected logger: Logger

  private async onWorkerParentMessage(message: unknown) {
    if (!isValidMessage(message)) {
      const strMessage = typeof message === 'object' ? JSON.stringify(message) : message
      throw new Error(`Invalid message format: ${strMessage}`)
    }

    switch (message.type) {
      case DataSourceMessageType.GET_SOURCE_NAME: {
        this.sendWorkerMessage({
          id: message.id,
          type: 'RESPONSE',
          data: this.name
        })
        break
      }
      case DataSourceMessageType.GET_SOURCE_URL: {
        this.sendWorkerMessage({
          id: message.id,
          type: 'RESPONSE',
          data: this.url
        })
        break
      }
      default: {
        throw new Error(`Unknown message type: ${message.type}`)
      }
    }
  }

  protected sendWorkerMessage(message: WorkerMessage) {
    this.workerMessagePort.postMessage(message)
  }

  public announceSymbols(data: SymbolAnnouncementDetails) {
    this.sendWorkerMessage({
      id: uuid(),
      type: DataSourceMessageType.SYMBOL_ANNOUNCEMENT,
      data: data
    })
  }

  protected async sleep(milliseconds: number) {
    this.isSleeping = true
    await sleep(milliseconds)
    this.isSleeping = false
  }
}

