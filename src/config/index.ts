// @ts-ignore
import packageJSON from '../../package.json'

const WELCOME_MESSAGE = `
*************************************************************
*                                                           *
*  crypto-announcements-observer                            *
*  v${packageJSON.version} ( Dec 2021 )                                      *
*  by @colxi & @rNavarro                                    *
*                                                           *
*  Detect symbol inclusions annoucements on the configured  *
*  exchanges and performs basic signal procesing, in order  *
*  to filter non-relevant announcements and noise.          * 
*                                                           *
*************************************************************
`

export const config = {
  // message to print on screen on ob tinitialization
  botWelcomeMessage: WELCOME_MESSAGE,
  // time between requests to configured sources
  pollingInterval: 1000,
  // amount of price tracking checks to perform after a symbol is announced
  priceFollowTimes: 20,
  // interval between price tracking checks after a symbol is announced
  priceFollowInterval: 500,
  // announcement age limit
  discardSignalsOlderThanMillis: 20000,
}


/**
1:
https://www.binancezh.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=1

2:
https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=1

3:
https://www.binancezh.jp/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=1

4:
https://www.binancezh.com/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=5

5:
https://www.binance.com/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=5

6:
https://www.binancezh.jp/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=5


https://api.yshyqxx.com/gateway-api/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=1

https://api.yshyqxx.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5
 */