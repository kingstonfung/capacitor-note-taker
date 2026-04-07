import { useEffect, useRef, useState } from "react"
import { preparePlayback } from "../utils/audioPlayback"

export type LoadState = "idle" | "loading" | "ready" | "error"

export const useAudioLoader = (uuid: string) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const objectURLRef = useRef<string | null>(null)
  const [loadState, setLoadState] = useState<LoadState>("idle")

  useEffect(() => {
    return () => {
      if (objectURLRef.current) {
        URL.revokeObjectURL(objectURLRef.current)
        objectURLRef.current = null
      }
    }
  }, [uuid])

  const prepare = async (): Promise<boolean> => {
    if (loadState === "ready") return true
    if (loadState === "loading") return false

    setLoadState("loading")
    const el = audioRef.current!
    try {
      const url = await preparePlayback(uuid, el)
      if (!url) {
        setLoadState("error")
        return false
      }
      objectURLRef.current = url
      setLoadState("ready")
      return true
    } catch {
      setLoadState("error")
      return false
    }
  }

  return { audioRef, loadState, prepare }
}
