import type { LoaderArgs } from '@remix-run/node'
import { auth } from '~/services/auth.server'

export const loader = async ({ request }: LoaderArgs) => {
  return await auth.authenticate('google', request, {
    successRedirect: '/private',
    failureRedirect: '/',
  })
}
