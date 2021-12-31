export interface BinanceArticle {
  title: string
  releaseDate: number
  // ... other non relevant fields
}

export interface BinanceResponse {
  data: {
    catalogs: [
      { articles: BinanceArticle[] }
    ]
  }
  // ... other non relevant fields
} 