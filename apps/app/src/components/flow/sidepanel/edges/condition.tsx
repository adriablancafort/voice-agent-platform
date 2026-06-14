import type { FlowEdgeConfig } from "@workspace/shared/agent-config/types"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useAgentStore } from "@/stores/agent"
import { FlowSidePanelBase } from "../base"

type EdgePanelProps = {
  edge: FlowEdgeConfig
}

export function EdgePanel({ edge }: EdgePanelProps) {
  const setEdge = useAgentStore((state) => state.setEdge)

  return (
    <FlowSidePanelBase title="Edge">
      <FieldGroup>
        <Field>
          <FieldLabel>Condition</FieldLabel>
          <Input
            value={edge.data.condition}
            onChange={(event) =>
              setEdge({
                ...edge,
                data: { ...edge.data, condition: event.target.value },
              })
            }
          />
        </Field>
      </FieldGroup>
    </FlowSidePanelBase>
  )
}
