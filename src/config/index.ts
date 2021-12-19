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
  // time betwen requests to configured sources
  pollingInterval: 300,
  // amount of price tracking checks to perform after a symbol is announced
  priceFollowTimes: 20,
  // interval betwen price tracking checks after a symbol is announced
  priceFollowInterval: 500,
  // announcement age limit
  discardSignalsOlderThanMilis: 1000,
}

