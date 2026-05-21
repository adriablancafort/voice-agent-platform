import type { FlowNodeInstructions } from "@workspace/shared/agent-config/types"

// Runtime flow
export interface FlowConversationNode {
  type: "conversation"
  name: string
  isStart?: true
  startSpeaker?: "agent" | "user"
  instructions: FlowNodeInstructions
  outgoingEdges: FlowEdge[]
}

export interface FlowEndNode {
  type: "end"
  name: string
}

export type FlowNode = FlowConversationNode | FlowEndNode

export interface FlowEdge {
  condition: string
  transitionToolName: string
  targetNode: FlowNode
}

export interface FlowGraph {
  globalPrompt: string
  startNode: FlowConversationNode
}
