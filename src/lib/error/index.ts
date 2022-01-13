export function getErrorMessage(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : error
  return errorMessage
}


export class NetworkError extends Error {
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
  statusCode: number
}

export class NetworkResponseExpiredError extends Error {
  constructor(age: number) {
    super(`Response is too old (age=${age})`)
    this.age = age
  }
  age: number
}