import { DB_NAME, DB_VERSION } from "@/constants/storage"
import * as idb from "idb"
import type { DBSchema, IDBPDatabase } from "idb"

interface VoiceMemosDB extends DBSchema {
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
  chunks: {
    key: number
    value: {
      id?: number
      sessionId: string
      sequence: number
      data: ArrayBuffer
    }
    indexes: { "by-session": string }
  }
  meta: { key: string; value: string }
}

let db: IDBPDatabase<VoiceMemosDB> | undefined

export const resetPlaybackDB = () => {
  db = undefined
}

const getDB = async (): Promise<IDBPDatabase<VoiceMemosDB>> => {
  if (!db) {
    db = await idb.openDB<VoiceMemosDB>(DB_NAME, DB_VERSION, {
      upgrade(d, oldVersion) {
        if (oldVersion < 2) {
          if (d.objectStoreNames.contains("chunks"))
            d.deleteObjectStore("chunks")
          if (d.objectStoreNames.contains("recordings"))
            d.deleteObjectStore("recordings")
          if (d.objectStoreNames.contains("meta")) d.deleteObjectStore("meta")
        }
        if (!d.objectStoreNames.contains("chunks")) {
          const chunks = d.createObjectStore("chunks", {
            keyPath: "id",
            autoIncrement: true,
          })
          chunks.createIndex("by-session", "sessionId")
        }
        if (!d.objectStoreNames.contains("recordings")) {
          d.createObjectStore("recordings", { keyPath: "id" })
        }
        if (!d.objectStoreNames.contains("meta")) {
          d.createObjectStore("meta")
        }
      },
    })
  }
  return db
}

const fixWebMDuration = async (audioEl: HTMLAudioElement): Promise<void> => {
  if (isFinite(audioEl.duration)) return
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3_000)
    const onTimeUpdate = () => {
      clearTimeout(timeout)
      audioEl.removeEventListener("timeupdate", onTimeUpdate)
      audioEl.currentTime = 0
      resolve()
    }
    audioEl.addEventListener("timeupdate", onTimeUpdate)
    audioEl.currentTime = 1e9
  })
}

export const preparePlayback = async (
  uuid: string,
  audioEl: HTMLAudioElement,
): Promise<string | null> => {
  const database = await getDB()
  const entry = await database.get("recordings", uuid)
  if (!entry) return null

  const blob = new Blob([entry.buffer], { type: entry.mimeType })
  const url = URL.createObjectURL(blob)
  audioEl.src = url

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      audioEl.onloadedmetadata = null
      audioEl.onerror = null
    }

    audioEl.onloadedmetadata = async () => {
      cleanup()
      await fixWebMDuration(audioEl)
      resolve()
    }

    audioEl.onerror = () => {
      cleanup()
      reject(new Error(`Audio failed to load (format: ${entry.mimeType})`))
    }
  })

  return url
}
