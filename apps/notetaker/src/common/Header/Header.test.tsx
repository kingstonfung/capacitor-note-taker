import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { Header } from "./Header"
import { setupTest } from "@/testSetups/TestProviderWrapper"

describe("Header", () => {
  it("renders the header correctly", async () => {
    await setupTest(<Header onOpenSearch={() => {}} />)

    const link = screen.getByRole("link", { name: "Capacitor Note Taker" })
    expect(link).not.toBeNull()
    expect(link.getAttribute("href")).toBe("/")
  })
})
