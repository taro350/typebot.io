import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { Plan } from '@typebot.io/prisma'
import { defaultSettings } from '@typebot.io/schemas'
import {
  createWorkspaces,
  importTypebotInDatabase,
  injectFakeResults,
} from '@typebot.io/lib/playwright/databaseActions'

test('should not start if chat limit is reached', async ({ page, context }) => {
  await test.step('Free plan', async () => {
    const workspaceId = createId()
    const typebotId = createId()
    await createWorkspaces([{ id: workspaceId, plan: Plan.FREE }])
    await importTypebotInDatabase(getTestAsset('typebots/fileUpload.json'), {
      id: typebotId,
      publicId: `${typebotId}-public`,
      workspaceId,
    })
    await injectFakeResults({ typebotId, count: 400 })
    await page.goto(`/${typebotId}-public`)
    await expect(page.locator('text="This bot is now closed."')).toBeVisible()
    await page.goto(`${process.env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
    await expect(page.locator('text="133%"')).toBeVisible()
  })

  await test.step('Lifetime plan', async () => {
    const workspaceId = createId()
    const typebotId = createId()
    await createWorkspaces([{ id: workspaceId, plan: Plan.LIFETIME }])
    await importTypebotInDatabase(getTestAsset('typebots/fileUpload.json'), {
      id: typebotId,
      publicId: `${typebotId}-public`,
      workspaceId,
    })
    await injectFakeResults({ typebotId, count: 3000 })
    await page.goto(`/${typebotId}-public`)
    await expect(page.locator('text="Hey there, upload please"')).toBeVisible()
  })

  await test.step('Custom plan', async () => {
    const workspaceId = createId()
    const typebotId = createId()
    await createWorkspaces([
      { id: workspaceId, plan: Plan.CUSTOM, customChatsLimit: 1000 },
    ])
    await importTypebotInDatabase(getTestAsset('typebots/fileUpload.json'), {
      id: typebotId,
      publicId: `${typebotId}-public`,
      workspaceId,
      settings: {
        ...defaultSettings,
        general: {
          ...defaultSettings.general,
          isNewResultOnRefreshEnabled: true,
        },
      },
    })
    const page = await context.newPage()
    await page.goto(`/${typebotId}-public`)
    await expect(page.locator('text="Hey there, upload please"')).toBeVisible()
    await injectFakeResults({ typebotId, count: 2000 })
    await page.goto(`/${typebotId}-public`)
    await expect(page.locator('text="This bot is now closed."')).toBeVisible()
    await page.goto(`${process.env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
    await expect(page.locator('text="200%"')).toBeVisible()
  })
})
