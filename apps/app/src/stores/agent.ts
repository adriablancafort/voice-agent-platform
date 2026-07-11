import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"

import { createDefaultAgentConfig } from "@workspace/shared/agents/templates/defaults"
import type {
  AgentConfig,
  FlowEdgeConfig,
  FlowNodeConfig,
} from "@workspace/shared/api/agent-config/types"
import type { AgentDetailResponse } from "@workspace/shared/api/agents/types"
import {
  type ClientAgentConfig,
  type ClientFlowEdge,
  type ClientFlowNode,
  toClientAgentConfig,
} from "@/components/flow/agent-config"

export type FlowSidePanelState =
  | { kind: "closed" }
  | { kind: "test" }
  | { kind: "global-prompt" }
  | { kind: "models-config" }
  | { kind: "node"; node: FlowNodeConfig }
  | { kind: "edge"; edge: FlowEdgeConfig }

type FlowSelection = { nodeId?: string; edgeId?: string }

type AgentEditorState = {
  agent: AgentDetailResponse
  config: ClientAgentConfig
  readOnly: boolean
  activeVersionNumber: number | null
  activeVersionId: string | null
  sidePanel: FlowSidePanelState
}

type AgentEditorStore = AgentEditorState & {
  setAgent: (agent: AgentDetailResponse) => void
  setConfig: (config: ClientAgentConfig) => void
  loadAgentConfig: (config: AgentConfig, readOnly: boolean) => void
  loadAgentVersionConfig: (
    config: AgentConfig,
    version: { id: string; number: number }
  ) => void
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

let lastConnectAt = 0
const CONNECT_GUARD_MS = 200

export const emptyAgent: AgentDetailResponse = {
  id: "",
  name: "",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  versions: [],
}

function selectionFromSidePanel(
  sidePanel: FlowSidePanelState
): FlowSelection | undefined {
  if (sidePanel.kind === "node") {
    return { nodeId: sidePanel.node.id }
  }
  if (sidePanel.kind === "edge") {
    return { edgeId: sidePanel.edge.id }
  }
}

function applySelection(
  config: ClientAgentConfig,
  selection?: FlowSelection
): ClientAgentConfig {
  const selectedNodeId = selection?.nodeId
  const selectedEdgeId = selection?.edgeId

  return {
    ...config,
    nodes: config.nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
    })),
    edges: config.edges.map((edge) => ({
      ...edge,
      selected: edge.id === selectedEdgeId,
    })),
  }
}

const initialState: AgentEditorState = {
  agent: emptyAgent,
  config: toClientAgentConfig(createDefaultAgentConfig()),
  readOnly: true,
  activeVersionNumber: null,
  activeVersionId: null,
  sidePanel: closedSidePanel,
}

export const useAgentStore = create<AgentEditorStore>((set) => ({
  ...initialState,
  setAgent: (agent) => set({ agent }),
  setConfig: (config) => set({ config }),
  loadAgentConfig: (config, readOnly) =>
    set((state) => ({
      config: toClientAgentConfig(config),
      readOnly,
      activeVersionNumber: null,
      activeVersionId: null,
      sidePanel: closedSidePanel,
      agent: state.agent,
    })),
  loadAgentVersionConfig: (config, version) =>
    set((state) => ({
      config: toClientAgentConfig(config),
      readOnly: true,
      activeVersionNumber: version.number,
      activeVersionId: version.id,
      sidePanel: closedSidePanel,
      agent: state.agent,
    })),
  setNode: (node) =>
    set((state) => ({
      sidePanel: { kind: "node", node },
      config: applySelection(
        {
          ...state.config,
          nodes: state.config.nodes.map((entry) =>
            entry.id === node.id ? node : entry
          ),
        },
        { nodeId: node.id }
      ),
    })),
  setEdge: (edge) =>
    set((state) => ({
      sidePanel: { kind: "edge", edge },
      config: applySelection(
        {
          ...state.config,
          edges: state.config.edges.map((entry) =>
            entry.id === edge.id ? edge : entry
          ),
        },
        { edgeId: edge.id }
      ),
    })),
  addNode: (node) =>
    set((state) => ({
      sidePanel: { kind: "node", node },
      config: applySelection(
        { ...state.config, nodes: [...state.config.nodes, node] },
        { nodeId: node.id }
      ),
    })),
  onNodesChange: (changes) => {
    const filtered = changes.filter((change) => change.type !== "select")
    if (filtered.length === 0) {
      return
    }

    set((state) => {
      if (state.readOnly) {
        return state
      }

      const nodes = applyNodeChanges(filtered, state.config.nodes)
      const panel = state.sidePanel
      const sidePanel =
        panel.kind === "node" &&
        !nodes.some((node) => node.id === panel.node.id)
          ? closedSidePanel
          : panel

      return {
        sidePanel,
        config: applySelection(
          { ...state.config, nodes },
          selectionFromSidePanel(sidePanel)
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
      if (state.readOnly) {
        return state
      }

      const edges = applyEdgeChanges(filtered, state.config.edges)
      const panel = state.sidePanel
      const sidePanel =
        panel.kind === "edge" &&
        !edges.some((edge) => edge.id === panel.edge.id)
          ? closedSidePanel
          : panel

      return {
        sidePanel,
        config: applySelection(
          { ...state.config, edges },
          selectionFromSidePanel(sidePanel)
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

    set((state) => {
      const edges = addEdge(edge, state.config.edges)
      if (edges.length === state.config.edges.length) {
        return state
      }

      return {
        sidePanel: { kind: "edge", edge },
        config: applySelection({ ...state.config, edges }, { edgeId: edge.id }),
      }
    })
  },
  selectNode: (node) =>
    set((state) => ({
      sidePanel: { kind: "node", node },
      config: applySelection(state.config, { nodeId: node.id }),
    })),
  selectEdge: (edge) =>
    set((state) => ({
      sidePanel: { kind: "edge", edge },
      config: applySelection(state.config, { edgeId: edge.id }),
    })),
  setSidePanel: (sidePanel) => {
    if (
      sidePanel.kind === "closed" &&
      Date.now() - lastConnectAt < CONNECT_GUARD_MS
    ) {
      return
    }

    set((state) => ({
      sidePanel,
      config: applySelection(state.config, selectionFromSidePanel(sidePanel)),
    }))
  },
}))
