import type { JSX } from "react"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router"
import { act, render } from "@testing-library/react"
import { ToastProvider } from "@/common/toast/ToastContext"

export const setupTest = async (
  testUISubject: JSX.Element,
  registeredPath = "/",
  initialPath = "/",
  loader?: any,
) => {
  const rootRoute = createRootRoute({
    component: () => (
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    ),
  })

  const childRoute = createRoute({
    component: () => testUISubject,
    getParentRoute: () => rootRoute,
    path: registeredPath,
    pendingMinMs: 0,
    pendingMs: 0,
    loader,
  })

  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    routeTree: rootRoute.addChildren([childRoute]),
  })

  await act(async () => {
    render(<RouterProvider<typeof router> router={router} />)

    await router.load()
  })

  return router
}
