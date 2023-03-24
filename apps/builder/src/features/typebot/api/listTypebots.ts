import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@typebot.io/prisma'
import { PublicTypebot, Typebot, typebotSchema } from '@typebot.io/schemas'
import { omit } from '@typebot.io/lib'
import { z } from 'zod'

export const listTypebots = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots',
      protect: true,
      summary: 'List typebots',
      tags: ['Typebot'],
    },
  })
  .input(z.object({ workspaceId: z.string(), folderId: z.string().optional() }))
  .output(
    z.object({
      typebots: z.array(
        typebotSchema
          .pick({
            name: true,
            icon: true,
            id: true,
          })
          .merge(z.object({ publishedTypebotId: z.string().optional() }))
      ),
    })
  )
  .query(async ({ input: { workspaceId, folderId }, ctx: { user } }) => {
    const typebots = (await prisma.typebot.findMany({
      where: {
        OR: [
          {
            isArchived: { not: true },
            folderId: folderId === 'root' ? null : folderId,
            workspace: {
              id: workspaceId,
              members: {
                some: {
                  userId: user.id,
                  role: { not: WorkspaceRole.GUEST },
                },
              },
            },
          },
          {
            isArchived: { not: true },
            workspace: {
              id: workspaceId,
              members: {
                some: { userId: user.id, role: WorkspaceRole.GUEST },
              },
            },
            collaborators: { some: { userId: user.id } },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        publishedTypebot: { select: { id: true } },
        id: true,
        icon: true,
      },
    })) as (Pick<Typebot, 'name' | 'id' | 'icon'> & {
      publishedTypebot: Pick<PublicTypebot, 'id'>
    })[]

    if (!typebots)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No typebots found' })

    return {
      typebots: typebots.map((typebot) => ({
        publishedTypebotId: typebot.publishedTypebot?.id,
        ...omit(typebot, 'publishedTypebot'),
      })),
    }
  })
