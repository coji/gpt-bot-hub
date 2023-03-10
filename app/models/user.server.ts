import type { User } from '@prisma/client'
import { prisma } from '~/services/db.server'
export type { User } from '@prisma/client'

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
) {
  return prisma.user.create({
    data,
  })
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } })
}
