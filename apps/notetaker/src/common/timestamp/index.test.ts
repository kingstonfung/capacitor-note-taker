import { describe, it, expect, vi, afterEach } from "vitest"
import { formatTimestamp, getCurrentTimestamp } from "./index"

describe("formatTimestamp:", () => {
  it("formats a date with a single-digit day and no leading zero", () => {
    const date = new Date(2026, 3, 5, 21, 45, 0)
    expect(formatTimestamp(date)).toBe("April 5, 2026 9:45pm")
  })

  it("formats a date with a two-digit day", () => {
    const date = new Date(2026, 11, 25, 13, 0, 0)
    expect(formatTimestamp(date)).toBe("December 25, 2026 1:00pm")
  })

  it("formats midnight as 12:00am", () => {
    const date = new Date(2026, 0, 1, 0, 0, 0)
    expect(formatTimestamp(date)).toBe("January 1, 2026 12:00am")
  })

  it("formats noon as 12:00pm", () => {
    const date = new Date(2026, 5, 15, 12, 0, 0)
    expect(formatTimestamp(date)).toBe("June 15, 2026 12:00pm")
  })

  it("pads minutes with a leading zero when < 10", () => {
    const date = new Date(2026, 6, 4, 8, 5, 0)
    expect(formatTimestamp(date)).toBe("July 4, 2026 8:05am")
  })

  it("formats a pm time correctly", () => {
    const date = new Date(2026, 1, 28, 23, 59, 0)
    expect(formatTimestamp(date)).toBe("February 28, 2026 11:59pm")
  })
})

describe("getCurrentTimestamp:", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns a formatted string for the current date/time", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 5, 9, 45, 0))
    expect(getCurrentTimestamp()).toBe("April 5, 2026 9:45am")
  })
})
