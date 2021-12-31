import { v4 as uuid } from 'uuid'
import { Worker } from 'worker_threads'
import Logger from '../logger'
import { sleep } from '../sleep'
import { WorkerOngoingRequestsMap, WorkerMessage, WorkerRequestId } from './types'

export const logger = Logger.createLogger({
  showTimestamp: true,
  context: {
    text: `WORKER-MANAGER`
  }
})


export function isValidMessage(message: unknown): message is WorkerMessage {
  if (!message) return false
  if (typeof message !== 'object') return false
  if (!('id' in message)) return false
  if (!('type' in message)) return false
  if (!('data' in message)) return false
  return true
}

// TODO: Timestamp requestResolvers and create a service that monitor for responses
// timeouts. In case of timeout should reject the promise (rejector should be also stored on Map), 
// and remove the entry from the collection when threshold is reached

export class WorkerManager {
  constructor(path: string) {
    this.path = path
    this.workerOngoingRequests = new Map<WorkerRequestId, WorkerOngoingRequestsMap>()
    this.onMessageHandler = () => { }
    this.worker = this.createWorker()
    this.workerRequestTimeoutInMillis = 10000
    setInterval(this.timeoutServiceCycle.bind(this), 1000)
  }

  private path: string
  private worker: Worker
  private workerRequestTimeoutInMillis: number
  private workerOngoingRequests: Map<WorkerRequestId, WorkerOngoingRequestsMap>
  private onMessageHandler: (message: WorkerMessage) => any

  private createWorker(): Worker {
    // Workaround to load TS based worker files
    const worker = new Worker(`
      require('ts-node/register');
      require(require('worker_threads').workerData.runThisFileInTheWorker);
    `, {
      eval: true,
      workerData: {
        runThisFileInTheWorker: this.path
      }
    })

    // handle worker messages
    worker.on('message', (message: any) => {
      this.onMessage(message)
    })

    // handle worker errors (display on console)
    worker.on('error', (e: any) => {
      logger.error(`Worker Error: ${this.path}`)
      logger.error(`${e?.message}`)
    })

    // handle worker terminations
    worker.on('exit', async (code: any) => {
      if (code !== 0) {
        logger.error(`Worker ${this.path} crashed! (exitCode: ${code})`)
        logger.error(`Re-spawning worker... ${this.path}`)
        await sleep(200)
        this.worker = this.createWorker()
      }
    })

    return worker
  }

  private onMessage(message: unknown) {
    if (!isValidMessage(message)) throw new Error(`Invalid message received from worker : ${this.path}`)
    if (message.type === 'RESPONSE') {
      if (!this.workerOngoingRequests.has(message.id)) throw new Error('Response message with unknown id')
      const resolver = this.workerOngoingRequests.get(message.id)!.resolve
      resolver(message.data)
      this.workerOngoingRequests.delete(message.id)
    } else this.onMessageHandler(message)
  }

  private timeoutServiceCycle() {
    const now = Date.now()

    this.workerOngoingRequests.forEach((request, requestId) => {
      const elapsedTime = now - request.timestamp
      if (elapsedTime > this.workerRequestTimeoutInMillis) {
        this.workerOngoingRequests.delete(requestId)
        request.reject(`Worker request timed out`)
      }
    })
  }

  public addEventListener(eventName: 'onMessage', handler: (message: WorkerMessage) => void) {
    this.onMessageHandler = handler
  }

  public request(type: string, data: any = null) {
    const id: WorkerRequestId = uuid()
    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      this.workerOngoingRequests.set(id, { resolve, reject, timestamp })
      this.sendMessage({ id, type, data })
    })
  }


  public sendMessage(message: WorkerMessage) {
    this.worker.postMessage(message)
  }

}

