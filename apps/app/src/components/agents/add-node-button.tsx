import { Panel } from "@xyflow/react"
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
    <Panel position="top-left">
      <Collapsible open={open} onOpenChange={setOpen} className="w-48">
        <CollapsibleTrigger>
          <Button variant="outline">
            <Plus />
            Add node
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => handleAdd("start")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300">
              <Play className="h-4 w-4 text-green-600" />
            </span>
            Start
          </button>
          <button
            onClick={() => handleAdd("conversation")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300">
              <Phone className="h-4 w-4 text-blue-600" />
            </span>
            Conversation
          </button>
          <button
            onClick={() => handleAdd("end")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300">
              <PhoneOff className="h-4 w-4 text-red-600" />
            </span>
            End
          </button>
        </CollapsibleContent>
      </Collapsible>
    </Panel>
  )
}
