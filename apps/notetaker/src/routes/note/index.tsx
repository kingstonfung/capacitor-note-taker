import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/note/")({
  loader: () => {
    throw redirect({ to: "/" })
  },
})
