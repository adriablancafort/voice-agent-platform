import {
  RoomAgentDispatch,
  RoomConfiguration,
  SipClient,
} from "livekit-server-sdk"

import { env } from "@/lib/env"

function createSipClient() {
  return new SipClient(
    env.LIVEKIT_URL,
    env.LIVEKIT_API_KEY,
    env.LIVEKIT_API_SECRET
  )
}

const ROOM_PREFIX = "call-"

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
        agents: [new RoomAgentDispatch({ agentName: env.LIVEKIT_AGENT_NAME })],
      }),
    }
  )
}

export async function deprovisionInbound(phoneNumber: { number: string }) {
  const sip = createSipClient()

  try {
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
  } catch (error) {
    console.error("Failed to deprovision inbound SIP", error)
  }
}
