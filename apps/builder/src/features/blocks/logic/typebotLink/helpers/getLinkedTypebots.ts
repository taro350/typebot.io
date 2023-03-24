import prisma from '@/lib/prisma'
import { canReadTypebots } from '@/helpers/databaseRules'
import { User } from '@typebot.io/prisma'
import {
  LogicBlockType,
  PublicTypebot,
  Typebot,
  TypebotLinkBlock,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'

export const getLinkedTypebots = async (
  typebot: Pick<PublicTypebot, 'groups'>,
  user?: User
): Promise<(Typebot | PublicTypebot)[]> => {
  const linkedTypebotIds = (
    typebot.groups
      .flatMap((g) => g.blocks)
      .filter(
        (s) =>
          s.type === LogicBlockType.TYPEBOT_LINK &&
          isDefined(s.options.typebotId)
      ) as TypebotLinkBlock[]
  ).map((s) => s.options.typebotId as string)
  if (linkedTypebotIds.length === 0) return []
  const typebots = (await ('typebotId' in typebot
    ? prisma.publicTypebot.findMany({
        where: { id: { in: linkedTypebotIds } },
      })
    : prisma.typebot.findMany({
        where: user
          ? {
              AND: [
                { id: { in: linkedTypebotIds } },
                canReadTypebots(linkedTypebotIds, user as User),
              ],
            }
          : { id: { in: linkedTypebotIds } },
      }))) as unknown as (Typebot | PublicTypebot)[]
  return typebots
}
