import { db } from "@workspace/db/client"
import { clearSipConfig, provisionInbound } from "@/lib/livekit"

const cleared = await clearSipConfig()

console.log(
  `Cleared ${cleared.deletedDispatchRules} dispatch rules, ${cleared.deletedInboundTrunks} inbound trunks, ${cleared.deletedOutboundTrunks} outbound trunks`
)

const phoneNumbers = await db.query.phoneNumbersTable.findMany({
  columns: {
    number: true,
    sipUsername: true,
    sipPassword: true,
  },
})

for (const phoneNumber of phoneNumbers) {
  await provisionInbound(phoneNumber)
}

console.log(`Checked ${phoneNumbers.length} phone numbers`)
