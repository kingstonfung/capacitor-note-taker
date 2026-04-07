import { getDB } from "./getDB"

export const deleteChunks = async (sid: string) => {
  const database = await getDB()
  const tx = database.transaction("chunks", "readwrite")
  const index = tx.objectStore("chunks").index("by-session")
  let cursor = await index.openCursor(IDBKeyRange.only(sid))
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}
