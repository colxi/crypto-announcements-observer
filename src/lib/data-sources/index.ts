interface DataSourceOptions {
  name: string
  source: string
  getSymbols: () => Promise<SymbolAnnoucementDetails[]>
}

export interface SymbolAnnoucementDetails {
  symbol : string
  timestamp : number
}


export class DataSource {
  public constructor(init: DataSourceOptions) {
    this.name = init.name
    this.source = init.source
    this.getSymbols = init.getSymbols
  }

  public name: string
  public source: string
  public getSymbols: () => Promise<SymbolAnnoucementDetails[]>
}
