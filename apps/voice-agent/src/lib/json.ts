export function parseJsonObject(
  raw: string | undefined
): Record<string, unknown> {
  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {}
    }
    return parsed
  } catch {
    return {}
  }
}
