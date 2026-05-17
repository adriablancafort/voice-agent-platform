import { Handle, Position } from "@xyflow/react"
import { PhoneOff } from "lucide-react"
import type { FlowEndNode } from "@workspace/shared/agent-config/types"

type EndNodeProps = {
  data: FlowEndNode["data"]
}

export function EndNode({ data }: EndNodeProps) {
  return (
    <div className="w-64 rounded-lg border border-neutral-300 bg-white">
      <Handle type="target" position={Position.Top} />
      <div className="mx-3 my-3 flex items-center space-x-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300">
          <PhoneOff className="h-4 w-4 text-red-600" />
        </span>
        <span className="text-sm font-medium text-neutral-800">
          {data.name}
        </span>
      </div>
    </div>
  )
}
