import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useShallow } from "zustand/react/shallow"
import { useAgentConfigStore } from "@/stores/agent-config"
import { ConditionEdge } from "./edges/condition"
import { ConversationNode } from "./nodes/conversation"
import { EndNode } from "./nodes/end"

const selector = (state: ReturnType<typeof useAgentConfigStore.getState>) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
})

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useAgentConfigStore(useShallow(selector))

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
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
      <Background color="#d4d4d4" />
      <Controls position="bottom-left" />
      <MiniMap zoomable pannable />
    </ReactFlow>
  )
}
