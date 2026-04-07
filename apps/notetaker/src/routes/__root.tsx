import { createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { UIShell } from "@/common/uiShell/uiShell"
import { ToastProvider } from "@/common/toast/ToastContext"

import "@/../styles/global.css"

export const Route = createRootRouteWithContext()({
  component: RootComponent,
})

const isTestRunner = import.meta.env.MODE !== "test"

function RootComponent() {
  return (
    <>
      <ToastProvider>
        <UIShell />
      </ToastProvider>
      {isTestRunner && (
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  )
}
