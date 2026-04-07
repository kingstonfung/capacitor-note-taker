import { useState } from "react"
import { NoteListItem } from "@/components/NoteListItem/NoteListItem"
import styles from "./NotesListing.module.css"
import { loadNotes } from "./utils/loadNotes"
import { sortNotes } from "./utils/sortNotes"

export const NotesListing = () => {
  const [notes] = useState(loadNotes)

  if (!notes.length) {
    return (
      <p className={styles.empty}>No notes yet. Create one to get started!</p>
    )
  }

  const sortedNotes = sortNotes(notes)

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Notes</h2>
      <ul className={styles.list}>
        {sortedNotes.map((note) => (
          <NoteListItem key={note.id} note={note} />
        ))}
      </ul>
    </div>
  )
}
