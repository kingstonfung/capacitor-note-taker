export const getMimeType = (): string => {
  for (const t of [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ]) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ""
}

export const handleMicError = (err: DOMException): void => {
  const name = err instanceof DOMException ? err.name : ""
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    alert(
      "Microphone access denied. Please allow microphone access in your device settings.",
    )
  } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    alert("No microphone found. Please connect a microphone and try again.")
  } else if (name === "NotReadableError" || name === "TrackStartError") {
    alert("Microphone is in use by another app. Please close it and try again.")
  } else if (name === "NotSupportedError") {
    alert(
      "Recording is not supported on this device. Please try updating your browser or app.",
    )
  } else {
    alert(err.message)
  }
}
