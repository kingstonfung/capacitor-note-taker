import { useEffect } from "react"
import { App } from "@capacitor/app"
import { Capacitor } from "@capacitor/core"
import { useRouter } from "@tanstack/react-router"

export const useAndroidBackButton = () => {
  const router = useRouter()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = App.addListener("backButton", () => {
      const isAtRootRoute = router.state.location.pathname === "/"

      if (!isAtRootRoute) {
        window.history.back()
      } else {
        App.exitApp()
      }
    })

    return () => {
      listenerPromise.then((handle) => handle.remove())
    }
  }, [router])
}
