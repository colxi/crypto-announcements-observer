import { DataSource } from '../lib/data-sources'
import fetch from 'node-fetch'
import { config } from '@/config'

export const sources = [
  new DataSource({
    name: 'binancezh.com',
    source: 'https://www.binancezh.com/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=10',
    async getSymbols(){
      const SYMBOL_REG_EXP = /\((?<symbol>.+)\)/
      const ANTI_CACHE = `&date=${Date.now()}`
      const response = await fetch(`${this.source}${ANTI_CACHE}`, { method: "GET" })
      const responsJson: any = await response.json()
      // select only listing anouncements, and signals that are not older than 5 sec ( this last check
      // prevents false positives during first fetch )
      const releaseDateLimit = Date.now() - config.discardSignalsOlderThanMilis
      const articles: { title: string, releaseDate: number }[] = responsJson.data.catalogs[0].articles
      const symbols = articles
        .filter((a) => a.title.includes('Binance Will List')  && a.releaseDate > releaseDateLimit )
        .map((a) => { 
          return { 
           symbol: a.title.match(SYMBOL_REG_EXP)?.groups?.symbol || '__UNKNOWN__',
           timestamp : a.releaseDate
          } 
        })
      // UNCOMMENT NEXT LINE TO TEST A SYMBOL ANNOUNCEMENT
      // return ['ATLAS']
      return symbols
    }
  })
]


