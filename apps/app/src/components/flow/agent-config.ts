import type {
  AgentConfig,
  FlowEdgeConfig,
  FlowNodeConfig,
} from "@workspace/shared/api/agent-config/types"

export type ClientFlowNode = FlowNodeConfig & { selected?: boolean }
export type ClientFlowEdge = FlowEdgeConfig & { selected?: boolean }

export type ClientAgentConfig = Omit<AgentConfig, "nodes" | "edges"> & {
  nodes: ClientFlowNode[]
  edges: ClientFlowEdge[]
}

export function toClientAgentConfig(server: AgentConfig): ClientAgentConfig {
  return {
    ...server,
    nodes: server.nodes.map((node) => ({ ...node })),
    edges: server.edges.map((edge) => ({ ...edge })),
  }
}

export function toServerAgentConfig(config: ClientAgentConfig): AgentConfig {
  return {
    ...config,
    nodes: config.nodes.map(({ selected: _, ...node }) => node),
    edges: config.edges.map(({ selected: _, ...edge }) => edge),
  }
}
