import { useState } from "react"
import type React from "react"
import type { RefObject } from "react"
import type { LoadState } from "./useAudioLoader"

interface UseAudioPlaybackProps {
  audioRef: RefObject<HTMLAudioElement | null>
  loadState: LoadState
  prepare: () => Promise<boolean>
  isProcessing: boolean
}

export const useAudioPlayback = ({
  audioRef,
  loadState,
  prepare,
  isProcessing,
}: UseAudioPlaybackProps) => {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return

    const ready = await prepare()
    if (!ready) return

    if (el.paused) {
      el.play()
    } else {
      el.pause()
    }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (!el || loadState !== "ready") return
    el.currentTime = Number(e.target.value)
    setCurrent(el.currentTime)
  }

  const handleClick = () => {
    if (isProcessing) {
      alert("Audio file is being processed. Please wait a moment.")
      return
    }
    toggle()
  }

  const audioEvents = {
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => {
      setPlaying(false)
      setCurrent(0)
    },
    onTimeUpdate: (e: React.SyntheticEvent<HTMLAudioElement>) =>
      setCurrent((e.target as HTMLAudioElement).currentTime),
    onDurationChange: (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const d = (e.target as HTMLAudioElement).duration
      if (isFinite(d)) setDuration(d)
    },
  }

  return { playing, current, duration, handleClick, seek, audioEvents }
}
