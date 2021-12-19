import { config } from '../config'
import { sources } from './sources'
import { logError } from '../lib/log'
import { DataSource, SymbolAnnoucementDetails } from '../lib/data-sources'
import { gateClient } from '@/clients/gate.io'
import { binanceClient } from '@/clients/binance'
import { getNormalizedTime } from '@/lib/date'

export class CryptoAnnouncementsObserver{
  private constructor(binanceAssets: string[], sources : DataSource[]){
    this.existingSymbols = binanceAssets
    this.sources = sources
    setInterval(this.cycle.bind(this), config.pollingInterval)
    console.log('Bot ready. Listening to changes...')
  }

  /** Public bot factory method */
  public static async create(): Promise<CryptoAnnouncementsObserver>{
    const binanceTradeableAssets = await binanceClient.getTradeableAssets()
    console.log(config.botWelcomeMessage)
    console.log('Polling interval =', config.pollingInterval, 'ms')
    console.log('Available data sources:', sources.length)
    for (const source of sources) {
      console.log(`- ${source.name}`)
      console.log(`  ${source.source}`)
      console.log()
    }
    return new CryptoAnnouncementsObserver(binanceTradeableAssets, sources)
  }

  public readonly existingSymbols : string[]
  public readonly sources : DataSource[]

  private async cycle(){
    for (const source of this.sources) {
      let announcedSymbols: SymbolAnnoucementDetails[]
      // get last announced symbols
      try {
        announcedSymbols = await source.getSymbols()
      } catch (e) {
        logError(
          `Failed fetching announcements data from: ${source.name}`, 
          `\n---------`,  e instanceof Error ?  e.message : e
        )
        continue
      }
      // discard existing symbols and proceed with new ones
      const newSymbols = announcedSymbols.filter( i => !(this.existingSymbols.includes(i.symbol)) )
      for (const symbolData of newSymbols) {
        // add symbol to known/existing symbol s list
        this.existingSymbols.push(symbolData.symbol)
        console.log(`New symbol detected in ${source.name}`)
        console.log(`Symbol name : ${symbolData.symbol}`)
        console.log(`Announcement time : ${getNormalizedTime(symbolData.timestamp)}`)
        console.log(`Detection time : ${getNormalizedTime()}`)

        // get initial price on gate.io and block if coin is not found
        let initialPrice : number
        try{ initialPrice = await gateClient.getSymbolPrice(symbolData.symbol) }
        catch(e){ 
          logError(`Failed getting symbol price ${symbolData.symbol}`)
          continue 
        }
        console.log(`${symbolData.symbol} initial price : `, initialPrice)
        console.log(`Tracking price changes for ${symbolData.symbol}...`)

        // track symbol price progression in gate.io
        try{
          const priceChanges = await gateClient.followPriceChanges('TRU', config.priceFollowInterval, config.priceFollowTimes)
          priceChanges.forEach( p => console.log(`${getNormalizedTime(p.timestamp)} - ${p.price}$ - ${p.priceChangePercent}%`)) 
        }catch(e){
          logError(`Failed tracking symbol price for ${symbolData.symbol}`)
          continue
        }
      }
    }
  }
}

