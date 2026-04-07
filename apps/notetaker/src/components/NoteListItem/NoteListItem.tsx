import { Link } from "@tanstack/react-router"
import type { Notes } from "@/schemas/notes"
import styles from "./NoteListItem.module.css"

interface NoteListItemProps {
  note: Notes
}

export const NoteListItem = ({ note }: NoteListItemProps) => {
  return (
    <li className={styles.item}>
      <Link
        className={styles.link}
        to="/note/$noteId"
        params={{ noteId: note.id }}
      >
        <span className={styles.title}>{note.title}</span>
        {note.timestamp && (
          <span className={styles.timestamp}>{note.timestamp}</span>
        )}
      </Link>
    </li>
  )
}
