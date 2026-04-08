export const formatTimestamp = (date: Date): string => {
  const month = date.toLocaleString("en-US", { month: "long" })
  const day = date.getDate()
  const year = date.getFullYear()

  const rawHours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = rawHours >= 12 ? "pm" : "am"
  const hours = rawHours % 12 || 12

  const minutesStr = minutes.toString().padStart(2, "0")

  return `${month} ${day}, ${year} ${hours}:${minutesStr}${ampm}`
}

export const getCurrentTimestamp = (): string => formatTimestamp(new Date())
