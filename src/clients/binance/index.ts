import fetch from 'node-fetch'

class BinanceClient {
  constructor() {
    //
  }

  public async getTradeableAssets(): Promise<string[]> {
    const response = await fetch('https://api.binance.com/api/v1/exchangeInfo')
    const responseJson = await response.json()
    const binanceAssets: Set<string> = new Set()
    responseJson.symbols
      .filter((s: any) => s.status === 'TRADING')
      .map((s: any) => binanceAssets.add(s.baseAsset))
    return Array.from(binanceAssets)
  }
}

export const binanceClient = new BinanceClient()
