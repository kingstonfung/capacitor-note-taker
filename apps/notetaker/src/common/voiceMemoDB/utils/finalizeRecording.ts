import type { ChunkRow } from "../types/chunks"
import { getDB } from "../utils/getDB"

export const finalizeRecording = async (
  sid: string,
  chunks: ChunkRow[],
  activeMimeType: string,
) => {
  const mimeType = activeMimeType || "audio/mp4"
  const blob = new Blob(
    chunks.map((c) => c.data),
    { type: mimeType },
  )
  const buffer = await blob.arrayBuffer()
  const now = new Date()
  const database = await getDB()
  await database.put("recordings", {
    id: sid,
    title: `Recording — ${now.toLocaleDateString("en", { month: "short", day: "numeric" })} ${now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}`,
    buffer,
    mimeType,
    size: buffer.byteLength,
    createdAt: now.toISOString(),
  })
}
