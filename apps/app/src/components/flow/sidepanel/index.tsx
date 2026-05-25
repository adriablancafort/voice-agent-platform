import { useAgentStore } from "@/stores/agent"
import { FlowSidePanelBase } from "./base"
import { EdgePanel } from "./edges/condition"
import { GlobalPromptPanel } from "./global-prompt"
import { ModelsConfigPanel } from "./models-config"
import { ConversationNodePanel } from "./nodes/conversation"
import { EndNodePanel } from "./nodes/end"
import { TestPanel } from "./test"

export function FlowSidePanel() {
  const sidePanel = useAgentStore((state) => state.sidePanel)
  const agentId = useAgentStore((state) => state.id)
  const closeSidePanel = useAgentStore((state) => state.closeSidePanel)

  if (sidePanel.kind === "closed") {
    return null
  }

  let title = "Agent panel"
  let content: React.ReactNode = null

  if (sidePanel.kind === "test") {
    title = "Test agent"
    content = <TestPanel agentId={agentId} />
  }

  if (sidePanel.kind === "global-prompt") {
    title = "Global prompt"
    content = <GlobalPromptPanel />
  }

  if (sidePanel.kind === "models-config") {
    title = "Models"
    content = <ModelsConfigPanel />
  }

  if (sidePanel.kind === "node") {
    const node = useAgentStore
      .getState()
      .draftConfig.nodes.find((entry) => entry.id === sidePanel.nodeId)

    if (node?.type === "conversation") {
      title = node.data.isStart ? "Start node" : "Conversation node"
      content = <ConversationNodePanel nodeId={node.id} />
    }

    if (node?.type === "end") {
      title = "End node"
      content = <EndNodePanel nodeId={node.id} />
    }
  }

  if (sidePanel.kind === "edge") {
    title = "Edge"
    content = <EdgePanel edgeId={sidePanel.edgeId} />
  }

  return (
    <FlowSidePanelBase open title={title} onClose={closeSidePanel}>
      {content}
    </FlowSidePanelBase>
  )
}
