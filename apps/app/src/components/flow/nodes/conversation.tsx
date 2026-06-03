import { Handle, Position } from "@xyflow/react"
import { Phone, Play } from "lucide-react"

import type { FlowConversationNode } from "@workspace/shared/agent-config/types"

type ConversationNodeProps = {
  data: FlowConversationNode["data"]
}

export function ConversationNode({ data }: ConversationNodeProps) {
  const isStart = data.isStart

  return (
    <div className="w-64 rounded-lg border border-neutral-300 bg-white">
      {!isStart && <Handle type="target" position={Position.Top} />}
      <div className="mx-3 my-3 flex items-center space-x-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300">
          {isStart ? (
            <Play className="h-4 w-4 text-green-600" />
          ) : (
            <Phone className="h-4 w-4 text-blue-600" />
          )}
        </span>
        <span className="text-sm font-medium text-neutral-800">
          {data.name}
        </span>
      </div>
      <div className="border-t border-neutral-300" />
      <div className="p-3 pb-1 text-xs text-neutral-800 capitalize">
        {data.instructions.type}:
      </div>
      <div className="p-3 pt-0 text-xs text-neutral-500">
        {data.instructions.text}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
