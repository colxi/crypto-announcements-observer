import { DataSource, SymbolAnnoucementDetails } from '../../../lib/data-sources'
import fetch from 'node-fetch'
import { config } from '../../../config'
import { BinanceResponse } from './types'

export const binanceSource = new DataSource({
  name: 'binancezh.com',
  source: 'https://www.binancezh.com/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=10',
  async getSymbols(){
    const SYMBOL_REG_EXP = /\(([^()]*)\)/g
    const ANTI_CACHE = `&date=${Date.now()}`
    const response = await fetch(`${this.source}${ANTI_CACHE}`, { method: "GET" })
    const responsJson: BinanceResponse = await response.json()
    // select only listing anouncements, and signals that are not older than 5 sec ( this last check
    // prevents false positives during first fetch )
    const releaseDateLimit = Date.now() - config.discardSignalsOlderThanMilis
    const articles = responsJson.data.catalogs[0].articles
    const symbols: SymbolAnnoucementDetails[] = []
    articles
      .filter((a) => {
        return Boolean(
          a.title.includes('Binance Will List')  && 
          a.releaseDate > releaseDateLimit 
        )
      })
      .forEach((a) => { 
        let result: RegExpExecArray | null
        while(result=SYMBOL_REG_EXP.exec(a.title)) {
          if(result) {
            symbols.push({ 
              symbol:result[1],
              timestamp : a.releaseDate
            })
          }
        }
      })
    return symbols
  }
})