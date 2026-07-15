import type {
  CallDispatchMetadata,
  CallVariableValues,
  CompleteCallRequest,
  CompleteCallResponse,
  StartCallResponse,
  StartInboundCallRequest,
  StartOutboundCallRequest,
  StartWebCallRequest,
} from "@workspace/shared/api/calls/types"
import { api } from "@/lib/api"
import { parseJsonObject } from "@/lib/json"

export function parseDispatchMetadata(metadata: string | undefined) {
  return parseJsonObject(metadata) as CallDispatchMetadata
}

export function startCall(
  attributes: CallVariableValues,
  metadata: CallDispatchMetadata,
  livekitRoomName: string
) {
  const startedAt = new Date().toISOString()

  if (metadata.direction === "outbound") {
    if (!metadata.agentId || !metadata.fromNumber || !metadata.toNumber) {
      throw new Error(
        "Outbound calls require agentId, fromNumber and toNumber in dispatch metadata"
      )
    }

    return api.post<StartCallResponse, StartOutboundCallRequest>(
      "/calls/start/outbound",
      {
        body: {
          agentId: metadata.agentId,
          agentVersionId: metadata.agentVersionId ?? null,
          fromNumber: metadata.fromNumber,
          toNumber: metadata.toNumber,
          livekitRoomName,
          startedAt,
        },
      }
    )
  }

  if (metadata.direction === "inbound") {
    const toNumber = attributes["sip.trunkPhoneNumber"]

    if (!toNumber) {
      throw new Error("Inbound calls require a sip.trunkPhoneNumber attribute")
    }

    return api.post<StartCallResponse, StartInboundCallRequest>(
      "/calls/start/inbound",
      {
        body: {
          toNumber,
          fromNumber: attributes["sip.phoneNumber"] ?? "",
          livekitRoomName,
          startedAt,
        },
      }
    )
  }

  const agentId = attributes.agent_id

  if (!agentId) {
    throw new Error("Web calls require an agent_id attribute")
  }

  return api.post<StartCallResponse, StartWebCallRequest>("/calls/start/web", {
    body: {
      agentId,
      agentVersionId: attributes.agent_version_id || null,
      livekitRoomName,
      startedAt,
    },
  })
}

export function completeCall(
  callId: string,
  status: CompleteCallRequest["status"],
  transcript: CompleteCallRequest["transcript"],
  variables: CompleteCallRequest["variables"]
) {
  const endedAt = new Date().toISOString()

  return api.post<CompleteCallResponse, CompleteCallRequest>(
    "/calls/complete",
    {
      body: {
        callId,
        endedAt,
        status,
        transcript,
        variables,
      },
    }
  )
}
