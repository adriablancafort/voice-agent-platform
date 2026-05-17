import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"
import type {
  AgentConfig,
  FlowEdgeConfig,
  FlowNodeConfig,
} from "@workspace/shared/agent-config/types"

type AgentConfigStore = AgentConfig & {
  onNodesChange: (changes: NodeChange<FlowNodeConfig>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdgeConfig>[]) => void
  onConnect: (connection: Connection) => void
}

const initialState: AgentConfig = {
  nodes: [],
  edges: [],
}

export const useAgentConfigStore = create<AgentConfigStore>((set, get) => ({
  ...initialState,
  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    }),
  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
    }),
  onConnect: (connection) =>
    set({
      edges: addEdge(connection, get().edges),
    }),
}))
