import { PlayIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { useAgentStore } from "@/stores/agent"

export function TestAgentButton() {
  const setSidePanel = useAgentStore((state) => state.setSidePanel)

  return (
    <Button variant="outline" onClick={() => setSidePanel({ kind: "test" })}>
      <PlayIcon />
      Test
    </Button>
  )
}
