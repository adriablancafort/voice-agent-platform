import { z } from "zod"

export const sttConfigSchema = z
  .object({
    model: z.string().trim().min(1),
    language: z.string().trim().min(1).exactOptional(),
  })
  .strict()

export const llmConfigSchema = z
  .object({
    model: z.string().trim().min(1),
  })
  .strict()

export const ttsConfigSchema = z
  .object({
    model: z.string().trim().min(1),
    voice: z.string().trim().min(1).exactOptional(),
    language: z.string().trim().min(1).exactOptional(),
  })
  .strict()

export const turnDetectionConfigSchema = z
  .object({
    model: z.enum(["multilingual", "english"]),
  })
  .strict()

export const flowNodeInstructionsSchema = z.object({
  type: z.enum(["prompt", "say"]),
  text: z.string().trim().min(1),
})

export const flowNodeConfigSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("conversation"),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z
      .object({
        name: z.string().trim().min(1),
        isStart: z.literal(true).optional(),
        startSpeaker: z.enum(["agent", "user"]).optional(),
        instructions: flowNodeInstructionsSchema,
      })
      .strict(),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("end"),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z
      .object({
        name: z.string().trim().min(1),
      })
      .strict(),
  }),
])

export const flowEdgeConfigSchema = z.object({
  id: z.string().trim().min(1),
  source: z.string().trim().min(1),
  target: z.string().trim().min(1),
  data: z.object({
    condition: z.string().trim().min(1),
  }),
})

export const agentConfigSchema = z
  .object({
    stt: sttConfigSchema,
    llm: llmConfigSchema,
    tts: ttsConfigSchema,
    turnDetection: turnDetectionConfigSchema,
    globalPrompt: z.string(),
    nodes: z.array(flowNodeConfigSchema).min(1),
    edges: z.array(flowEdgeConfigSchema),
  })
  .superRefine((config, ctx) => {
    const nodeIds = new Set<string>()
    let startNodeCount = 0

    config.nodes.forEach((node, index) => {
      // Node IDs must be unique
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["nodes", index],
          message: `Duplicate node id "${node.id}".`,
        })
      }
      nodeIds.add(node.id)

      if (node.type === "conversation" && node.data.isStart === true) {
        startNodeCount++
      }
    })

    // Exactly one start node
    if (startNodeCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["nodes"],
        message: `Flow must have exactly one start node, found ${startNodeCount}.`,
      })
    }

    const edgeIds = new Set<string>()
    const sourceTargetKeys = new Set<string>()

    config.edges.forEach((edge, index) => {
      // Edge IDs must be unique
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index],
          message: `Duplicate edge id "${edge.id}".`,
        })
      }
      edgeIds.add(edge.id)

      // Edge sources must reference existing nodes
      if (!nodeIds.has(edge.source)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index, "source"],
          message: `Edge "${edge.id}": source node "${edge.source}" does not exist.`,
        })
      }

      // Edge targets must reference existing nodes
      if (!nodeIds.has(edge.target)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index, "target"],
          message: `Edge "${edge.id}": target node "${edge.target}" does not exist.`,
        })
      }

      // Edges must be unique
      const key = `${edge.source}-${edge.target}`
      if (sourceTargetKeys.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index],
          message: `Duplicate edge from "${edge.source}" to "${edge.target}".`,
        })
      }
      sourceTargetKeys.add(key)
    })
  })
