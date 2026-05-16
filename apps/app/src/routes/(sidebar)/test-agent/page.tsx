import { createFileRoute } from "@tanstack/react-router"
import { VoiceAgentClient } from "@/components/voice-agent-client"

export const Route = createFileRoute("/(sidebar)/test-agent/")({
  component: Page,
})

function Page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <VoiceAgentClient />
    </div>
  )
}
