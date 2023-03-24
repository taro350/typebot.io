import { billingRouter } from '@/features/billing/api/router'
import { webhookRouter } from '@/features/blocks/integrations/webhook/api/router'
import { credentialsRouter } from '@/features/credentials/api/router'
import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { resultsRouter } from '@/features/results/api/router'
import { processTelemetryEvent } from '@/features/telemetry/api/processTelemetryEvent'
import { typebotRouter } from '@/features/typebot/api/router'
import { workspaceRouter } from '@/features/workspace/api/router'
import { router } from '../../trpc'

export const trpcRouter = router({
  getAppVersionProcedure,
  processTelemetryEvent,
  workspace: workspaceRouter,
  typebot: typebotRouter,
  webhook: webhookRouter,
  results: resultsRouter,
  billing: billingRouter,
  credentials: credentialsRouter,
})

export type AppRouter = typeof trpcRouter
