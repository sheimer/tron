import fs from 'node:fs'
import path from 'node:path'

export class Storage {
  constructor() {
    this.dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data')
    this.filePath = path.join(this.dataDir, 'games.json')
    this.tempPath = path.join(this.dataDir, 'games.json.tmp')
  }

  ensureDir() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true })
      }
    } catch (err) {
      console.error(`[Storage] Failed to create data directory ${this.dataDir}:`, err)
    }
  }

  /**
   * Serializes active game sessions and writes an atomic JSON snapshot.
   * @param {Array<import('./GameSession.js').GameSession>} games
   */
  saveGames(games) {
    if (!Array.isArray(games)) return

    this.ensureDir()

    const serialized = games.map((game) => ({
      key: game.key,
      name: game.name,
      interval: game.interval,
      isPublic: game.isPublic,
      createdAt: game.createdAt,
      stats: game.stats,
      players:
        game.arena?.players?.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          left: p.left,
          right: p.right,
        })) || [],
      savedAt: Date.now(),
    }))

    try {
      const json = JSON.stringify(serialized, null, 2)
      fs.writeFileSync(this.tempPath, json, 'utf8')
      fs.renameSync(this.tempPath, this.filePath)
    } catch (err) {
      console.error('[Storage] Error writing atomic games snapshot:', err)
    }
  }

  /**
   * Loads persisted game snapshots from disk.
   * @returns {Array<object>} Array of serialized game records
   */
  loadGames() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return []
      }
      const data = fs.readFileSync(this.filePath, 'utf8')
      if (!data.trim()) return []

      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed
      }
      return []
    } catch (err) {
      console.error('[Storage] Error reading games snapshot:', err)
      return []
    }
  }
}

export const storage = new Storage()
