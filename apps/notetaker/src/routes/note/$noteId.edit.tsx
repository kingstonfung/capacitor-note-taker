import { createFileRoute } from "@tanstack/react-router"
import { NotesForm } from "@/features/notesForm/NotesForm"
import { loadNoteById } from "@/features/noteView/utils/loadNoteById"

export const Route = createFileRoute("/note/$noteId/edit")({
  loader: loadNoteById,
  component: NoteEditScreen,
})

function NoteEditScreen() {
  const note = Route.useLoaderData()
  const { noteId } = Route.useParams()

  return <NotesForm initialData={note} noteId={noteId} />
}
