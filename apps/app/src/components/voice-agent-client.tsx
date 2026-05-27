import {
  RoomAudioRenderer,
  SessionProvider,
  useSession,
  useVoiceAssistant,
} from "@livekit/components-react"
import { ConnectionState, TokenSource } from "livekit-client"
import { PhoneIcon, PhoneOffIcon } from "lucide-react"
import { AgentAudioVisualizerRadial } from "@workspace/ui/components/agents-ui/agent-audio-visualizer-radial"
import { Button } from "@workspace/ui/components/button"
import { env } from "@/lib/env"

const tokenSource = TokenSource.endpoint(`${env.API_URL}/api/token`)

function AgentAudioVisualizer() {
  const { state, audioTrack } = useVoiceAssistant()
  return (
    <AgentAudioVisualizerRadial
      size="lg"
      state={state}
      audioTrack={audioTrack}
    />
  )
}

type VoiceAgentClientProps = {
  agentId: string
}

export function VoiceAgentClient({ agentId }: VoiceAgentClientProps) {
  const session = useSession(tokenSource, {
    participantAttributes: {
      agent_id: agentId,
    },
  })

  async function handleConnect() {
    await session.start()
  }

  async function handleDisconnect() {
    await session.end()
  }

  const isConnected = session.isConnected
  const isConnecting = session.connectionState === ConnectionState.Connecting

  return (
    <SessionProvider session={session}>
      <div className="flex flex-col gap-8">
        {isConnected ? (
          <>
            <RoomAudioRenderer />
            <AgentAudioVisualizer />
            <Button variant="destructive" onClick={handleDisconnect}>
              <PhoneOffIcon />
              End call
            </Button>
          </>
        ) : (
          <>
            <AgentAudioVisualizerRadial
              size="lg"
              state={isConnecting ? "connecting" : "disconnected"}
            />
            <Button onClick={handleConnect} disabled={isConnecting}>
              <PhoneIcon />
              {isConnecting ? "Calling..." : "Call"}
            </Button>
          </>
        )}
      </div>
    </SessionProvider>
  )
}
