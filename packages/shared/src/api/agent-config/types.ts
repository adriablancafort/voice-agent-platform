import type { z } from "zod"

import type {
  agentConfigSchema,
  expressionConditionSchema,
  expressionOperatorSchema,
  extractVariableSchema,
  flowEdgeConditionSchema,
  flowEdgeConfigSchema,
  flowNodeConfigSchema,
  flowNodeInstructionsSchema,
  turnDetectionConfigSchema,
} from "./schemas"

export type AgentConfig = z.infer<typeof agentConfigSchema>
export type FlowNodeInstructions = z.infer<typeof flowNodeInstructionsSchema>
export type ExtractVariable = z.infer<typeof extractVariableSchema>
export type FlowNodeConfig = z.infer<typeof flowNodeConfigSchema>
export type FlowConversationNode = Extract<
  FlowNodeConfig,
  { type: "conversation" }
>
export type FlowEndNode = Extract<FlowNodeConfig, { type: "end" }>
export type FlowEdgeConfig = z.infer<typeof flowEdgeConfigSchema>
export type FlowEdgeCondition = z.infer<typeof flowEdgeConditionSchema>
export type ExpressionCondition = z.infer<typeof expressionConditionSchema>
export type ExpressionOperator = z.infer<typeof expressionOperatorSchema>
export type TurnDetectionConfig = z.infer<typeof turnDetectionConfigSchema>
