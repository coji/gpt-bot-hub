import type { LineChatMessageLog } from '@prisma/client'
import { prisma } from '~/services/db.server'
export type { LineChatMessageLog } from '@prisma/client'

export const createLineChatMessageLog = async (
  data: Omit<LineChatMessageLog, 'id' | 'createdAt' | 'updatedAt'>,
) => {
  await prisma.lineChatMessageLog.create({
    data,
  })
}

export const getLineChatMessageLog = async (userId: string, limit = 30) => {
  return await prisma.lineChatMessageLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}
