import { useNavigate } from "@tanstack/react-router"

export const useNewNote = () => {
  const navigate = useNavigate()

  const handleNewNote = () => {
    navigate({
      to: "/note/$noteId/edit",
      params: { noteId: crypto.randomUUID() },
    })
  }

  return { handleNewNote }
}
