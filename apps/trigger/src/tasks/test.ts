import { logger, task, wait } from "@trigger.dev/sdk"

export const testTask = task({
  id: "test",
  run: async (payload: any, { ctx }) => {
    logger.log("Test", { payload, ctx })

    await wait.for({ seconds: 5 })

    return {
      message: "Test",
    }
  },
})
