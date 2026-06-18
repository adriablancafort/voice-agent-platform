import { useMemo, useState } from "react"

import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { VoiceAgentClient } from "@/components/voice-agent-client"
import { VoiceAgentTranscript } from "@/components/voice-agent-transcript"
import { collectVariableKeys } from "@/lib/collect-variable-keys"
import { useAgentStore } from "@/stores/agent"
import { FlowSidePanelBase } from "./base"

export function TestPanel() {
  const agentId = useAgentStore((state) => state.id)
  const draftConfig = useAgentStore((state) => state.draftConfig)
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  )

  const variableKeys = useMemo(
    () => collectVariableKeys(draftConfig),
    [draftConfig]
  )

  const preCallContent =
    variableKeys.length > 0 ? (
      <FieldGroup className="mb-4">
        {variableKeys.map((key) => (
          <Field key={key}>
            <FieldLabel>{key}</FieldLabel>
            <Input
              value={variableValues[key] ?? ""}
              onChange={(event) =>
                setVariableValues((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              placeholder={`Value for {{${key}}}`}
            />
          </Field>
        ))}
      </FieldGroup>
    ) : null

  return (
    <FlowSidePanelBase title="Test agent" contentClassName="p-0">
      <VoiceAgentClient
        agentId={agentId}
        variableValues={variableValues}
        preCallContent={preCallContent}
      >
        <VoiceAgentTranscript />
      </VoiceAgentClient>
    </FlowSidePanelBase>
  )
}
