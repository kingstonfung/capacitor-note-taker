import { describe, it, expect, beforeEach, vi } from "vitest"
import { bootstrapApp } from "./main.tsx"

const { getPlatformMock, createRootMock, renderMock } = vi.hoisted(() => {
  const rootRender = vi.fn()
  return {
    getPlatformMock: vi.fn(() => "web"),
    createRootMock: vi.fn(() => ({ render: rootRender })),
    renderMock: rootRender,
  }
})

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: getPlatformMock,
  },
}))

vi.mock("react-dom/client", () => ({
  default: {
    createRoot: createRootMock,
  },
}))

vi.mock("@tanstack/react-router", () => ({
  RouterProvider: () => <div>Router</div>,
}))

vi.mock("./router.tsx", () => ({
  router: {},
}))

describe("main", () => {
  beforeEach(() => {
    getPlatformMock.mockReturnValue("web")
    createRootMock.mockClear()
    renderMock.mockClear()
    document.head.innerHTML = ""
    document.body.innerHTML = '<div id="app"></div>'
  })

  it("does not inject viewport-fit on non-iOS platforms", async () => {
    document.head.innerHTML =
      '<meta name="viewport" content="width=device-width, initial-scale=1" />'
    getPlatformMock.mockReturnValue("android")
    bootstrapApp()
    const viewport = document.querySelector("meta[name='viewport']")
    expect(viewport?.getAttribute("content")).toBe(
      "width=device-width, initial-scale=1",
    )
  })

  it("appends viewport-fit=cover to the viewport meta on iOS", async () => {
    document.head.innerHTML =
      '<meta name="viewport" content="width=device-width, initial-scale=1" />'
    getPlatformMock.mockReturnValue("ios")
    bootstrapApp()
    const viewport = document.querySelector("meta[name='viewport']")
    expect(viewport?.getAttribute("content")).toBe(
      "width=device-width, initial-scale=1, viewport-fit=cover",
    )
  })

  it("leaves the document unchanged when iOS but no viewport meta exists", async () => {
    getPlatformMock.mockReturnValue("ios")
    await expect(
      Promise.resolve().then(() => bootstrapApp()),
    ).resolves.not.toThrow()
    expect(createRootMock).toHaveBeenCalledTimes(1)
  })
})
