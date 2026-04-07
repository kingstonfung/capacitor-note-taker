import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { AudioPlayer } from "./AudioPlayer"

vi.mock("./hooks/useAudioLoader", () => ({
  useAudioLoader: () => ({
    audioRef: { current: null },
    loadState: "idle",
    prepare: vi.fn().mockResolvedValue(true),
  }),
}))

vi.mock("./hooks/useAudioPlayback", () => ({
  useAudioPlayback: () => ({
    playing: false,
    current: 0,
    duration: 120,
    handleClick: vi.fn(),
    seek: vi.fn(),
    audioEvents: {
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onEnded: vi.fn(),
      onTimeUpdate: vi.fn(),
      onDurationChange: vi.fn(),
    },
  }),
}))

const renderComponent = (props?: Partial<Parameters<typeof AudioPlayer>[0]>) =>
  setupTest(<AudioPlayer uuid="test-uuid" {...props} />, "/", "/")

describe("AudioPlayer:", () => {
  it("renders a play button with aria-label 'Play'", async () => {
    await renderComponent()

    expect(screen.getByRole("button", { name: "Play" })).not.toBeNull()
  })

  it("renders a scrubber range input", async () => {
    await renderComponent()

    expect(screen.getByRole("slider")).not.toBeNull()
  })

  it("displays '0:00 / 2:00' time when current=0 and duration=120", async () => {
    await renderComponent()

    expect(screen.getByText("0:00 / 2:00")).not.toBeNull()
  })

  it("shows 'Processing' aria-label on the button when isProcessing=true", async () => {
    await renderComponent({ isProcessing: true })

    const button = screen.getByRole("button", { name: "Processing" })
    expect(button).not.toBeNull()
    expect((button as HTMLButtonElement).disabled).toBe(false)
  })
})
