import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"
import { useAgentStore } from "@/stores/agent"

export function GlobalPromptPanel() {
  const globalPrompt = useAgentStore((state) => state.draftConfig.globalPrompt)
  const setGlobalPrompt = useAgentStore((state) => state.setGlobalPrompt)

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Global prompt</FieldLabel>
        <Textarea
          rows={12}
          value={globalPrompt}
          onChange={(event) => setGlobalPrompt(event.target.value)}
          placeholder="You are a helpful assistant"
        />
      </Field>
    </FieldGroup>
  )
}
