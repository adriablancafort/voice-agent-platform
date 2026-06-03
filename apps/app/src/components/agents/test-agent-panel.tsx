import { PlayIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { useAgentStore } from "@/stores/agent"

export function TestAgentPanel() {
  const openTestPanel = useAgentStore((state) => state.openTestPanel)

  return (
    <Button variant="outline" onClick={openTestPanel}>
      <PlayIcon />
      Test
    </Button>
  )
}
