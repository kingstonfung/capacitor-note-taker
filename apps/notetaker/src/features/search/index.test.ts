import { describe, it, expect } from "vitest"
import * as SearchIndex from "./index"

describe("search/index:", () => {
  it("exports Search", () => {
    expect(SearchIndex.Search).toBeDefined()
  })
})
