import type { ActionArgs } from '@remix-run/node'
import { auth } from '~/services/auth.server'

export const action = async ({ request }: ActionArgs) => {
  await auth.logout(request, {
    redirectTo: '/',
  })
}
