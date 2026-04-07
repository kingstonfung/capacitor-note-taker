import { deleteChunks } from "./deleteChunks"
import { getDB } from "./getDB"

export const deleteRecording = async (uuid: string) => {
  const database = await getDB()
  await database.delete("recordings", uuid)
  await deleteChunks(uuid)
}
