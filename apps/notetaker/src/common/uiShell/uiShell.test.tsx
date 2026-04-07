import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { UIShell } from "./uiShell"
import { ToastProvider } from "../toast/ToastContext"

vi.mock("@/components/Header/Header", () => ({
  Header: () => <header />,
}))

describe("UIShell", () => {
  it("renders the header", async () => {
    await setupTest(
      <ToastProvider>
        <UIShell />
      </ToastProvider>,
    )

    expect(document.querySelector("header")).toBeTruthy()
  })

  it("renders the footer with author name", async () => {
    await setupTest(
      <ToastProvider>
        <UIShell />
      </ToastProvider>,
    )

    expect(
      screen.getByText(import.meta.env.VITE_AUTHOR_NAME, { exact: false }),
    ).toBeTruthy()
  })
})
