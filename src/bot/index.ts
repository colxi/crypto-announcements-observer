import { config } from '../config'
import { DataSourceMessageType, SymbolAnnouncementDetails } from '../lib/data-source-worker/types'
import { gateClient } from '@/clients/gate.io'
import { binanceClient } from '@/clients/binance'
import { getNormalizedTime } from '../lib/date'
import { WorkerManager } from '@/lib/worker-manager'
import { WorkerMessage } from '@/lib/worker-manager/types'


const dataSourceWorkers = [
  './src/bot/data-sources/binance-zh/index.ts'
]

export class CryptoAnnouncementsObserver {
  private constructor(binanceAssets: string[], dataSourcesWorkers: WorkerManager[]) {
    this.existingSymbols = binanceAssets
    this.workers = dataSourcesWorkers
    console.log('Bot ready. Listening to changes...')
    for (const worker of this.workers) {
      worker.addEventListener('onMessage', this.onWorkerMessage.bind(this))
    }
  }

  /** Public bot factory method */
  public static async create(): Promise<CryptoAnnouncementsObserver> {
    const binanceTradeableAssets = await binanceClient.getTradeableAssets()
    console.log(config.botWelcomeMessage)
    console.log('Polling interval =', config.pollingInterval, 'ms')
    console.log('Available data sources:', dataSourceWorkers.length)

    const workers: WorkerManager[] = []
    for (const dataSourceWorker of dataSourceWorkers) {
      const worker = new WorkerManager(dataSourceWorker)
      workers.push(worker)
      const name = await worker.request(DataSourceMessageType.GET_SOURCE_NAME)
      const url = await worker.request(DataSourceMessageType.GET_SOURCE_URL)
      console.log(`- ${name}`)
      console.log(`  ${url}`)
      console.log()
    }
    return new CryptoAnnouncementsObserver(binanceTradeableAssets, workers)
  }

  public readonly existingSymbols: string[]
  public readonly workers: WorkerManager[]

  private onWorkerMessage(msg: WorkerMessage) {
    console.log('main: message!', msg)
  }

  private async cycle() {
    // for (const dataSource of this.dataSources) {
    //   let announcedSymbols: SymbolAnnouncementDetails[]
    //   // get last announced symbols
    //   try {
    //     announcedSymbols = await dataSource.getSymbols()
    //   } catch (e) {
    //     logError(
    //       `Failed fetching announcements data from: ${dataSource.name}`,
    //       `\n---------`, e instanceof Error ? e.message : e
    //     )
    //     continue
    //   }
    //   // discard existing symbols and proceed with new ones
    //   const newSymbols = announcedSymbols.filter(i => !(this.existingSymbols.includes(i.symbol)))
    //   for (const symbolData of newSymbols) {
    //     // add symbol to known/existing symbol s list
    //     this.existingSymbols.push(symbolData.symbol)
    //     console.log(`New symbol detected in ${dataSource.name}`)
    //     console.log(`Symbol name : ${symbolData.symbol}`)
    //     console.log(`Announcement time : ${getNormalizedTime(symbolData.timestamp)}`)
    //     console.log(`Detection time : ${getNormalizedTime()}`)

    //     // get initial price on gate.io and block if coin is not found
    //     let initialPrice: number
    //     try { initialPrice = await gateClient.getSymbolPrice(symbolData.symbol) }
    //     catch (e) {
    //       logError(`Failed getting symbol price ${symbolData.symbol}`)
    //       continue
    //     }
    //     console.log(`${symbolData.symbol} initial price : `, initialPrice)
    //     console.log(`Tracking price changes for ${symbolData.symbol}...`)

    //     // track symbol price progression in gate.io
    //     try {
    //       const priceChanges = await gateClient.followPriceChanges('TRU', config.priceFollowInterval, config.priceFollowTimes)
    //       priceChanges.forEach(p => console.log(`${getNormalizedTime(p.timestamp)} - ${p.price}$ - ${p.priceChangePercent}%`))
    //     } catch (e) {
    //       logError(`Failed tracking symbol price for ${symbolData.symbol}`)
    //       continue
    //     }
    //   }
    // }
  }
}

