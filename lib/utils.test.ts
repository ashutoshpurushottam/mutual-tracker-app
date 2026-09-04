import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("resolves conflicting Tailwind classes with the last win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("ignores falsy values", () => {
    expect(cn("text-sm", false && "hidden", null, undefined, "font-bold")).toBe(
      "text-sm font-bold"
    )
  })

  it("supports conditional object syntax via clsx", () => {
    expect(cn({ "bg-red-500": true, "bg-green-500": false }, "rounded")).toContain(
      "bg-red-500"
    )
    expect(cn({ "bg-red-500": true, "bg-green-500": false })).not.toContain(
      "bg-green-500"
    )
  })
})
