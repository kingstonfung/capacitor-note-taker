import { useRouter, useRouterState } from "@tanstack/react-router"
import { loadNoteById } from "@/features/noteView/utils/loadNoteById"

export const useBackNavigation = () => {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isRoot = pathname === "/"

  const onBackClicked = () => {
    const editRouteMatch = pathname.match(/^\/note\/([^/]+)\/edit$/)
    if (editRouteMatch) {
      const noteId = editRouteMatch[1]
      const isNewNote = !loadNoteById({ params: { noteId } })
      if (isNewNote) {
        router.navigate({ to: "/" })
        return
      }
    }

    const parent = pathname.replace(/\/[^/]+$/, "") || "/"
    router.navigate({ to: parent })
  }

  return { isRoot, onBackClicked }
}
