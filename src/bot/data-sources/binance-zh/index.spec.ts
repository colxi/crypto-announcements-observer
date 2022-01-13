import { binanceSource } from '.'
import * as fetchModules from 'node-fetch'
import { Response } from 'node-fetch'
import { BinanceArticle, BinanceResponse } from './types'
import { config } from '../../../config'

const fetchSpy = jest.spyOn(fetchModules, 'default')

describe('binance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches data', async () => {
    const result = await binanceSource.getSymbols()
    expect(fetchSpy).toBeCalled()
  })

  it('It detects multiple coins in single anouncement', async () => {
    const article1Mock = createArticle('Binance Will List Spell Token (SPELL) and TerraUSD (UST)', Date.now())
    const reponseMock = createResponse([article1Mock])
    fetchSpy.mockResolvedValue(reponseMock)
    const result = await binanceSource.getSymbols()
    expect(result).toStrictEqual([
      { symbol: "SPELL", timestamp: article1Mock.releaseDate },
      { symbol: "UST", timestamp: article1Mock.releaseDate },
    ])
  })

  it('It detects multiple coins in multiple announcement', async () => {
    const article1Mock = createArticle('Binance Will List Spell Token (SPELL) and TerraUSD (UST)', Date.now())
    const article2Mock = createArticle('Binance Will List Convex Finance (CVX) and ConstitutionDAO (PEOPLE)', Date.now())
    const reponseMock = createResponse([article1Mock, article2Mock])
    fetchSpy.mockResolvedValue(reponseMock)
    const result = await binanceSource.getSymbols()
    expect(result).toStrictEqual([
      { symbol: "SPELL", timestamp: article1Mock.releaseDate },
      { symbol: "UST", timestamp: article1Mock.releaseDate },
      { symbol: "CVX", timestamp: article2Mock.releaseDate },
      { symbol: "PEOPLE", timestamp: article2Mock.releaseDate }
    ])
  })

  it('It discards old announcements', async () => {
    const articleDateMock = Date.now() - config.discardSignalsOlderThanMillis - 1
    const article1Mock = createArticle('Binance Will List Spell Token (SPELL)', articleDateMock)
    const reponseMock = createResponse([article1Mock])
    fetchSpy.mockResolvedValue(reponseMock)
    const result = await binanceSource.getSymbols()
    expect(result).toStrictEqual([])
  })
})


// MOCK FACTORIES 

function createResponse(articles: BinanceArticle[] = []): Response {
  const response: BinanceResponse = { data: { catalogs: [{ articles }] } }
  return new fetchModules.Response(JSON.stringify(response))
}

function createArticle(title: string, releaseDate: number = Date.now()): BinanceArticle {
  return { title, releaseDate }
}