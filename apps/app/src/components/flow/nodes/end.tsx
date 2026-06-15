import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import { PhoneOff } from "lucide-react"

import type { FlowEndNode } from "@workspace/shared/agent-config/types"
import { FlowNodeBase } from "./base"

type EndNodeType = Node<FlowEndNode["data"], "end">

export function EndNode({ id, data, selected }: NodeProps<EndNodeType>) {
  return (
    <FlowNodeBase id={id} selected={selected}>
      <Handle
        type="target"
        position={Position.Top}
        className="size-2! rounded-full! border-2! border-muted-foreground! bg-popover!"
      />
      <div className="mx-3 my-3 flex items-center space-x-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-border">
          <PhoneOff className="h-4 w-4 text-red-600" />
        </span>
        <span className="text-sm font-medium text-foreground">{data.name}</span>
      </div>
    </FlowNodeBase>
  )
}
