
export interface SymbolAnnouncementDetails {
  releaseDate: number
  detectionDate: number
  symbols: string[]
}

export enum DataSourceMessageType {
  SYMBOL_ANNOUNCEMENT = 'SYMBOL_ANNOUNCEMENT',
  GET_SOURCE_NAME = 'GET_SOURCE_NAME',
  GET_SOURCE_URL = 'GET_SOURCE_URL',
}


export interface DataSourceWorkerOptions {
  name: string,
  url: string,
  loggerColor: string
}