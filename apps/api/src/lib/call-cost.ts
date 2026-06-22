import type { CallChannel } from "@workspace/shared/api/calls/types"
import { getModelPricePerMinute } from "@workspace/shared/models/helpers"
import {
  PLATFORM_USD_PER_MINUTE,
  TELEPHONY_USD_PER_MINUTE,
} from "@workspace/shared/models/rates"

export function computeCallCosts({
  durationMs,
  channel,
  sttModel,
  llmModel,
  ttsModel,
}: {
  durationMs: number
  channel: CallChannel
  sttModel: string
  llmModel: string
  ttsModel: string
}) {
  const minutes = durationMs / 60_000
  const stt = minutes * getModelPricePerMinute("stt", sttModel)
  const llm = minutes * getModelPricePerMinute("llm", llmModel)
  const tts = minutes * getModelPricePerMinute("tts", ttsModel)
  const telephony =
    channel === "phone_call" ? minutes * TELEPHONY_USD_PER_MINUTE : 0
  const platform = minutes * PLATFORM_USD_PER_MINUTE

  return {
    stt,
    llm,
    tts,
    telephony,
    platform,
    total: stt + llm + tts + platform + telephony,
  }
}
