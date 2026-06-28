import { SIPOutboundConfig } from "@livekit/protocol"
import {
  AgentDispatchClient,
  RoomAgentDispatch,
  RoomConfiguration,
  SipClient,
} from "livekit-server-sdk"

import type { CallVariableValues } from "@workspace/shared/api/calls/types"
import { env } from "@/lib/env"

const ROOM_PREFIX = "call-"

function createSipClient() {
  return new SipClient(
    env.LIVEKIT_URL,
    env.LIVEKIT_API_KEY,
    env.LIVEKIT_API_SECRET
  )
}

function createAgentDispatchClient() {
  return new AgentDispatchClient(
    env.LIVEKIT_URL,
    env.LIVEKIT_API_KEY,
    env.LIVEKIT_API_SECRET
  )
}

type SipPhoneNumber = {
  number: string
  sipUsername: string | null
  sipPassword: string | null
}

export async function provisionInbound(phoneNumber: SipPhoneNumber) {
  if (!phoneNumber.sipUsername) return

  const sip = createSipClient()

  const trunk = await sip.createSipInboundTrunk(phoneNumber.number, [
    phoneNumber.number,
  ])

  await sip.createSipDispatchRule(
    { type: "individual", roomPrefix: ROOM_PREFIX },
    {
      name: phoneNumber.number,
      trunkIds: [trunk.sipTrunkId],
      roomConfig: new RoomConfiguration({
        agents: [
          new RoomAgentDispatch({
            agentName: env.LIVEKIT_AGENT_NAME,
            metadata: JSON.stringify({ direction: "inbound" }),
          }),
        ],
      }),
    }
  )
}

export async function deprovisionInbound(phoneNumber: { number: string }) {
  const sip = createSipClient()

  const trunks = await sip.listSipInboundTrunk({
    numbers: [phoneNumber.number],
  })

  for (const trunk of trunks) {
    const rules = await sip.listSipDispatchRule({
      trunkIds: [trunk.sipTrunkId],
    })
    for (const rule of rules) {
      await sip.deleteSipDispatchRule(rule.sipDispatchRuleId)
    }
    await sip.deleteSipTrunk(trunk.sipTrunkId)
  }
}

type OutboundCall = {
  agentId: string
  agentVersionId: string | null
  fromNumber: string
  toNumber: string
  sipAddress: string
  sipUsername: string
  sipPassword: string
  variables: CallVariableValues
}

export async function placeOutboundCall(call: OutboundCall) {
  const roomName = `${ROOM_PREFIX}${crypto.randomUUID()}`

  const dispatch = createAgentDispatchClient()
  await dispatch.createDispatch(roomName, env.LIVEKIT_AGENT_NAME, {
    metadata: JSON.stringify({
      direction: "outbound",
      agentId: call.agentId,
      agentVersionId: call.agentVersionId,
      fromNumber: call.fromNumber,
      toNumber: call.toNumber,
    }),
  })

  const sip = createSipClient()
  await sip.createSipParticipant(
    "",
    call.toNumber,
    roomName,
    {
      fromNumber: call.fromNumber,
      participantIdentity: call.toNumber,
      participantAttributes: {
        variable_values: JSON.stringify(call.variables),
      },
    },
    new SIPOutboundConfig({
      hostname: call.sipAddress,
      authUsername: call.sipUsername,
      authPassword: call.sipPassword,
    })
  )
}
