import { VoiceAgentClient } from "@/components/voice-agent-client"
import { VoiceAgentTranscript } from "@/components/voice-agent-transcript"
import { useAgentStore } from "@/stores/agent"
import { FlowSidePanelBase } from "./base"

export function TestPanel() {
  const agentId = useAgentStore((state) => state.id)

  return (
    <FlowSidePanelBase title="Test agent" contentClassName="p-0">
      <VoiceAgentClient agentId={agentId}>
        <VoiceAgentTranscript />
      </VoiceAgentClient>
    </FlowSidePanelBase>
  )
}
