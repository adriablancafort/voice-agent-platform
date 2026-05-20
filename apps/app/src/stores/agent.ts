import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"
import { createDefaultAgentConfig } from "@workspace/shared/agent-config/defaults"
import type {
  FlowEdgeConfig,
  FlowNodeConfig,
} from "@workspace/shared/agent-config/types"
import type { AgentDetail } from "@workspace/shared/agents/types"

type AgentStore = AgentDetail & {
  setName: (name: string) => void
  setAgent: (agent: AgentDetail) => void
  onNodesChange: (changes: NodeChange<FlowNodeConfig>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdgeConfig>[]) => void
  onConnect: (connection: Connection) => void
}

const initialState: AgentDetail = {
  id: "",
  name: "",
  draftConfig: createDefaultAgentConfig(),
  createdAt: new Date(),
  updatedAt: new Date(),
  versions: [],
}

export const useAgentStore = create<AgentStore>((set) => ({
  ...initialState,
  setName: (name) =>
    set({
      name,
    }),
  setAgent: (agent) =>
    set({
      id: agent.id,
      name: agent.name,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      versions: agent.versions,
      draftConfig: agent.draftConfig,
    }),
  onNodesChange: (changes) =>
    set((state) => ({
      draftConfig: {
        ...state.draftConfig,
        nodes: applyNodeChanges(changes, state.draftConfig.nodes),
      },
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      draftConfig: {
        ...state.draftConfig,
        edges: applyEdgeChanges(changes, state.draftConfig.edges),
      },
    })),
  onConnect: (connection) =>
    set((state) => ({
      draftConfig: {
        ...state.draftConfig,
        edges: addEdge(connection, state.draftConfig.edges),
      },
    })),
}))
