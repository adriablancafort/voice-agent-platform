import type { AgentConfig } from "./types"

export function createDefaultAgentConfig(): AgentConfig {
  return {
    name: "Untitled Agent",
    stt: {
      model: "deepgram/nova-3",
      language: "multi",
    },
    llm: {
      model: "openai/gpt-4.1-mini",
    },
    tts: {
      model: "cartesia/sonic-3",
      voice: "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
    },
    turnDetection: {
      model: "multilingual",
    },
    globalPrompt: "You are a helpful assistant",
    nodes: [
      {
        id: "conversation",
        type: "conversation",
        position: { x: 0, y: 0 },
        data: {
          name: "Greeting",
          isStart: true,
          startSpeaker: "agent",
          instructions: {
            type: "prompt",
            text: "Greet the user and ask how you can help",
          },
        },
      },
      {
        id: "end",
        type: "end",
        position: { x: 0, y: 250 },
        data: {
          name: "End Call",
        },
      },
    ],
    edges: [
      {
        id: "edge",
        source: "conversation",
        target: "end",
        data: {
          condition: "Conversation completed",
        },
      },
    ],
  }
}
