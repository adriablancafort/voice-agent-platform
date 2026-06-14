import type {
  AgentConfig,
  FlowEdgeConfig,
  FlowNodeConfig,
} from "@workspace/shared/agent-config/types"

export type ClientFlowNode = FlowNodeConfig & { selected?: boolean }
export type ClientFlowEdge = FlowEdgeConfig & { selected?: boolean }

export type ClientDraftConfig = Omit<AgentConfig, "nodes" | "edges"> & {
  nodes: ClientFlowNode[]
  edges: ClientFlowEdge[]
}

export function toClientDraftConfig(server: AgentConfig): ClientDraftConfig {
  return {
    ...server,
    nodes: server.nodes.map((node) => ({ ...node, selected: false })),
    edges: server.edges.map((edge) => ({ ...edge, selected: false })),
  }
}

export function toServerDraftConfig(config: ClientDraftConfig): AgentConfig {
  return {
    ...config,
    nodes: config.nodes.map(({ selected: _, ...node }) => node),
    edges: config.edges.map(({ selected: _, ...edge }) => edge),
  }
}

export function applySelection(
  config: ClientDraftConfig,
  selected?: { nodeId?: string; edgeId?: string }
): ClientDraftConfig {
  return {
    ...config,
    nodes: config.nodes.map((node) => ({
      ...node,
      selected: node.id === selected?.nodeId,
    })),
    edges: config.edges.map((edge) => ({
      ...edge,
      selected: edge.id === selected?.edgeId,
    })),
  }
}
