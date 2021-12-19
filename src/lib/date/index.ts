export function getNormalizedTime(date : Date | number = new Date()): string {
    if(typeof date === 'number') date = new Date(date)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return `${day}-0${month}-${year} ${hour}:${minute}:${second}`
}
  