import type { ChangeEvent } from "react"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useAgentStore } from "@/stores/agent"

const STT_MODEL_OPTIONS = [
  "deepgram/flux-general",
  "deepgram/nova-3",
  "deepgram/nova-3-medical",
  "deepgram/nova-2",
  "deepgram/nova-2-medical",
  "deepgram/nova-2-conversationalai",
  "deepgram/nova-2-phonecall",
  "cartesia/ink-whisper",
  "assemblyai/universal-streaming",
  "assemblyai/universal-streaming-multilingual",
  "elevenlabs/scribe_v2_realtime",
  "xai/stt-1",
] as const

const LLM_MODEL_OPTIONS = [
  "openai/gpt-5.4",
  "openai/gpt-5.3-chat-latest",
  "openai/gpt-5.2",
  "openai/gpt-5.2-chat-latest",
  "openai/gpt-5.1",
  "openai/gpt-5.1-chat-latest",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-4.1",
  "openai/gpt-4.1-mini",
  "openai/gpt-4.1-nano",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-oss-120b",
  "google/gemini-3-pro",
  "google/gemini-3-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.0-flash",
  "google/gemini-2.0-flash-lite",
  "moonshotai/kimi-k2-instruct",
  "deepseek-ai/deepseek-v3",
  "deepseek-ai/deepseek-v3.2",
  "xai/grok-4-1-fast-non-reasoning",
  "xai/grok-4-1-fast-reasoning",
  "xai/grok-4.20-0309-non-reasoning",
  "xai/grok-4.20-0309-reasoning",
  "xai/grok-4.20-multi-agent-0309",
] as const

const TTS_MODEL_OPTIONS = [
  "cartesia/sonic-3",
  "cartesia/sonic-2",
  "cartesia/sonic-turbo",
  "cartesia/sonic",
  "deepgram/aura",
  "deepgram/aura-2",
  "elevenlabs/eleven_flash_v2",
  "elevenlabs/eleven_flash_v2_5",
  "elevenlabs/eleven_turbo_v2",
  "elevenlabs/eleven_turbo_v2_5",
  "elevenlabs/eleven_multilingual_v2",
  "inworld/inworld-tts-2",
  "inworld/inworld-tts-1.5-max",
  "inworld/inworld-tts-1.5-mini",
  "inworld/inworld-tts-1-max",
  "inworld/inworld-tts-1",
  "rime/arcana",
  "rime/mistv2",
] as const

export function ModelsConfigPanel() {
  const sttModel = useAgentStore((state) => state.draftConfig.stt.model)
  const llmModel = useAgentStore((state) => state.draftConfig.llm.model)
  const ttsModel = useAgentStore((state) => state.draftConfig.tts.model)
  const ttsVoice = useAgentStore((state) => state.draftConfig.tts.voice ?? "")
  const setSttModel = useAgentStore((state) => state.setSttModel)
  const setLlmModel = useAgentStore((state) => state.setLlmModel)
  const setTtsModel = useAgentStore((state) => state.setTtsModel)
  const setTtsVoice = useAgentStore((state) => state.setTtsVoice)

  function handleVoiceChange(event: ChangeEvent<HTMLInputElement>) {
    setTtsVoice(event.target.value)
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>STT</FieldLabel>
        <Select value={sttModel} onValueChange={setSttModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select STT model" />
          </SelectTrigger>
          <SelectContent>
            {STT_MODEL_OPTIONS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>LLM</FieldLabel>
        <Select value={llmModel} onValueChange={setLlmModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select LLM model" />
          </SelectTrigger>
          <SelectContent>
            {LLM_MODEL_OPTIONS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>TTS</FieldLabel>
        <Select value={ttsModel} onValueChange={setTtsModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select TTS model" />
          </SelectTrigger>
          <SelectContent>
            {TTS_MODEL_OPTIONS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>TTS voice</FieldLabel>
        <Input
          value={ttsVoice}
          onChange={handleVoiceChange}
          placeholder="Voice id or name"
        />
      </Field>
    </FieldGroup>
  )
}
