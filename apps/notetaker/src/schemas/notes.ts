import { z } from "zod"
import type { input, output } from "zod"

export const NotesSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  title: z.string().min(1, "Title is required"),
  note: z.string().optional(),
  hasAudio: z.boolean().optional(),
  timestamp: z.string().min(1, "Timestamp is required"),
})

export type NotesInput = input<typeof NotesSchema>
export type Notes = output<typeof NotesSchema>
