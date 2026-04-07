import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { ToastProvider, useToast } from "./ToastContext"

vi.mock("@/components/Toast/Toast", () => ({
  Toast: ({
    message,
    type,
    onDismiss,
  }: {
    message: string
    type: string
    onDismiss: () => void
  }) => (
    <div data-testid="toast" data-type={type} onClick={onDismiss}>
      {message}
    </div>
  ),
}))

const PENDING_TOAST_KEY = "pendingToast"

const TestConsumer = ({
  onRender,
}: {
  onRender: (ctx: ReturnType<typeof useToast>) => void
}) => {
  const ctx = useToast()
  onRender(ctx)
  return null
}

describe("ToastContext:", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("useToast throws when used outside ToastProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<TestConsumer onRender={() => {}} />)).toThrow(
      "useToast must be used within a ToastProvider",
    )
    consoleError.mockRestore()
  })

  it("renders no toast initially", () => {
    render(<ToastProvider>children</ToastProvider>)
    expect(screen.queryByTestId("toast")).toBeNull()
  })

  it("showToast renders the toast with the given message", () => {
    let ctx!: ReturnType<typeof useToast>
    render(
      <ToastProvider>
        <TestConsumer
          onRender={(c) => {
            ctx = c
          }}
        />
      </ToastProvider>,
    )
    act(() => ctx.showToast("Hello"))
    expect(screen.getByTestId("toast").textContent).toBe("Hello")
  })

  it("showToast defaults to success type", () => {
    let ctx!: ReturnType<typeof useToast>
    render(
      <ToastProvider>
        <TestConsumer
          onRender={(c) => {
            ctx = c
          }}
        />
      </ToastProvider>,
    )
    act(() => ctx.showToast("Hello"))
    expect(screen.getByTestId("toast").getAttribute("data-type")).toBe(
      "success",
    )
  })

  it("showToast passes the error type through", () => {
    let ctx!: ReturnType<typeof useToast>
    render(
      <ToastProvider>
        <TestConsumer
          onRender={(c) => {
            ctx = c
          }}
        />
      </ToastProvider>,
    )
    act(() => ctx.showToast("Oops", "error"))
    expect(screen.getByTestId("toast").getAttribute("data-type")).toBe("error")
  })

  it("onDismiss clears the toast", () => {
    let ctx!: ReturnType<typeof useToast>
    render(
      <ToastProvider>
        <TestConsumer
          onRender={(c) => {
            ctx = c
          }}
        />
      </ToastProvider>,
    )
    act(() => ctx.showToast("Hello"))
    act(() => screen.getByTestId("toast").click())
    expect(screen.queryByTestId("toast")).toBeNull()
  })

  it("showToastAfterReload writes to sessionStorage", () => {
    let ctx!: ReturnType<typeof useToast>
    render(
      <ToastProvider>
        <TestConsumer
          onRender={(c) => {
            ctx = c
          }}
        />
      </ToastProvider>,
    )
    act(() => ctx.showToastAfterReload("Saved", "success"))
    const stored = JSON.parse(sessionStorage.getItem(PENDING_TOAST_KEY)!)
    expect(stored).toEqual({ message: "Saved", type: "success" })
  })

  it("shows a pending toast from sessionStorage on mount and removes the key", () => {
    sessionStorage.setItem(
      PENDING_TOAST_KEY,
      JSON.stringify({ message: "Welcome back", type: "success" }),
    )
    render(<ToastProvider>children</ToastProvider>)
    expect(screen.getByTestId("toast").textContent).toBe("Welcome back")
    expect(sessionStorage.getItem(PENDING_TOAST_KEY)).toBeNull()
  })

  it("does not crash when sessionStorage contains invalid JSON", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    sessionStorage.setItem(PENDING_TOAST_KEY, "not-json")
    expect(() => render(<ToastProvider>children</ToastProvider>)).not.toThrow()
    expect(screen.queryByTestId("toast")).toBeNull()
    consoleSpy.mockRestore()
  })
})
