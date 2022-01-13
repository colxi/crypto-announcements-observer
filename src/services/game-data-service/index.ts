import { BaseExternalAccountClient, Compute, Impersonated, JWT, UserRefreshClient } from 'google-auth-library'
import { google, Auth, sheets_v4 } from 'googleapis'

// https://docs.google.com/spreadsheets/d/1FNyvbbU64Pb9lheg28gC_5fMalIYJ0aD763T7M1QqF0/edit#gid=0
const NSCollectorsSpreadSheetId = '1FNyvbbU64Pb9lheg28gC_5fMalIYJ0aD763T7M1QqF0'
const NSCollectorsSpreadSheetPageName = 'Physical Releases'
const NSCollectorsSpreadSheetRowsRange = 'A5:F'
// create using Service Account in  https://console.cloud.google.com/apis/credentials?project=XXXXXXXXX
const googleAuthFilePath = './src/auth.json'

interface GameDescriptor {
  name: string,
  usaRelease: boolean,
  japanRelease: boolean,
  europeRelease: boolean
  australiaRelease: boolean
}

export class GamesDataService {
  private static async getGoogleAuthClient(): Promise<Compute | JWT | UserRefreshClient | Impersonated | BaseExternalAccountClient> {
    const authorization = new Auth.GoogleAuth({
      keyFilename: googleAuthFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    const authClient = await authorization.getClient()
    return authClient
  }

  private static async getGamesSheetRowsData(): Promise<sheets_v4.Schema$RowData[]> {
    const sheetsClient = google.sheets('v4')
    const response = await sheetsClient.spreadsheets.get({
      includeGridData: true,
      ranges: [`${NSCollectorsSpreadSheetPageName}!${NSCollectorsSpreadSheetRowsRange}`],
      spreadsheetId: NSCollectorsSpreadSheetId,
      auth: await this.getGoogleAuthClient(),
    })
    const sheets = response.data.sheets![0].data?.values()
    if (!sheets) throw new Error('Invalid data fetched, Sheet not found!')
    const sheet = sheets.next()
    if (!sheet.value.rowData) throw new Error('Invalid data fetched, Cannot iterate results!')
    return sheet.value.rowData
  }

  private static parseGamesSheetRowsData(rowsData: sheets_v4.Schema$RowData[]): GameDescriptor[] {
    const games: GameDescriptor[] = []
    for (const row of rowsData) {
      try {
        const gameMeta = this.getGameMeta(row)
        games.push(gameMeta)
      } catch (err) {
        // discard games without name or games without physical release, or any 
        // other game row that generates an error
        continue
      }
    }
    return games
  }

  private static isCellEnabled(background: unknown) {
    // enabled cells are marked as green, return a boolean based on that parameter
    if (typeof background !== 'object' || background === null) return false
    const keysCount = Object.keys(background).length
    const greenValue = (background as any).green
    return keysCount === 1 && greenValue === 1
  }

  private static getGameMeta(row: sheets_v4.Schema$RowData): GameDescriptor {
    if (!row.values) throw new Error('Row data missing')
    const nameColumn = row.values[0]
    const USAReleaseDateColumn = row.values[2]
    const JapanReleaseDateColumn = row.values[3]
    const EuropeReleaseDateColumn = row.values[4]
    const AustraliaReleaseDateColumn = row.values[5]
    const hasUSAPhysicalRelease = this.isCellEnabled(USAReleaseDateColumn.effectiveFormat?.backgroundColor)
    const hasJapanPhysicalRelease = this.isCellEnabled(JapanReleaseDateColumn.effectiveFormat?.backgroundColor)
    const hasEuropePhysicalRelease = this.isCellEnabled(EuropeReleaseDateColumn.effectiveFormat?.backgroundColor)
    const hasAustraliaPhysicalRelease = this.isCellEnabled(AustraliaReleaseDateColumn.effectiveFormat?.backgroundColor)
    const hasPhysicalRelease = hasUSAPhysicalRelease || hasJapanPhysicalRelease || hasEuropePhysicalRelease || hasAustraliaPhysicalRelease
    if (!nameColumn.formattedValue) throw new Error('Missing game name')
    if (!hasPhysicalRelease) throw new Error('Game has no physical release')
    return {
      name: nameColumn.formattedValue,
      usaRelease: hasUSAPhysicalRelease,
      japanRelease: hasJapanPhysicalRelease,
      europeRelease: hasEuropePhysicalRelease,
      australiaRelease: hasAustraliaPhysicalRelease
    }
  }

  public static async retrieve(): Promise<GameDescriptor[]> {
    const rowsData = await this.getGamesSheetRowsData()
    const gamesData = this.parseGamesSheetRowsData(rowsData)
    return gamesData
  }
}





