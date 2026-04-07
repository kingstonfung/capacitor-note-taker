import { useEffect, useRef, useState } from "react"
import closeIcon from "@/assets/icons/close.svg"
import { NoteListItem } from "@/components/NoteListItem/NoteListItem"
import { useNoteSearch } from "./hooks/useNoteSearch"
import styles from "./search.module.css"

interface SearchProps {
  isOpen: boolean
  onClose: () => void
}

export const Search = ({ isOpen, onClose }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const results = useNoteSearch(query)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery("")
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const showNoResults = query.length > 3 && results.length === 0

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.title}>Search</span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close search"
          >
            <img
              src={closeIcon}
              width={22}
              height={22}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>

        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Type to search…"
          aria-label="Search notes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {showNoResults && (
          <p className={styles.noResults}>No notes match your search.</p>
        )}

        {results.length > 0 && (
          <ul className={styles.results}>
            {results.map((note) => (
              <div key={note.id} onClick={onClose}>
                <NoteListItem note={note} />
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
