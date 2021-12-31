import { SymbolAnnouncementDetails } from '../../../lib/data-source-worker/types'
import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import { config } from '../../../config'
import { BinanceArticle, BinanceResponse } from './types'
import { DataSourceWorker } from '../../../lib/data-source-worker'
import { getErrorMessage, NetworkError, NetworkResponseExpiredError } from '../../../lib/error'
import { getNumberInRange } from '../../../lib/math'
import { getResponseAge } from '../../../lib/network-request'
import { getNormalizedTime, TimeInMillis } from '../../../lib/date'


const DATA_SOURCE_WORKER_NAME = 'binancezh.com'
const DATA_SOURCE_WORKER_URL = 'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize='
const SYMBOL_REG_EXP = /\(([^()]*)\)/g
const MAX_RESPONSE_AGE_ALLOWED = 0
const TOO_MANY_REQUESTS_SLEEP_TIME_IN_MILLIS = TimeInMillis.ONE_MINUTE
const REQUEST_INTERVAL_IN_MILLIS = TimeInMillis.ONE_SECOND * 4
// const DATA_SOURCE_WORKER_URL ='https://www.binancezh.com/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize='


new class extends DataSourceWorker {
  constructor() {
    // pass configuration options to class parent
    super({
      name: DATA_SOURCE_WORKER_NAME,
      url: DATA_SOURCE_WORKER_URL,
      loggerColor: '#AA55FF'
    })
    // start polling interval
    setInterval(this.cycle.bind(this), REQUEST_INTERVAL_IN_MILLIS)
    this.lastListingReleaseDate = null
  }

  lastListingReleaseDate: number | null

  /**
   * cycle :
   * Method to be executed once per cycle, will ignore the call ig worker is sleeping,
   * otherwise get the symbols, and announce the new found symbols (unless symbols
   * list is empty)
   */
  async cycle() {
    if (this.isSleeping) return
    const data = await this.getSymbols()
    if (data) this.announceSymbols(data)
  }

  /**
   * fetchData :
   * Fetch the data from the source and perform some custom error management
   * to allow handling properly those specific cases
   */
  private async fetchData(): Promise<Response> {
    const response = await fetch(`${this.url}${getNumberInRange(10, 10)}`, {
      method: "GET",
      headers: { 'pragma': 'no-cache', 'Cache-Control': 'no-cache', cache: 'no-store' }
    })
    // If response status code is not 200 (Success) throw an error, also, if response 
    // age is too old throw an error
    if (response.status !== 200) throw new NetworkError(response.statusText, response.status)
    if (getResponseAge(response) > MAX_RESPONSE_AGE_ALLOWED) throw new NetworkResponseExpiredError(getResponseAge(response))
    return response
  }

  /**
   * Extracts the symbols from an article and returns and object with the symbols, and
   * some useful timestamps (releaseDate and detectionDate). If not symbols are found, returns null
   */
  private getSymbolsFromArticle(article: BinanceArticle): SymbolAnnouncementDetails | null {
    const data: SymbolAnnouncementDetails = {
      releaseDate: article.releaseDate,
      detectionDate: Date.now(),
      symbols: []
    }
    let result: RegExpExecArray | null
    while (result = SYMBOL_REG_EXP.exec(article.title)) {
      if (result) data.symbols.push(result[1])
    }
    return data.symbols.length ? data : null
  }

  /**
   * getSymbols :
   * Method to be executed on each polling cycle. 
   * Fetches the announcements, performing proper error handling, and filters out
   * the unwanted ones.
   */
  async getSymbols(): Promise<SymbolAnnouncementDetails | null> {
    let response: Response
    try {
      response = await this.fetchData()
    } catch (error) {
      // If age is to old abort
      if (error instanceof NetworkResponseExpiredError) return null
      // if too many requests error error, abort and freeze the polling
      if (error instanceof NetworkError && error.statusCode === 429) {
        this.logger.error(`Request failed: Too many requests! [429]`)
        this.logger.error(`Stopping requests for ${TOO_MANY_REQUESTS_SLEEP_TIME_IN_MILLIS / 1000} seconds`)
        await this.sleep(TOO_MANY_REQUESTS_SLEEP_TIME_IN_MILLIS)
        return null
      }
      // if any other unexpected error, abort...
      this.logger.error(`Request failed: ${getErrorMessage(error)}`)
      return null
    }
    // data fetch successful! Get last announcement...
    const responseJson: BinanceResponse = await response.json()
    const articles = responseJson.data.catalogs[0].articles
    const mostRecentArticle = articles[0]
    // and block if is not a Listing announcement, or if is too old
    const releaseDateLimit = Date.now() - config.discardSignalsOlderThanMillis
    const isListing = mostRecentArticle.title.includes('Binance Will List')
    const isTooOld = mostRecentArticle.releaseDate > releaseDateLimit
    if (!isListing || isTooOld) return null
    else {
      // Otherwise, extract symbols...
      const symbolsData = this.getSymbolsFromArticle(mostRecentArticle)
      // print debugging info on screen
      if (this.lastListingReleaseDate !== mostRecentArticle.releaseDate) {
        this.logger.info('DEBUG : Detected listing', getNormalizedTime(mostRecentArticle.releaseDate), mostRecentArticle.title)
        this.lastListingReleaseDate = mostRecentArticle.releaseDate
      }
      // and return the symbols data...
      return symbolsData
    }
  }
}