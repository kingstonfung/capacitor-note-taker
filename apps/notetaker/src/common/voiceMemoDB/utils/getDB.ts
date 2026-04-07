import * as idb from "idb"
import type { DBSchema, IDBPDatabase } from "idb"
import type { ChunkRow } from "../types/chunks"
import { DB_NAME, DB_VERSION } from "@/constants/storage"

export interface VoiceMemosDB extends DBSchema {
  chunks: {
    key: number
    value: ChunkRow
    indexes: { "by-session": string }
  }
  recordings: {
    key: string
    value: {
      id: string
      title: string
      buffer: ArrayBuffer
      mimeType: string
      size: number
      createdAt: string
    }
  }
  meta: {
    key: string
    value: string
  }
}

let db: IDBPDatabase<VoiceMemosDB> | undefined

export const resetVoiceMemoDB = () => {
  db = undefined
}

export const getDB = async (): Promise<IDBPDatabase<VoiceMemosDB>> => {
  if (!db) {
    db = await idb.openDB<VoiceMemosDB>(DB_NAME, DB_VERSION, {
      upgrade(d) {
        const chunks = d.createObjectStore("chunks", {
          keyPath: "id",
          autoIncrement: true,
        })
        chunks.createIndex("by-session", "sessionId")
        d.createObjectStore("recordings", { keyPath: "id" })
        d.createObjectStore("meta")
      },
    })
  }

  return db
}
