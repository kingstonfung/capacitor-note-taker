import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { AudioRecorder } from "./AudioRecorder"

const mockStart = vi.fn()
const mockStop = vi.fn()
const mockReRecord = vi.fn()
const mockHandleDelete = vi.fn()
let mockRecordingState = "idle"

vi.mock("./hooks/useRecorderMethods", () => ({
  useRecorderMethods: () => ({
    recordingState: mockRecordingState,
    start: mockStart,
    stop: mockStop,
    reRecord: mockReRecord,
    handleDelete: mockHandleDelete,
  }),
}))

vi.mock("@/common/audioPlayer/AudioPlayer", () => ({
  AudioPlayer: ({ uuid }: { uuid: string }) => (
    <div data-testid="audio-player" data-uuid={uuid} />
  ),
}))

const renderComponent = (
  props?: Partial<Parameters<typeof AudioRecorder>[0]>,
) =>
  setupTest(
    <AudioRecorder uuid="test-uuid" showPlayer={false} {...props} />,
    "/",
    "/",
  )

describe("AudioRecorder:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRecordingState = "idle"
  })

  it("shows 'Ready' status text when in idle state", async () => {
    await renderComponent()

    expect(screen.getByText("Ready")).not.toBeNull()
  })

  it("shows the record button when idle", async () => {
    await renderComponent()

    expect(screen.getByRole("button")).not.toBeNull()
  })

  it("does not show AudioPlayer when idle and showPlayer=false", async () => {
    await renderComponent({ showPlayer: false })

    expect(screen.queryByTestId("audio-player")).toBeNull()
  })

  it("shows AudioPlayer when showPlayer=true even in idle state", async () => {
    await renderComponent({ showPlayer: true })

    expect(screen.getByTestId("audio-player")).not.toBeNull()
  })

  it("calls start when the record button is clicked", async () => {
    const user = userEvent.setup()
    await renderComponent()

    await user.click(screen.getByRole("button"))

    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  it("shows 'Recording' status and stop button when in recording state", async () => {
    mockRecordingState = "recording"
    await renderComponent()

    expect(screen.getByText("Recording")).not.toBeNull()
    expect(screen.getByRole("button")).not.toBeNull()
  })

  it("shows AudioPlayer while recording", async () => {
    mockRecordingState = "recording"
    await renderComponent()

    expect(screen.getByTestId("audio-player")).not.toBeNull()
  })

  it("calls stop when the stop button is clicked during recording", async () => {
    mockRecordingState = "recording"
    const user = userEvent.setup()
    await renderComponent()

    await user.click(screen.getByRole("button"))

    expect(mockStop).toHaveBeenCalledTimes(1)
  })

  it("shows 'Recorded' status and two buttons when done", async () => {
    mockRecordingState = "done"
    await renderComponent()

    expect(screen.getByText("Recorded")).not.toBeNull()
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })

  it("calls handleDelete when the delete button is clicked", async () => {
    mockRecordingState = "done"
    const user = userEvent.setup()
    await renderComponent()

    const buttons = screen.getAllByRole("button")
    await user.click(buttons[1])

    expect(mockHandleDelete).toHaveBeenCalledTimes(1)
  })

  it("calls reRecord when the re-record button is clicked in done state", async () => {
    mockRecordingState = "done"
    const user = userEvent.setup()
    await renderComponent()

    const buttons = screen.getAllByRole("button")
    await user.click(buttons[0])

    expect(mockReRecord).toHaveBeenCalledTimes(1)
  })
})
