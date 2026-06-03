import type { ChangeEvent } from "react"

import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { useAgentStore } from "@/stores/agent"

type ConversationNodePanelProps = {
  nodeId: string
}

export function ConversationNodePanel({ nodeId }: ConversationNodePanelProps) {
  const node = useAgentStore((state) =>
    state.draftConfig.nodes.find((entry) => entry.id === nodeId)
  )
  const updateNode = useAgentStore((state) => state.updateNode)

  if (!node || node.type !== "conversation") {
    return null
  }

  const conversationNode = node

  function updateConversationName(name: string) {
    updateNode(conversationNode.id, (current) =>
      current.type !== "conversation"
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

  function updateInstructionType(value: string) {
    if (value !== "prompt" && value !== "say") {
      return
    }

    updateNode(conversationNode.id, (current) =>
      current.type !== "conversation"
        ? current
        : {
            ...current,
            data: {
              ...current.data,
              instructions: {
                ...current.data.instructions,
                type: value,
              },
            },
          }
    )
  }

  function updateInstructionText(text: string) {
    updateNode(conversationNode.id, (current) =>
      current.type !== "conversation"
        ? current
        : {
            ...current,
            data: {
              ...current.data,
              instructions: {
                ...current.data.instructions,
                text,
              },
            },
          }
    )
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    updateConversationName(event.target.value)
  }

  function handleInstructionTextChange(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    updateInstructionText(event.target.value)
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input value={conversationNode.data.name} onChange={handleNameChange} />
      </Field>
      <Field>
        <Tabs
          value={conversationNode.data.instructions.type}
          onValueChange={updateInstructionType}
        >
          <TabsList>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="say">Say</TabsTrigger>
          </TabsList>
        </Tabs>

        <Textarea
          rows={8}
          value={conversationNode.data.instructions.text}
          onChange={handleInstructionTextChange}
        />
      </Field>
    </FieldGroup>
  )
}
