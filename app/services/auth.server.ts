import { createCookieSessionStorage } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import invariant from 'tiny-invariant'
import { strategy as GoogleStrategy } from './auth/google-auth.server'
import { getUserById } from '~/models/user.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export interface SessionUser {
  userId: string
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

export const auth = new Authenticator<SessionUser>(sessionStorage)
auth.use(GoogleStrategy)

export const requireLogin = async (request: Request, failureRedirect = '/') => {
  const { userId } = await auth.isAuthenticated(request, {
    failureRedirect: '/',
  })
  const user = await getUserById(userId)
  if (!user) {
    return await auth.logout(request, { redirectTo: '/' })
  }
  return user
}
