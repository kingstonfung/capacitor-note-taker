import { useRef, useState } from "react"
import { startRecording, stopRecording } from "../utils/audioRecorderUtils"

import { deleteRecording } from "@/common/voiceMemoDB/utils/deleteRecording"

type RecordingState = "idle" | "recording" | "done"

interface UseRecorderMethodsProps {
  uuid: string
  onRecordingComplete?: (recordingId: string) => void
  onRecordingDelete?: () => void
}

export const useRecorderMethods = ({
  uuid,
  onRecordingComplete,
  onRecordingDelete,
}: UseRecorderMethodsProps) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const stopResolverRef = useRef<(() => void) | null>(null)

  const handleComplete = (id: string) => {
    setRecordingId(id)
    setRecordingState("done")
    onRecordingComplete?.(id)
    if (stopResolverRef.current) {
      stopResolverRef.current()
      stopResolverRef.current = null
    }
  }

  const start = async () => {
    const started = await startRecording(uuid, handleComplete)
    if (started) setRecordingState("recording")
  }

  const stop = () => {
    stopRecording()
  }

  const stopAndAwait = (): Promise<void> => {
    if (recordingState !== "recording") return Promise.resolve()
    return new Promise<void>((resolve) => {
      stopResolverRef.current = resolve
      stopRecording()
    })
  }

  const reRecord = async () => {
    if (recordingId) {
      await deleteRecording(recordingId)
      setRecordingId(null)
    }
    setRecordingState("idle")
    start()
  }

  const handleDelete = async () => {
    if (recordingId) {
      await deleteRecording(recordingId)
      setRecordingId(null)
    }
    setRecordingState("idle")
    onRecordingDelete?.()
  }

  return {
    recordingState,
    start,
    stop,
    stopAndAwait,
    reRecord,
    handleDelete,
  }
}
