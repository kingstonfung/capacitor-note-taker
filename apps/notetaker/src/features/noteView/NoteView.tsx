import { Link, useNavigate } from "@tanstack/react-router"
import type { Notes } from "@/schemas/notes"
import { NOTES_STORAGE_KEY } from "@/constants/storage"
import { AudioPlayer } from "@/common/audioPlayer/AudioPlayer"
import { useToast } from "@/common/toast/ToastContext"

import styles from "./NoteView.module.css"

type NoteViewProps = {
  note?: Notes
}

export const NoteView = ({ note }: NoteViewProps) => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  if (!note) {
    return null
  }

  const handleDelete = () => {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY)
    const notes: Notes[] = stored ? JSON.parse(stored) : []
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(notes.filter((n) => n.id !== note.id)),
    )
    showToast("Note is deleted")
    navigate({ to: "/" })
  }

  return (
    <article className={styles.article}>
      <h1>{note.title}</h1>
      {note.timestamp && <p className={styles.timestamp}>{note.timestamp}</p>}
      {note.note && <p>{note.note}</p>}
      {note.hasAudio && <AudioPlayer uuid={note.id} />}
      <Link
        className={styles.editButton}
        to="/note/$noteId/edit"
        params={{ noteId: note.id }}
      >
        Edit
      </Link>
      <button className={styles.deleteButton} onClick={handleDelete}>
        Delete Note
      </button>
    </article>
  )
}
