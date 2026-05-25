import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useRef } from "react"
import { useShallow } from "zustand/react/shallow"
import { FlowConfigButtons } from "@/components/agents/flow-config-buttons"
import { useAgentStore } from "@/stores/agent"
import { ConditionEdge } from "./edges/condition"
import { ConversationNode } from "./nodes/conversation"
import { EndNode } from "./nodes/end"

const selector = (state: ReturnType<typeof useAgentStore.getState>) => ({
  nodes: state.draftConfig.nodes,
  edges: state.draftConfig.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  openNodePanel: state.openNodePanel,
  openEdgePanel: state.openEdgePanel,
  closeSidePanel: state.closeSidePanel,
})

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    openNodePanel,
    openEdgePanel,
    closeSidePanel,
  } = useAgentStore(useShallow(selector))
  const skipNextPaneCloseRef = useRef(false)

  function handleConnect(connection: Parameters<typeof onConnect>[0]) {
    skipNextPaneCloseRef.current = true
    onConnect(connection)
  }

  function handlePaneClick() {
    if (skipNextPaneCloseRef.current) {
      skipNextPaneCloseRef.current = false
      return
    }

    closeSidePanel()
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onNodeClick={(_, node) => openNodePanel(node.id)}
      onEdgeClick={(_, edge) => openEdgePanel(edge.id)}
      onPaneClick={handlePaneClick}
      nodeTypes={{
        conversation: ConversationNode,
        end: EndNode,
      }}
      edgeTypes={{
        default: ConditionEdge,
      }}
      defaultEdgeOptions={{
        animated: true,
      }}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <FlowConfigButtons />
      <Background color="#d4d4d4" />
      <Controls position="bottom-left" />
      <MiniMap zoomable pannable />
    </ReactFlow>
  )
}
