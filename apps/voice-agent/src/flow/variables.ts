import type { CallVariableValues } from "@workspace/shared/api/calls/types"
import { parseJsonObject } from "@/lib/json"

const VARIABLE_PATTERN = /\{\{\s*([a-z0-9_]+)\s*\}\}/g

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function parseCallValues(raw: string | undefined) {
  const values: CallVariableValues = {}

  const parsed = parseJsonObject(raw)
  for (const [key, value] of Object.entries(parsed)) {
    if (/^[a-z0-9_]+$/.test(key) && typeof value === "string") {
      values[key] = value
    }
  }

  return values
}

export function createVariables(attributes: CallVariableValues) {
  const values = parseCallValues(attributes.variable_values)

  const phoneNumber = attributes["sip.phoneNumber"]
  if (phoneNumber) {
    values.phone_number = phoneNumber
  }

  return {
    replace(text: string) {
      const now = new Date()
      values.date = formatDate(now)
      values.time = formatTime(now)

      return text.replace(VARIABLE_PATTERN, (match, key: string) => {
        const value = values[key]
        return value === undefined ? match : value
      })
    },
  }
}

export type Variables = ReturnType<typeof createVariables>
