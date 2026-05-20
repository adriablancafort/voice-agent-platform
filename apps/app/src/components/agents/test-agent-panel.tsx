import { PlayIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
} from "@workspace/ui/components/side-panel"
import { VoiceAgentClient } from "@/components/voice-agent-client"
import { useAgentStore } from "@/stores/agent"

export function TestAgentPanel() {
  const agentId = useAgentStore((state) => state.id)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen((open) => !open)}>
        <PlayIcon />
        Test
      </Button>
      <SidePanel open={open} onOpenChange={setOpen}>
        <SidePanelHeader>
          <SidePanelTitle>Test Agent</SidePanelTitle>
        </SidePanelHeader>
        <SidePanelContent className="flex items-center justify-center">
          <VoiceAgentClient agentId={agentId} />
        </SidePanelContent>
      </SidePanel>
    </>
  )
}
