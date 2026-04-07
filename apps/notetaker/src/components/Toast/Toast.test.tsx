import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { Toast } from "./Toast"
import { act } from "react"

describe("Toast component", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  const testMessage = "Test message"

  it("renders the message", () => {
    render(<Toast message={testMessage} />)
    expect(screen.getByText(testMessage)).toBeTruthy()
  })

  it("renders with success type", () => {
    render(<Toast message={testMessage} type="success" />)
    const toast = screen.getByText(testMessage)
    expect(toast.className).toContain("success")
  })

  it("renders with error type", () => {
    render(<Toast message={testMessage} type="error" />)
    const toast = screen.getByText(testMessage)
    expect(toast.className).toContain("error")
  })

  it("calls dismiss after the intended time lapse", async () => {
    const onDismiss = vi.fn()
    render(<Toast message={testMessage} onDismiss={onDismiss} />)

    expect(onDismiss).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(4300)
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
