import type {
  CallVariableValues,
  CompleteCallRequest,
  CompleteCallResponse,
  StartCallResponse,
  StartPhoneCallRequest,
  StartWebCallRequest,
} from "@workspace/shared/api/calls/types"
import { api } from "@/lib/api"

export function startCall(
  attributes: CallVariableValues,
  livekitRoomName: string
) {
  const startedAt = new Date().toISOString()

  if (attributes.channel === "web_call") {
    const agentId = attributes.agent_id

    if (!agentId) {
      throw new Error("agent_id is required for web_call sessions")
    }

    return api.post<StartCallResponse, StartWebCallRequest>(
      "/calls/start/web",
      {
        body: {
          agentId,
          agentVersionId: attributes.agent_version_id || null,
          livekitRoomName,
          startedAt,
        },
      }
    )
  }

  const toNumber = attributes["sip.trunkPhoneNumber"]

  if (!toNumber) {
    throw new Error("sip.trunkPhoneNumber is required for phone_call sessions")
  }

  return api.post<StartCallResponse, StartPhoneCallRequest>(
    "/calls/start/phone",
    {
      body: {
        toNumber,
        fromNumber: attributes["sip.phoneNumber"],
        livekitRoomName,
        startedAt,
      },
    }
  )
}

export function completeCall(callId: string) {
  const endedAt = new Date().toISOString()

  return api.post<CompleteCallResponse, CompleteCallRequest>(
    "/calls/complete",
    {
      body: {
        callId,
        endedAt,
      },
    }
  )
}
