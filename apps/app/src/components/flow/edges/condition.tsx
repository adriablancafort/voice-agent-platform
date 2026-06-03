import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react"

import type { FlowEdgeConfig } from "@workspace/shared/agent-config/types"

type ConditionEdgeType = Edge<FlowEdgeConfig["data"]>

export function ConditionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<ConditionEdgeType>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <BaseEdge path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="max-w-48 truncate rounded-sm border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-500"
        >
          {data?.condition}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
