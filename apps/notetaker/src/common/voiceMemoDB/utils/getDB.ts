import * as idb from "idb"
import { DB_NAME, DB_VERSION } from "@/constants/storage"
import type { IDBPDatabase } from "idb"
import type { VoiceMemosDB } from "../types/VoiceMemoDB"

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
