import {
  createFileRoute,
  Outlet,
  redirect,
  useMatchRoute,
} from "@tanstack/react-router"
import { NoteView } from "@/features/noteView/NoteView"
import { loadNoteById } from "@/features/noteView/utils/loadNoteById"

export const Route = createFileRoute("/note/$noteId")({
  loader: ({ params, location }) => {
    const note = loadNoteById({ params })
    if (!note && !location.pathname.endsWith("/edit")) {
      throw redirect({ to: "/note/$noteId/edit", params })
    }
    return note
  },
  component: NoteViewScreen,
})

function NoteViewScreen() {
  const note = Route.useLoaderData()
  const matchRoute = useMatchRoute()
  const isEditRoute = matchRoute({ to: "/note/$noteId/edit" })

  return (
    <>
      {isEditRoute === false ? <NoteView note={note} /> : null}
      <Outlet />
    </>
  )
}
