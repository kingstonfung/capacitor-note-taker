import {
  getMimeType,
  handleMicError,
} from "@/common/voiceMemoDB/utils/microphoneUtils"
import { getDB } from "@/common/voiceMemoDB/utils/getDB"
import { deleteChunks } from "@/common/voiceMemoDB/utils/deleteChunks"
import { finalizeRecording } from "@/common/voiceMemoDB/utils/finalizeRecording"
import { Capacitor } from "@capacitor/core"

const RECOVERY_KEY = "in-progress-session"

let mediaRecorder: MediaRecorder | undefined
let mediaStream: MediaStream | undefined
let chunkSequence = 0
let activeMimeType = ""

const getAudioParams = (): MediaStreamConstraints => {
  if (Capacitor.getPlatform() === "android") {
    return { audio: true }
  }
  return {
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      channelCount: 1,
    },
  }
}

export const startRecording = async (
  uuid: string,
  onComplete: (recordingId: string) => void,
): Promise<boolean> => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia(getAudioParams())

    chunkSequence = 0
    const database = await getDB()
    await database.put("meta", uuid, RECOVERY_KEY)

    activeMimeType = getMimeType()
    mediaRecorder = new MediaRecorder(
      mediaStream,
      activeMimeType ? { mimeType: activeMimeType } : {},
    )
    activeMimeType = mediaRecorder.mimeType || activeMimeType

    mediaRecorder.ondataavailable = async (e: BlobEvent) => {
      if (e.data.size === 0) return
      const buffer = await e.data.arrayBuffer()
      await database.add("chunks", {
        sessionId: uuid,
        sequence: chunkSequence++,
        data: buffer,
      })
    }

    mediaRecorder.onstop = async () => {
      mediaStream!.getTracks().forEach((t) => t.stop())
      const chunks = (
        await database.getAllFromIndex("chunks", "by-session", uuid)
      ).sort((a, b) => a.sequence - b.sequence)
      await finalizeRecording(uuid, chunks, activeMimeType)
      await deleteChunks(uuid)
      await database.delete("meta", RECOVERY_KEY)
      onComplete(uuid)
    }

    mediaRecorder.start(1_000)
    return true
  } catch (err) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop())
      mediaStream = undefined
    }
    handleMicError(err as DOMException)
    return false
  }
}

export const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop()
}
