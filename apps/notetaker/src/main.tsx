import ReactDOM from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router.tsx"
import { Capacitor } from "@capacitor/core"

export const bootstrapApp = () => {
  if (Capacitor.getPlatform() === "ios") {
    const viewport = document.querySelector("meta[name='viewport']")
    if (viewport) {
      const newAttribute =
        viewport.getAttribute("content") + ", viewport-fit=cover"
      viewport.setAttribute("content", newAttribute)
    }
  }

  const rootElement = document.getElementById("app")
  const root = ReactDOM.createRoot(rootElement!)
  root.render(<RouterProvider router={router} />)
}

bootstrapApp()
