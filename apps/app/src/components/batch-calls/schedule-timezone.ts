function getPartValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
) {
  const part = parts.find((entry) => entry.type === type)
  return Number(part?.value)
}

function zonedInstantAsUtc(instant: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant))

  return Date.UTC(
    getPartValue(parts, "year"),
    getPartValue(parts, "month") - 1,
    getPartValue(parts, "day"),
    getPartValue(parts, "hour"),
    getPartValue(parts, "minute"),
    getPartValue(parts, "second")
  )
}

function resolveUtcInstant(wallClockUtc: number, timeZone: string) {
  const firstPassOffset =
    zonedInstantAsUtc(wallClockUtc, timeZone) - wallClockUtc
  const firstPassUtc = wallClockUtc - firstPassOffset

  const secondPassOffset =
    zonedInstantAsUtc(firstPassUtc, timeZone) - firstPassUtc
  return wallClockUtc - secondPassOffset
}

export function zonedDateTimeToIso(
  date: Date,
  time: string,
  timeZone: string
): string {
  const [hours, minutes, seconds = 0] = time.split(":").map(Number)

  const wallClockUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    seconds
  )

  const utcInstant = resolveUtcInstant(wallClockUtc, timeZone)
  return new Date(utcInstant).toISOString()
}

export const timeZones = Intl.supportedValuesOf("timeZone")

export const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
