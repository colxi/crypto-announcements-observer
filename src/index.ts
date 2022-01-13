import { getNumberInRange } from './lib/math'
import { GamesDataService } from './services/game-data-service'
import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

enum DatabaseRequestErrorCode {
  UNIQUE_CONSTRAIN_VIOLATION = 'P2002'
}

function isKnownDatabaseError(err: unknown): err is PrismaClientKnownRequestError {
  return err instanceof PrismaClientKnownRequestError
}

const myPrisma = new PrismaClient()

async function start() {
  const games = await GamesDataService.retrieve()

  const dbGamesCount = await myPrisma.game.count()
  const listingGamesCount = Object.keys(games).length
  console.log('Listing games found:', listingGamesCount)
  console.log('Database games found:', dbGamesCount)
  let additionsCount = 0
  let duplicatedCount = 0
  let errorCount = 0
  for (const game of games) {
    try {
      await myPrisma.game.create({
        data: {
          name: game.name,
          europeRelease: game.europeRelease,
          usaRelease: game.usaRelease,
          japanRelease: game.japanRelease,
          australiaRelease: game.australiaRelease,
          addedOn: new Date()
        },
      })
      additionsCount++
    } catch (err) {
      if (!isKnownDatabaseError(err)) {
        errorCount++
        throw err
      }
      if (err.code === DatabaseRequestErrorCode.UNIQUE_CONSTRAIN_VIOLATION) {
        duplicatedCount++
        continue
      }
      else {
        errorCount++
        throw err
      }
    }
  }
  console.log('Total additions:', additionsCount)
  console.log('Total duplicated:', duplicatedCount)
  console.log('Total errors:', errorCount)
}

start()