import { describe, it, expect, vi, beforeEach } from "vitest"
import { getMimeType, handleMicError } from "./microphoneUtils"

describe("getMimeType:", () => {
  it("returns the first supported MIME type", () => {
    Object.defineProperty(globalThis, "MediaRecorder", {
      value: { isTypeSupported: (t: string) => t === "audio/webm;codecs=opus" },
      writable: true,
      configurable: true,
    })
    expect(getMimeType()).toBe("audio/webm;codecs=opus")
  })

  it("falls through to the next type when the first is unsupported", () => {
    Object.defineProperty(globalThis, "MediaRecorder", {
      value: { isTypeSupported: (t: string) => t === "audio/mp4" },
      writable: true,
      configurable: true,
    })
    expect(getMimeType()).toBe("audio/mp4")
  })

  it("returns empty string when no type is supported", () => {
    Object.defineProperty(globalThis, "MediaRecorder", {
      value: { isTypeSupported: () => false },
      writable: true,
      configurable: true,
    })
    expect(getMimeType()).toBe("")
  })
})

describe("handleMicError:", () => {
  let alertSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  it("shows access denied alert for NotAllowedError", () => {
    handleMicError(new DOMException("", "NotAllowedError"))
    expect(alertSpy).toHaveBeenCalledWith(
      "Microphone access denied. Please allow microphone access in your device settings.",
    )
  })

  it("shows access denied alert for PermissionDeniedError", () => {
    handleMicError(new DOMException("", "PermissionDeniedError"))
    expect(alertSpy).toHaveBeenCalledWith(
      "Microphone access denied. Please allow microphone access in your device settings.",
    )
  })

  it("shows not found alert for NotFoundError", () => {
    handleMicError(new DOMException("", "NotFoundError"))
    expect(alertSpy).toHaveBeenCalledWith(
      "No microphone found. Please connect a microphone and try again.",
    )
  })

  it("shows not found alert for DevicesNotFoundError", () => {
    handleMicError(new DOMException("", "DevicesNotFoundError"))
    expect(alertSpy).toHaveBeenCalledWith(
      "No microphone found. Please connect a microphone and try again.",
    )
  })

  it("shows in-use alert for NotReadableError", () => {
    handleMicError(new DOMException("", "NotReadableError"))
    expect(alertSpy).toHaveBeenCalledWith(
      "Microphone is in use by another app. Please close it and try again.",
    )
  })

  it("shows in-use alert for TrackStartError", () => {
    handleMicError(new DOMException("", "TrackStartError"))
    expect(alertSpy).toHaveBeenCalledWith(
      "Microphone is in use by another app. Please close it and try again.",
    )
  })

  it("shows generic alert for an unrecognised DOMException", () => {
    handleMicError(new DOMException("", "SomeOtherError"))
    expect(alertSpy).toHaveBeenCalledWith("")
  })

  it("shows the error message for a DOMException with an unrecognised name", () => {
    handleMicError(new DOMException("something went wrong"))
    expect(alertSpy).toHaveBeenCalledWith("something went wrong")
  })
})
