import { SpotApi, Ticker } from 'gate-api'

interface PriceData { 
  timestamp : number
  price : number 
  priceChangePercent: number
}

class GateClient {
  constructor() {
    this.spot = new SpotApi()
  }

  spot: SpotApi

  async getSymbolPrice(symbol: string) :Promise<number>{
    const assetPair = `${symbol}_USDT`
    let assetPairInfo: Ticker
    let price: string
    try {
      const response = await this.spot.listTickers({ 'currencyPair': assetPair })
      assetPairInfo = response.body[0]
      if(!assetPairInfo.last) throw new Error(`Symbol price not available ${assetPair}`)
      price = assetPairInfo.last 
    } catch (e) {
      throw new Error(`Failed fetching symbol price price ${assetPair}`)
    }
    return Number(price)
  }

  followPriceChanges(symbol: string, intervalInMilis:number, times:number): Promise<PriceData[]> {
    return new Promise( async (resolve, reject) =>{
      let cycleCount = 0
      const priceData : PriceData[] = []

      const runCiceCheckCycle = async ()=>{
        let price: number
        // get price, or reject promise in case of failure
        try{ price = await this.getSymbolPrice(symbol) }
        catch(e){ return reject(e) }
        // calculate price variation
        let priceChangePercent = 0
        if( cycleCount > 0 ){
          const initialPrice = priceData[0].price 
          const priceChange = price - initialPrice
          priceChangePercent = Number( (priceChange * 100 / initialPrice).toFixed(4) ) 
        }
        const timestamp = Date.now()
        priceData.push( { timestamp, price, priceChangePercent } ) 
        cycleCount++
        // if completed all checks resolve the promise, otherwise schedule
        // another cycle with the provided time interval
        if(cycleCount >= times) resolve(priceData)
        else setTimeout( runCiceCheckCycle, intervalInMilis)
      }

      // run first price check
      runCiceCheckCycle()
    })
  }
}

export const gateClient = new GateClient() 