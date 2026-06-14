import { Phone, PhoneOff, Play, Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { useAgentStore } from "@/stores/agent"

export function AddNodeButton() {
  const [open, setOpen] = useState(false)
  const addNode = useAgentStore((state) => state.addNode)
  const nodes = useAgentStore((state) => state.draftConfig.nodes)

  function handleAdd(type: "start" | "conversation" | "end") {
    const id = `${type}-${Date.now()}`
    const offset = nodes.length * 50

    if (type === "start") {
      addNode({
        id,
        type: "conversation",
        position: { x: 100 + offset, y: 100 + offset },
        data: {
          name: "Start Conversation",
          isStart: true,
          startSpeaker: "agent",
          instructions: {
            type: "prompt",
            text: "Greet the user and ask how you can help",
          },
        },
      })
    } else if (type === "conversation") {
      addNode({
        id,
        type: "conversation",
        position: { x: 100 + offset, y: 100 + offset },
        data: {
          name: "New Conversation",
          instructions: {
            type: "prompt",
            text: "Enter instructions here",
          },
        },
      })
    } else if (type === "end") {
      addNode({
        id,
        type: "end",
        position: { x: 100 + offset, y: 300 + offset },
        data: { name: "End Call" },
      })
    }

    setOpen(false)
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-48">
      <div className="relative">
        <CollapsibleTrigger>
          <Button>
            <Plus />
            Add node
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="absolute top-full left-0 z-20 mt-2 w-full rounded-md border border-border bg-popover text-popover-foreground text-sm font-medium py-1 shadow-lg">
          <button
            onClick={() => handleAdd("start")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-border">
              <Play className="h-4 w-4 text-green-600" />
            </span>
            Start
          </button>
          <button
            onClick={() => handleAdd("conversation")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-border">
              <Phone className="h-4 w-4 text-blue-600" />
            </span>
            Conversation
          </button>
          <button
            onClick={() => handleAdd("end")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-muted"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-border">
              <PhoneOff className="h-4 w-4 text-red-600" />
            </span>
            End
          </button>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
