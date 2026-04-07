import { Link } from "@tanstack/react-router"
import { useNewNote } from "@/common/useNewNote/useNewNote"
import addNotesIcon from "@/assets/icons/add_notes.svg"
import arrowLeftAltIcon from "@/assets/icons/arrow_left_alt.svg"
import searchIcon from "@/assets/icons/search.svg"

import styles from "./Header.module.css"
import { useBackNavigation } from "./hooks/useBackNavigation"

interface HeaderProps {
  onOpenSearch: () => void
}

export const Header = ({ onOpenSearch }: HeaderProps) => {
  const { handleNewNote } = useNewNote()
  const { isRoot, onBackClicked } = useBackNavigation()

  return (
    <header className={`${styles.header} ${styles.headerNative}`}>
      {isRoot ? (
        <Link to="/" className={styles.appName}>
          Capacitor Note Taker
        </Link>
      ) : (
        <button
          className={styles.backButton}
          onClick={onBackClicked}
          aria-label="Go back"
        >
          <img
            src={arrowLeftAltIcon}
            width={22}
            height={22}
            alt=""
            aria-hidden="true"
          />
          Back
        </button>
      )}
      <div className={styles.cornerActionsWrapper}>
        <button
          className={styles.newNoteButton}
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <img
            src={searchIcon}
            width={22}
            height={22}
            alt=""
            aria-hidden="true"
          />
        </button>
        <button
          className={styles.newNoteButton}
          onClick={handleNewNote}
          aria-label="New note"
        >
          <img
            src={addNotesIcon}
            width={22}
            height={22}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  )
}
