import type { AgentConfig } from "@workspace/shared/agent-config/types"

const VARIABLE_PATTERN = /\{\{\s*([a-z0-9_]+)\s*\}\}/g

const SYSTEM_VARIABLES = new Set(["date", "time", "phone_number"])

function extractKeys(text: string) {
  const keys = []

  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    const key = match[1]
    if (key && !SYSTEM_VARIABLES.has(key)) {
      keys.push(key)
    }
  }

  return keys
}

export function collectVariableKeys(config: AgentConfig) {
  const keys = new Set<string>()

  for (const key of extractKeys(config.globalPrompt)) {
    keys.add(key)
  }

  for (const node of config.nodes) {
    if (node.type === "conversation") {
      for (const key of extractKeys(node.data.instructions.text)) {
        keys.add(key)
      }
    }
  }

  for (const edge of config.edges) {
    for (const key of extractKeys(edge.data.condition)) {
      keys.add(key)
    }
  }

  return [...keys].sort()
}
