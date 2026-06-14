import {
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
import {
  applySelection,
  type ClientDraftConfig,
  type ClientFlowEdge,
  type ClientFlowNode,
  toClientDraftConfig,
} from "@/components/flow/draft-config"

export type FlowSidePanelState =
  | { kind: "closed" }
  | { kind: "test" }
  | { kind: "global-prompt" }
  | { kind: "models-config" }
  | { kind: "node"; node: FlowNodeConfig }
  | { kind: "edge"; edge: FlowEdgeConfig }

type AgentStoreState = Omit<AgentDetail, "draftConfig"> & {
  draftConfig: ClientDraftConfig
  sidePanel: FlowSidePanelState
}

type AgentStore = AgentStoreState & {
  setAgent: (agent: AgentDetail) => void
  setName: (name: string) => void
  setConfig: (draftConfig: ClientDraftConfig) => void
  setNode: (node: FlowNodeConfig) => void
  setEdge: (edge: FlowEdgeConfig) => void
  addNode: (node: FlowNodeConfig) => void
  onNodesChange: (changes: NodeChange<ClientFlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<ClientFlowEdge>[]) => void
  onConnect: (connection: Connection) => void
  selectNode: (node: ClientFlowNode) => void
  selectEdge: (edge: ClientFlowEdge) => void
  setSidePanel: (sidePanel: FlowSidePanelState) => void
}

const closedSidePanel: FlowSidePanelState = { kind: "closed" }

function panelSelection(panel: FlowSidePanelState) {
  if (panel.kind === "node") {
    return { nodeId: panel.node.id }
  }
  if (panel.kind === "edge") {
    return { edgeId: panel.edge.id }
  }
  return undefined
}

let lastConnectAt = 0
const CONNECT_GUARD_MS = 200

const initialState: AgentStoreState = {
  id: "",
  name: "",
  draftConfig: toClientDraftConfig(createDefaultAgentConfig()),
  createdAt: new Date(),
  updatedAt: new Date(),
  versions: [],
  sidePanel: closedSidePanel,
}

export const useAgentStore = create<AgentStore>((set) => ({
  ...initialState,
  setAgent: (agent) =>
    set((current) => {
      if (current.id !== agent.id) {
        return {
          ...agent,
          draftConfig: toClientDraftConfig(agent.draftConfig),
          sidePanel: closedSidePanel,
        }
      }

      return {
        ...current,
        versions: agent.versions,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      }
    }),
  setName: (name) => set({ name }),
  setConfig: (draftConfig) => set({ draftConfig }),
  setNode: (node) =>
    set((state) => ({
      sidePanel: { kind: "node", node },
      draftConfig: applySelection(
        {
          ...state.draftConfig,
          nodes: state.draftConfig.nodes.map((entry) =>
            entry.id === node.id ? node : entry
          ),
        },
        { nodeId: node.id }
      ),
    })),
  setEdge: (edge) =>
    set((state) => ({
      sidePanel: { kind: "edge", edge },
      draftConfig: applySelection(
        {
          ...state.draftConfig,
          edges: state.draftConfig.edges.map((entry) =>
            entry.id === edge.id ? edge : entry
          ),
        },
        { edgeId: edge.id }
      ),
    })),
  addNode: (node) =>
    set((state) => ({
      sidePanel: { kind: "node", node },
      draftConfig: applySelection(
        { ...state.draftConfig, nodes: [...state.draftConfig.nodes, node] },
        { nodeId: node.id }
      ),
    })),
  onNodesChange: (changes) => {
    const filtered = changes.filter((change) => change.type !== "select")
    if (filtered.length === 0) {
      return
    }

    set((state) => {
      const nodes = applyNodeChanges(filtered, state.draftConfig.nodes)
      const current = state.sidePanel
      const panel =
        current.kind === "node" &&
        !nodes.some((node) => node.id === current.node.id)
          ? closedSidePanel
          : current

      return {
        sidePanel: panel,
        draftConfig: applySelection(
          { ...state.draftConfig, nodes },
          panelSelection(panel)
        ),
      }
    })
  },
  onEdgesChange: (changes) => {
    const filtered = changes.filter(
      (change) => change.type !== "select" && change.type !== "add"
    )
    if (filtered.length === 0) {
      return
    }

    set((state) => {
      const edges = applyEdgeChanges(filtered, state.draftConfig.edges)
      const current = state.sidePanel
      const panel =
        current.kind === "edge" &&
        !edges.some((edge) => edge.id === current.edge.id)
          ? closedSidePanel
          : current

      return {
        sidePanel: panel,
        draftConfig: applySelection(
          { ...state.draftConfig, edges },
          panelSelection(panel)
        ),
      }
    })
  },
  onConnect: (connection) => {
    lastConnectAt = Date.now()
    const edge: FlowEdgeConfig = {
      ...connection,
      id: crypto.randomUUID(),
      data: { condition: "Transition condition" },
    }

    set((state) => ({
      sidePanel: { kind: "edge", edge },
      draftConfig: applySelection(
        { ...state.draftConfig, edges: [...state.draftConfig.edges, edge] },
        { edgeId: edge.id }
      ),
    }))
  },
  selectNode: (node) =>
    set((state) => ({
      sidePanel: { kind: "node", node },
      draftConfig: applySelection(state.draftConfig, { nodeId: node.id }),
    })),
  selectEdge: (edge) =>
    set((state) => ({
      sidePanel: { kind: "edge", edge },
      draftConfig: applySelection(state.draftConfig, { edgeId: edge.id }),
    })),
  setSidePanel: (sidePanel) =>
    set((state) => {
      if (
        sidePanel.kind === "closed" &&
        Date.now() - lastConnectAt < CONNECT_GUARD_MS
      ) {
        return state
      }

      return {
        sidePanel,
        draftConfig: applySelection(
          state.draftConfig,
          panelSelection(sidePanel)
        ),
      }
    }),
}))
