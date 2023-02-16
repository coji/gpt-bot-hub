import { createCookieSessionStorage } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import invariant from 'tiny-invariant'
import { strategy as GoogleStrategy } from './auth/google-auth.server'

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
