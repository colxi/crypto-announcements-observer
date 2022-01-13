export interface WorkerMessage {
  type: string
  id: string
  data: unknown
}

export type WorkerRequestId = string

export interface WorkerOngoingRequestsMap {
  timestamp: number
  resolve: (value: unknown) => void
  reject: (value: unknown) => void
}