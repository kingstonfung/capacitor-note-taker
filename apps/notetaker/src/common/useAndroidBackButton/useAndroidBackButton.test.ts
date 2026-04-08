import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAndroidBackButton } from "./useAndroidBackButton"

const mockAddListener = vi.fn()
const mockExitApp = vi.fn()
const mockIsNativePlatform = vi.fn()
const mockUseRouter = vi.fn()
const mockHistoryBack = vi.fn()

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: (...args: unknown[]) => mockAddListener(...args),
    exitApp: () => mockExitApp(),
  },
}))

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNativePlatform(),
  },
}))

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => mockUseRouter(),
}))

describe("useAndroidBackButton:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window.history, "back").mockImplementation(mockHistoryBack)
  })

  it("does not register a listener on non-native platforms", () => {
    mockIsNativePlatform.mockReturnValue(false)
    mockUseRouter.mockReturnValue({ state: { location: { pathname: "/" } } })

    renderHook(() => useAndroidBackButton())

    expect(mockAddListener).not.toHaveBeenCalled()
  })

  it("registers a 'backButton' listener on native platforms", () => {
    mockIsNativePlatform.mockReturnValue(true)
    mockUseRouter.mockReturnValue({ state: { location: { pathname: "/" } } })
    mockAddListener.mockResolvedValue({ remove: vi.fn() })

    renderHook(() => useAndroidBackButton())

    expect(mockAddListener).toHaveBeenCalledWith(
      "backButton",
      expect.any(Function),
    )
  })

  it("calls App.exitApp when back is pressed at the root route", () => {
    mockIsNativePlatform.mockReturnValue(true)
    mockUseRouter.mockReturnValue({ state: { location: { pathname: "/" } } })

    let capturedCallback: (() => void) | undefined
    mockAddListener.mockImplementation((_event: string, cb: () => void) => {
      capturedCallback = cb
      return Promise.resolve({ remove: vi.fn() })
    })

    renderHook(() => useAndroidBackButton())

    capturedCallback?.()

    expect(mockExitApp).toHaveBeenCalledTimes(1)
    expect(mockHistoryBack).not.toHaveBeenCalled()
  })

  it("calls window.history.back() when back is pressed on a non-root route", () => {
    mockIsNativePlatform.mockReturnValue(true)
    mockUseRouter.mockReturnValue({
      state: { location: { pathname: "/note/123" } },
    })

    let capturedCallback: (() => void) | undefined
    mockAddListener.mockImplementation((_event: string, cb: () => void) => {
      capturedCallback = cb
      return Promise.resolve({ remove: vi.fn() })
    })

    renderHook(() => useAndroidBackButton())

    capturedCallback?.()

    expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    expect(mockExitApp).not.toHaveBeenCalled()
  })

  it("removes the listener on unmount", async () => {
    mockIsNativePlatform.mockReturnValue(true)
    mockUseRouter.mockReturnValue({ state: { location: { pathname: "/" } } })

    const mockRemove = vi.fn()
    mockAddListener.mockResolvedValue({ remove: mockRemove })

    const { unmount } = renderHook(() => useAndroidBackButton())

    unmount()

    await vi.waitFor(() => {
      expect(mockRemove).toHaveBeenCalledTimes(1)
    })
  })
})
