import { getNormalizedTime } from "@/lib/date"


export function logError(...data: unknown[]){
  console.log(`\x1b[31m`, getNormalizedTime(), ':', ...data, `\x1b[0m`)
}

