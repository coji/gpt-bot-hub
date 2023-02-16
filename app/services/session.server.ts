import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { getUserById } from '~/models/user.server'
import invariant from 'tiny-invariant'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

const USER_SESSION_KEY = 'userId'
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
})

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request)
  return session.get(USER_SESSION_KEY) as string | undefined
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = getUserById(userId)
  if (!user) throw await logout(request)

  return user
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request)
  if (userId) return userId
  if (redirectTo === '/') {
    throw redirect('/login')
  } else {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams.toString()}`)
  }
}

export async function requireAdminUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request)
  if (userId) return userId
  if (redirectTo === '/admin') {
    throw redirect('/admin/login')
  } else {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/admin/login?${searchParams.toString()}`)
  }
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = getUserById(userId)
  if (!user) throw await logout(request)

  return user
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}
