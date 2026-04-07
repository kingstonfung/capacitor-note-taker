import { createFileRoute } from "@tanstack/react-router"
import { NotesListing } from "@/features/notesListing/NotesListing"

export const Route = createFileRoute("/")({
  component: NotesListing,
})
