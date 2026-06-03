import type { ChangeEvent } from "react"

import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useAgentStore } from "@/stores/agent"

type EdgePanelProps = {
  edgeId: string
}

export function EdgePanel({ edgeId }: EdgePanelProps) {
  const edge = useAgentStore((state) =>
    state.draftConfig.edges.find((entry) => entry.id === edgeId)
  )
  const updateEdge = useAgentStore((state) => state.updateEdge)

  if (!edge) {
    return null
  }

  const conditionEdge = edge

  function updateEdgeCondition(condition: string) {
    updateEdge(conditionEdge.id, (current) => ({
      ...current,
      data: {
        ...current.data,
        condition,
      },
    }))
  }

  function handleConditionChange(event: ChangeEvent<HTMLInputElement>) {
    updateEdgeCondition(event.target.value)
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Condition</FieldLabel>
        <Input
          value={conditionEdge.data.condition}
          onChange={handleConditionChange}
        />
      </Field>
    </FieldGroup>
  )
}
