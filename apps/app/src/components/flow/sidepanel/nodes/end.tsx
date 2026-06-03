import type { ChangeEvent } from "react"

import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useAgentStore } from "@/stores/agent"

type EndNodePanelProps = {
  nodeId: string
}

export function EndNodePanel({ nodeId }: EndNodePanelProps) {
  const node = useAgentStore((state) =>
    state.draftConfig.nodes.find((entry) => entry.id === nodeId)
  )
  const updateNode = useAgentStore((state) => state.updateNode)

  if (!node || node.type !== "end") {
    return null
  }

  const endNode = node

  function updateEndNodeName(name: string) {
    updateNode(endNode.id, (current) =>
      current.type !== "end"
        ? current
        : {
            ...current,
            data: {
              ...current.data,
              name,
            },
          }
    )
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    updateEndNodeName(event.target.value)
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input value={endNode.data.name} onChange={handleNameChange} />
      </Field>
    </FieldGroup>
  )
}
