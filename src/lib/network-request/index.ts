import { Response } from 'node-fetch'

export function getResponseHeader(response: Response, headerName: string): string[] | undefined {
  const headersKey = Object.getOwnPropertySymbols(response.headers)[0]
  const responseAge = (response.headers as any)[headersKey][headerName]
  return responseAge
}

export function getResponseAge(response: Response): number {
  const ageRaw = getResponseHeader(response, 'age')
  const age = Number(Array.isArray(ageRaw) ? ageRaw[0] : ageRaw) || 0
  return age
}
