import { Panel } from "@xyflow/react"
import { MicIcon, PencilLineIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { AddNodeButton } from "@/components/agents/add-node-button"
import { useAgentStore } from "@/stores/agent"

export function FlowConfigButtons() {
  const openGlobalPromptPanel = useAgentStore(
    (state) => state.openGlobalPromptPanel
  )
  const openModelsConfigPanel = useAgentStore(
    (state) => state.openModelsConfigPanel
  )

  return (
    <Panel position="top-left" className="flex flex-col gap-2">
      <AddNodeButton />

      <div>
        <Button variant="outline" onClick={openGlobalPromptPanel}>
          <PencilLineIcon />
          Global prompt
        </Button>
      </div>

      <div>
        <Button variant="outline" onClick={openModelsConfigPanel}>
          <MicIcon />
          Models
        </Button>
      </div>
    </Panel>
  )
}
