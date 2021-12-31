export function getNormalizedTime(date: Date | number = new Date()): string {
  if (typeof date === 'number') date = new Date(date)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${day}-0${month}-${year} ${hour}:${minute}:${second}`
}

export function getDateAsDDMMYYYY(dateOrTimestamp: Date | number = new Date()): string {
  const date = (typeof dateOrTimestamp === 'number')
    ? new Date(dateOrTimestamp)
    : dateOrTimestamp
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return month < 10
    ? `${day}-0${month}-${year}`
    : `${day}-${month}-${year}`
}

export function getTimeAsHHMMSS(dateOrTimestamp: Date | number = new Date()): string {
  const date = (typeof dateOrTimestamp === 'number')
    ? new Date(dateOrTimestamp)
    : dateOrTimestamp
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hour}:${minute}:${seconds}`
}


export enum TimeInMillis {
  ONE_SECOND = 1000,
  TWO_SECONDS = 1000 * 2,
  FIVE_SECONDS = 1000 * 5,
  ONE_MINUTE = 1000 * 60,
  TWO_MINUTES = 1000 * 60 * 2,
  FIVE_MINUTES = 1000 * 60 * 5,
  ONE_HOUR = 1000 * 60 * 60,
  TWO_HOURS = 1000 * 60 * 60 * 2,
  FIVE_HOURS = 1000 * 60 * 60 * 5,
  ONE_DAY = 1000 * 60 * 60 * 24,
  TWO_DAYS = 1000 * 60 * 60 * 24 * 2,
  FIVE_DAYS = 1000 * 60 * 60 * 24 * 5,
  ONE_WEEK = 1000 * 60 * 60 * 24 * 7,
  ONE_MONTH = 1000 * 60 * 60 * 24 * 30,
}