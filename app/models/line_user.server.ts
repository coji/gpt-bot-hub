import type { LineUser } from '@prisma/client'
import { prisma } from '~/services/db.server'
export type { LineUser } from '@prisma/client'

export async function getLineUserById(id: LineUser['id']) {
  return prisma.lineUser.findUnique({ where: { id } })
}

export async function getLineUserByLineId(line_id: LineUser['line_id']) {
  return prisma.lineUser.findUnique({ where: { line_id } })
}

export async function createLineUser(
  data: Omit<LineUser, 'id' | 'createdAt' | 'updatedAt'>,
) {
  return prisma.lineUser.create({
    data,
  })
}

export async function deleteLineUserByEmail(line_id: LineUser['line_id']) {
  return prisma.lineUser.delete({ where: { line_id } })
}
