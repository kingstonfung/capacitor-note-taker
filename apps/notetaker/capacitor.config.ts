import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "dev.kfung.notetaker",
  appName: "Note Taker App",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
}

export default config
