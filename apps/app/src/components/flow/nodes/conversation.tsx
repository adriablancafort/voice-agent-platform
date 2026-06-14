import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import { Phone, Play } from "lucide-react"

import type { FlowConversationNode } from "@workspace/shared/agent-config/types"
import { cn } from "@workspace/ui/lib/utils"

type ConversationNodeType = Node<FlowConversationNode["data"], "conversation">

export function ConversationNode({
  data,
  selected,
}: NodeProps<ConversationNodeType>) {
  const isStart = data.isStart

  return (
    <div
      className={cn(
        "w-64 rounded-lg border border-border bg-popover",
        selected && "border-ring ring-2 ring-ring/50"
      )}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="size-2! rounded-full! border-2! border-muted-foreground! bg-popover!"
        />
      )}
      <div className="mx-3 my-3 flex items-center space-x-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-border">
          {isStart ? (
            <Play className="h-4 w-4 text-green-600" />
          ) : (
            <Phone className="h-4 w-4 text-blue-600" />
          )}
        </span>
        <span className="text-sm font-medium text-foreground">{data.name}</span>
      </div>
      <div className="border-t border-border" />
      <div className="p-3 pb-1 text-xs text-foreground capitalize">
        {data.instructions.type}:
      </div>
      <div className="p-3 pt-0 text-xs text-muted-foreground">
        {data.instructions.text}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="size-2! rounded-full! border-2! border-muted-foreground! bg-popover!"
      />
    </div>
  )
}
