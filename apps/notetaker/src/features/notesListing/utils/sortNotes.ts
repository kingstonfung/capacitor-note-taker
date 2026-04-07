import type { Notes } from "@/schemas/notes"

export const sortNotes = (notes: Notes[]) => {
  return notes.reverse()
}

/*
I purposely left this here in case the notes order in localStorage
is not saved sequentially in the future.

export const sortNotes = (notes: Notes[]) => {
  const sorted = notes.sort(
    (a, b) => {
      const timeA = new Date(
        a.timestamp.replace(/(\d)(am|pm)/i, "$1 $2")
      ).getTime()

      const timeB = new Date(
        b.timestamp.replace(/(\d)(am|pm)/i, "$1 $2")
      ).getTime()

      return timeB - timeA
    }
  )

  return sorted
}
*/
