import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebots } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { groups: true },
    })
    if (!typebot) return notFound(res)
    return res.send({ groups: typebot.groups })
  }
  methodNotAllowed(res)
}

export default handler
