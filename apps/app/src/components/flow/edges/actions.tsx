import { useReactFlow } from "@xyflow/react"
import { Trash2Icon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type FlowEdgeActionsProps = {
  id: string
}

export function FlowEdgeActions({ id }: FlowEdgeActionsProps) {
  const { deleteElements } = useReactFlow()

  return (
    <div className="nopan nodrag absolute top-1/2 left-full ml-2 -translate-y-1/2">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-sm border border-border bg-popover text-destructive transition-colors hover:bg-muted"
              onClick={() => deleteElements({ edges: [{ id }] })}
            />
          }
        >
          <Trash2Icon className="size-3.5" />
          <span className="sr-only">Delete</span>
        </TooltipTrigger>
        <TooltipContent side="right">Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
