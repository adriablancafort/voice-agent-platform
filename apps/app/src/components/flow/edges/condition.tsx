import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react"

import type { FlowEdgeConfig } from "@workspace/shared/agent-config/types"
import { cn } from "@workspace/ui/lib/utils"
import { useAgentStore } from "@/stores/agent"

type ConditionEdgeType = Edge<FlowEdgeConfig["data"]>

export function ConditionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<ConditionEdgeType>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const selectEdge = useAgentStore((state) => state.selectEdge)

  return (
    <>
      <BaseEdge path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className={cn(
            "nopan nodrag max-w-48 min-h-6 min-w-16 cursor-pointer truncate rounded border border-border bg-popover px-2 py-1 text-xs font-medium text-muted-foreground",
            selected && "border-ring ring-2 ring-ring/50"
          )}
          onClick={() => selectEdge(id)}
        >
          {data?.condition}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
