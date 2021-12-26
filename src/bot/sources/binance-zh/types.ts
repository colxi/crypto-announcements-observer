export interface BinanceArticle {
    title: string
    releaseDate : number
  }
  
  export interface BinanceResponse  {
    data: {
      catalogs: [
        { articles: BinanceArticle[] }
      ]
    }
  } 